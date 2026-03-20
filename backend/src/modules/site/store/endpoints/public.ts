import { FastifyPluginAsync } from "fastify";
import { db, schema, and, eq, or, ilike, desc, count, isNull, inArray, asc, isNotNull, gt, gte, lte, sql } from "../../../../lib/db.js";
import { z } from "zod";
import { productSearchService } from "../../../../services/search/product-search.service.js";
import { buildCacheKey } from "../../../../lib/cache.js";
import { enrichProductCampaigns, enrichProductsWithCampaigns, normalizeCampaignDate } from "../../../../lib/product-campaigns.js";

const productsQuerySchema = z.object({
    limit: z.coerce.number().default(50),
    offset: z.coerce.number().default(0),
    collection: z.string().optional(),
    brand: z.string().optional(),
    q: z.string().optional(),
    shippingMethodId: z.string().optional(),
    onSale: z.coerce.boolean().optional(),
    inStock: z.coerce.boolean().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    sortBy: z.enum(["popularity", "price_asc", "price_desc"]).optional().default("popularity"),
});

const bannersQuerySchema = z.object({
    position: z.string().optional(),
    enabled: z.coerce.boolean().optional(),
    collectionId: z.string().optional(),
    collection: z.string().optional(),
});

export const storePublicRoutes: FastifyPluginAsync = async (fastify) => {
    const TTL = {
        productsList: 60,
        productSearch: 60,
        productDetail: 300,
        brands: 1800,
        collections: 1800,
        banners: 120,
        homepageCollections: 120,
        campaigns: 120,
        shipping: 900,
        policies: 3600,
    };

    // Helper to get all sub-collection IDs recursively
    const getRecursiveCollectionIds = async (parentId: string): Promise<string[]> => {
        const children = await db.query.collections.findMany({
            where: eq(schema.collections.parentId, parentId),
            columns: { id: true }
        });

        let ids = [parentId];
        for (const child of children) {
            const subIds = await getRecursiveCollectionIds(child.id);
            ids = [...ids, ...subIds];
        }
        return ids;
    };

    // Products
    fastify.get("/products", {
        schema: {
            tags: ["Catalog"],
            querystring: productsQuerySchema
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const {
            limit,
            offset,
            collection,
            brand,
            q,
            shippingMethodId,
            onSale,
            inStock,
            minPrice,
            maxPrice,
            sortBy,
        } = request.query as z.infer<typeof productsQuerySchema>;

        const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
        const parsedOffset = Math.max(Number(offset) || 0, 0);

        const cacheKey = buildCacheKey("store:products:list", {
            ...(request.query as Record<string, unknown>),
            limit: parsedLimit,
            offset: parsedOffset,
        } as any);
        const cached = await fastify.cache.get<{
            products: any[];
            pagination: {
                total: number;
                limit: number;
                offset: number;
                currentPage: number;
                totalPages: number;
                hasMore: boolean;
            };
        }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.productsList}`);
            return cached;
        }

        const whereClauses = [eq(schema.products.enabled, true)];

        if (collection) {
            const col = await db.query.collections.findFirst({
                where: eq(schema.collections.slug, collection)
            });

            if (col) {
                // Get this collection and all its children IDs recursively
                const allCollectionIds = await getRecursiveCollectionIds(col.id);

                const productConnections = await db.select({ productId: schema.productCollections.productId })
                    .from(schema.productCollections)
                    .where(inArray(schema.productCollections.collectionId, allCollectionIds));

                const productIds = productConnections.map((p: any) => p.productId);

                if (productIds.length > 0) {
                    whereClauses.push(inArray(schema.products.id, productIds));
                } else {
                    whereClauses.push(eq(schema.products.id, "___none___"));
                }
            } else {
                whereClauses.push(eq(schema.products.id, "___none___"));
            }
        }
        if (brand) {
            whereClauses.push(eq(schema.products.brandId, brand));
        }
        if (shippingMethodId) {
            whereClauses.push(eq(schema.products.shippingMethodId, shippingMethodId));
        }
        if (onSale) {
            whereClauses.push(isNotNull(schema.products.salePrice));
        }
        if (inStock) {
            whereClauses.push(gt(schema.products.stockOnHand, 0));
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceExpr = sql<number>`coalesce(${schema.products.salePrice}, ${schema.products.originalPrice}, 0)`;
            if (Number.isFinite(minPrice)) {
                whereClauses.push(gte(priceExpr, Number(minPrice)));
            }
            if (Number.isFinite(maxPrice)) {
                whereClauses.push(lte(priceExpr, Number(maxPrice)));
            }
        }
        if (q) {
            whereClauses.push(or(
                ilike(schema.products.name, `%${q}%`),
                ilike(schema.products.description, `%${q}%`)
            )!);
        }

        const whereClause = and(...whereClauses);
        const [{ count: totalCountRaw }] = await db
            .select({ count: count() })
            .from(schema.products)
            .where(whereClause);
        const total = Number(totalCountRaw || 0);
        const totalPages = Math.max(1, Math.ceil(total / parsedLimit));
        const currentPage = Math.floor(parsedOffset / parsedLimit) + 1;

        const orderBy =
            sortBy === "price_asc"
                ? [asc(schema.products.salePrice), asc(schema.products.createdAt)]
                : sortBy === "price_desc"
                    ? [desc(schema.products.salePrice), desc(schema.products.createdAt)]
                    : [desc(schema.products.createdAt)];

        const results = await db.query.products.findMany({
            where: whereClause,
            limit: parsedLimit,
            offset: parsedOffset,
            orderBy,
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            }
        });
        const payload = {
            products: enrichProductsWithCampaigns(results, { onlyActive: true }),
            pagination: {
                total,
                limit: parsedLimit,
                offset: parsedOffset,
                currentPage,
                totalPages,
                hasMore: parsedOffset + parsedLimit < total,
            },
        };
        await fastify.cache.set(cacheKey, payload, TTL.productsList, ["products"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.productsList}`);
        return payload;
    });

    const searchQuerySchema = z.object({
        q: z.string(),
        limit: z.coerce.number().optional().default(20),
    });

    // Search
    fastify.get("/products/search", {
        schema: {
            tags: ["Catalog"],
            querystring: searchQuerySchema
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { q, limit } = request.query as z.infer<typeof searchQuerySchema>;
        const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const cacheKey = buildCacheKey("store:products:search", {
            q,
            limit: parsedLimit,
        } as any);
        const cached = await fastify.cache.get<{ products: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.productSearch}`);
            return cached;
        }

        const results = await productSearchService.searchStoreProducts(q, parsedLimit);
        const payload = { products: results };
        await fastify.cache.set(cacheKey, payload, TTL.productSearch, ["products"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.productSearch}`);
        return payload;
    });

    const productParamsSchema = z.object({
        idOrSlug: z.string()
    });

    // Show Product (by ID or Slug)
    fastify.get("/products/:idOrSlug", {
        schema: {
            tags: ["Catalog"],
            params: productParamsSchema
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { idOrSlug } = request.params as z.infer<typeof productParamsSchema>;

        const cacheKey = `store:products:detail:${idOrSlug}`;
        const cached = await fastify.cache.get<any>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.productDetail}`);
            return cached;
        }

        const product = await db.query.products.findFirst({
            where: or(eq(schema.products.id, idOrSlug), eq(schema.products.slug, idOrSlug)),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            }
        });
        if (!product) return reply.status(404).send({ message: "Product not found" });
        const payload = enrichProductCampaigns(product, { onlyActive: true });
        await fastify.cache.set(cacheKey, payload, TTL.productDetail, ["products"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.productDetail}`);
        return payload;
    });

    // Brands
    fastify.get("/brands", {
        schema: {
            tags: ["Catalog"],
            querystring: z.object({})
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:brands:list");
        const cached = await fastify.cache.get<{ brands: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.brands}`);
            return cached;
        }

        const results = await db.query.brands.findMany({});
        const payload = { brands: results };
        await fastify.cache.set(cacheKey, payload, TTL.brands, ["brands"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.brands}`);
        return payload;
    });

    const collectionsQuerySchema = z.object({
        includeChildren: z.coerce.boolean().optional().default(false),
        parentId: z.string().optional(),
        take: z.coerce.number().optional().default(1000),
        skip: z.coerce.number().optional().default(0),
    });

    // Collections
    fastify.get("/collections", {
        schema: {
            tags: ["Catalog"],
            querystring: collectionsQuerySchema
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { includeChildren, parentId, take, skip } = request.query as z.infer<typeof collectionsQuerySchema>;
        const { collections } = schema;

        const cacheKey = buildCacheKey("store:collections:list", request.query as any);
        const cached = await fastify.cache.get<{ collections: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.collections}`);
            return cached;
        }

        let whereClause = eq(collections.enabled, true);

        if (parentId !== undefined) {
            if (parentId === 'null') {
                whereClause = and(whereClause, isNull(collections.parentId)) as any;
            } else {
                whereClause = and(whereClause, eq(collections.parentId, parentId)) as any;
            }
        }

        const results = await db.query.collections.findMany({
            where: whereClause,
            limit: take,
            offset: skip,
            orderBy: [asc(collections.sortOrder)],
            with: {
                asset: true,
                ...(includeChildren ? {
                    children: {
                        where: eq(schema.collections.enabled, true),
                        orderBy: [asc(schema.collections.sortOrder)],
                        with: {
                            asset: true,
                            children: {
                                where: eq(schema.collections.enabled, true),
                                orderBy: [asc(schema.collections.sortOrder)],
                                with: { asset: true }
                            }
                        }
                    }
                } : {})
            }
        });
        const payload = { collections: results };
        await fastify.cache.set(cacheKey, payload, TTL.collections, ["collections"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.collections}`);
        return payload;
    });

    // Banners
    fastify.get("/banners", {
        schema: {
            tags: ["Marketing"],
            querystring: bannersQuerySchema
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { position, enabled, collectionId, collection } = request.query as z.infer<typeof bannersQuerySchema>;

        const cacheKey = buildCacheKey("store:banners:list", request.query as any);
        const cached = await fastify.cache.get<{ banners: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.banners}`);
            return cached;
        }

        const whereClauses: any[] = [
            eq(schema.banners.enabled, enabled ?? true),
        ];

        if (position) {
            whereClauses.push(eq(schema.banners.position, position as any));
        }

        let resolvedCollectionId = collectionId;
        if (!resolvedCollectionId && collection) {
            const matchedCollection = await db.query.collections.findFirst({
                where: eq(schema.collections.slug, collection),
                columns: { id: true }
            });

            if (!matchedCollection) {
                return { banners: [] };
            }

            resolvedCollectionId = matchedCollection.id;
        }

        if (resolvedCollectionId) {
            const collectionIds = collection
                ? await getRecursiveCollectionIds(resolvedCollectionId)
                : [resolvedCollectionId];

            whereClauses.push(inArray(schema.banners.collectionId, collectionIds));
        }

        const bannerWhereClause = whereClauses.length === 1
            ? whereClauses[0]
            : and(...whereClauses);

        const results = await db.query.banners.findMany({
            where: bannerWhereClause,
            orderBy: [asc(schema.banners.sortOrder)],
            with: {
                desktopImage: true,
                mobileImage: true,
                collection: true,
                product: true,
            }
        });
        const payload = { banners: results };
        await fastify.cache.set(cacheKey, payload, TTL.banners, ["banners"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.banners}`);
        return payload;
    });

    // Homepage Collections
    fastify.get("/homepage-collections", {
        schema: {
            tags: ["Marketing"],
            querystring: z.object({})
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:homepage-collections:list");
        const cached = await fastify.cache.get<{ collections: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.homepageCollections}`);
            return cached;
        }

        const results = await db.query.homepageCollections.findMany({
            where: eq(schema.homepageCollections.enabled, true),
            with: {
                products: {
                    with: {
                        product: {
                            with: {
                                assets: { with: { asset: true } },
                                campaignProducts: { with: { campaign: true } },
                            },
                        },
                    },
                },
            }
        });
        const payload = {
            collections: results.map((collection: any) => ({
                ...collection,
                products: (collection.products || []).map((entry: any) => ({
                    ...entry,
                    product: entry.product
                        ? enrichProductCampaigns(entry.product, { onlyActive: true })
                        : entry.product,
                })),
            })),
        };
        await fastify.cache.set(cacheKey, payload, TTL.homepageCollections, ["homepage-collections", "products", "campaigns"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.homepageCollections}`);
        return payload;
    });

    // Campaigns
    fastify.get("/campaigns", {
        schema: {
            tags: ["Marketing"],
            querystring: z.object({})
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:campaigns:list");
        const cached = await fastify.cache.get<{ campaigns: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.campaigns}`);
            return cached;
        }

        const results = await db.query.campaigns.findMany({
            where: eq(schema.campaigns.status, 'ACTIVE'),
        });
        const payload = { campaigns: results };
        await fastify.cache.set(cacheKey, payload, TTL.campaigns, ["campaigns"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.campaigns}`);
        return payload;
    });

    const cartValidateSchema = z.object({
        items: z.array(z.any())
    });

    const couponValidateSchema = z.object({
        code: z.string().min(1),
        subtotal: z.coerce.number().min(0),
        items: z.array(z.object({
            productId: z.string().optional(),
            variantId: z.string().optional(),
            price: z.coerce.number().min(0),
            quantity: z.coerce.number().min(1),
        })).optional(),
    });

    const parseIdArray = (value: string | string[] | null | undefined) => {
        if (!value) return [] as string[];
        if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);

        const raw = String(value).trim();
        if (!raw) return [] as string[];

        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item).trim()).filter(Boolean);
            }
        } catch {
            // Fallback to comma-separated format.
        }

        return raw.split(",").map((item) => item.trim()).filter(Boolean);
    };

    const fromKesMinorUnits = (value?: number | null) => {
        if (value === null || value === undefined) return 0;
        return Number(value) / 100;
    };

    // Cart Validation
    fastify.post("/cart/validate", {
        schema: {
            tags: ["Cart"],
            body: cartValidateSchema
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request) => {
        const { items } = request.body as z.infer<typeof cartValidateSchema>;
        return { valid: true, items };
    });

    // Coupon Validation (Campaigns)
    fastify.post("/coupons/validate", {
        schema: {
            tags: ["Marketing"],
            body: couponValidateSchema,
        },
        preHandler: [fastify.optionalStorefrontAuth, fastify.publicRateLimit],
    }, async (request, reply) => {
        const { code, subtotal, items = [] } = request.body as z.infer<typeof couponValidateSchema>;
        const normalizedCode = String(code).trim().toUpperCase();
        const userId = (request as any).storefrontUser?.id;

        if (!normalizedCode) {
            return reply.status(400).send({ error: "Coupon code is required" });
        }

        const campaign = await db.query.campaigns.findFirst({
            where: and(
                eq(schema.campaigns.status, "ACTIVE"),
                isNotNull(schema.campaigns.couponCode),
                ilike(schema.campaigns.couponCode, normalizedCode)
            ),
        });

        if (!campaign) {
            return reply.status(404).send({ error: "Invalid coupon code" });
        }

        const now = new Date();
        const startsAt = normalizeCampaignDate(campaign.startDate);
        const endsAt = normalizeCampaignDate(campaign.endDate);

        if (startsAt && startsAt > now) {
            return reply.status(400).send({ error: "Coupon is not yet active" });
        }

        if (endsAt && endsAt < now) {
            return reply.status(400).send({ error: "Coupon has expired" });
        }

        const hasDiscountType = campaign.discountType && campaign.discountType !== "NONE";
        if (!hasDiscountType) {
            return reply.status(400).send({ error: "Coupon is not applicable" });
        }

        if (campaign.usageLimit && campaign.usageLimit > 0) {
            const totalCountResult = await db
                .select({ count: count() })
                .from(schema.campaignRedemptions)
                .where(eq(schema.campaignRedemptions.campaignId, campaign.id));
            const totalCount = Number(totalCountResult[0]?.count ?? 0);
            if (totalCount >= campaign.usageLimit) {
                return reply.status(400).send({ error: "Coupon usage limit reached" });
            }
        }

        if (userId && campaign.usagePerCustomer && campaign.usagePerCustomer > 0) {
            const customerCountResult = await db
                .select({ count: count() })
                .from(schema.campaignRedemptions)
                .where(and(
                    eq(schema.campaignRedemptions.campaignId, campaign.id),
                    eq(schema.campaignRedemptions.customerId, userId)
                ));
            const customerCount = Number(customerCountResult[0]?.count ?? 0);
            if (customerCount >= campaign.usagePerCustomer) {
                return reply.status(400).send({ error: "Coupon usage limit reached for this customer" });
            }
        }

        if (campaign.discountType !== "BUY_X_GET_Y") {
            const minPurchaseAmount = fromKesMinorUnits(campaign.minPurchaseAmount);
            if (subtotal < minPurchaseAmount) {
                return reply.status(400).send({
                    error: `Minimum order value of KES ${minPurchaseAmount.toLocaleString()} required`,
                });
            }
        }

        let discountAmount = 0;
        let responseType = campaign.discountType;
        let responseValue = campaign.discountValue ?? 0;
        let details: Record<string, number> | undefined;

        if (campaign.discountType === "PERCENTAGE") {
            discountAmount = (subtotal * (campaign.discountValue ?? 0)) / 100;
            const maxDiscountAmount = fromKesMinorUnits(campaign.maxDiscountAmount);
            if (maxDiscountAmount > 0) {
                discountAmount = Math.min(discountAmount, maxDiscountAmount);
            }
            responseValue = campaign.discountValue ?? 0;
        } else if (campaign.discountType === "FIXED_AMOUNT") {
            discountAmount = fromKesMinorUnits(campaign.discountValue);
            responseValue = fromKesMinorUnits(campaign.discountValue);
        } else if (campaign.discountType === "FREE_SHIPPING") {
            discountAmount = 0;
            responseValue = 0;
        } else if (campaign.discountType === "BUY_X_GET_Y") {
            const buyX = Math.max(1, Math.round(Number(campaign.minPurchaseAmount || 0)));
            const getY = Math.max(1, Math.round(Number(campaign.discountValue || 0)));

            if (!buyX || !getY) {
                return reply.status(400).send({ error: "Buy X Get Y coupon is missing configuration" });
            }

            if (!items || items.length === 0) {
                return reply.status(400).send({ error: "Cart items are required for this coupon" });
            }

            const eligibleProductIds = parseIdArray(campaign.productIds);
            const eligibleItems = eligibleProductIds.length > 0
                ? items.filter((item: any) => {
                    const productId = item.productId || item.id;
                    return productId && eligibleProductIds.includes(String(productId));
                })
                : items;

            const eligibleQuantity = eligibleItems.reduce((total: number, item: any) => {
                const qty = Math.max(0, Math.round(Number(item.quantity || 0)));
                return total + qty;
            }, 0);

            const groupSize = buyX + getY;
            if (eligibleQuantity < groupSize) {
                return reply.status(400).send({
                    error: `Add ${groupSize - eligibleQuantity} more item(s) to qualify for this offer`,
                });
            }

            const freeCount = Math.floor(eligibleQuantity / groupSize) * getY;
            const unitPrices: number[] = [];
            eligibleItems.forEach((item: any) => {
                const price = Number(item.price || 0);
                const qty = Math.max(0, Math.round(Number(item.quantity || 0)));
                for (let i = 0; i < qty; i += 1) {
                    unitPrices.push(price);
                }
            });

            unitPrices.sort((a, b) => a - b);
            discountAmount = unitPrices.slice(0, freeCount).reduce((sum, price) => sum + price, 0);
            details = { buyX, getY, freeCount };
            responseValue = getY;
        } else {
            return reply.status(400).send({ error: "Coupon is not applicable" });
        }

        const maxDiscountAmount = fromKesMinorUnits(campaign.maxDiscountAmount);
        if (maxDiscountAmount > 0) {
            discountAmount = Math.min(discountAmount, maxDiscountAmount);
        }

        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }

        return {
            success: true,
            code: (campaign.couponCode || normalizedCode).toUpperCase(),
            type: responseType,
            value: responseValue,
            discountAmount,
            message: "Coupon applied successfully!",
            ...(details ? { details } : {}),
        };
    });

    // Shipping Info
    fastify.get("/shipping", {
        schema: {
            tags: ["Fulfillment"],
            querystring: z.object({})
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:shipping:list");
        const cached = await fastify.cache.get<{ methods: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.shipping}`);
            return cached;
        }

        const methods = await db.query.shippingMethods.findMany({
            where: eq(schema.shippingMethods.enabled, true),
            with: { zones: { with: { cities: true } } }
        });
        const payload = { methods };
        await fastify.cache.set(cacheKey, payload, TTL.shipping, ["shipping"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.shipping}`);
        return payload;
    });

    // Policies
    fastify.get("/policies", {
        schema: {
            tags: ["Store"],
            querystring: z.object({})
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:policies");
        const cached = await fastify.cache.get<any>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.policies}`);
            return cached;
        }

        const payload = {
            shippingPolicy: "Standard shipping policy...",
            returnPolicy: "30-day return policy...",
            privacyPolicy: "Privacy policy...",
            termsOfService: "Terms of service..."
        };

        await fastify.cache.set(cacheKey, payload, TTL.policies, ["policies"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.policies}`);
        return payload;
    });
};

export default storePublicRoutes;
