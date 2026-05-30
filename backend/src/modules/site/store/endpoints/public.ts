import { FastifyPluginAsync } from "fastify";
import { db, schema, and, eq, or, ilike, desc, count, isNull, inArray, asc, isNotNull, gt, gte, lte, sql } from "../../../../lib/db.js";
import { z } from "zod";
import { productSearchService } from "../../../../services/search/product-search.service.js";
import { buildCacheKey } from "../../../../lib/cache.js";
import { enrichProductCampaigns, enrichProductsWithCampaigns, normalizeCampaignDate } from "../../../../lib/product-campaigns.js";
import { CouponRepository } from "../../../../infrastructure/persistence/repositories/CouponRepository.js";
import { CouponMapper } from "../../../../infrastructure/persistence/mappers/CouponMapper.js";
import { FeaturedDealRepository } from "../../../../infrastructure/persistence/repositories/FeaturedDealRepository.js";
import { FeaturedDealMapper } from "../../../../infrastructure/persistence/mappers/FeaturedDealMapper.js";
import { ClearanceDealRepository } from "../../../../infrastructure/persistence/repositories/ClearanceDealRepository.js";
import { ClearanceDealMapper } from "../../../../infrastructure/persistence/mappers/ClearanceDealMapper.js";
import { FlashSaleRepository } from "../../../../infrastructure/persistence/repositories/FlashSaleRepository.js";
import { FlashSaleMapper } from "../../../../infrastructure/persistence/mappers/FlashSaleMapper.js";
import { featureFlags, isRouteMigrationEnabled } from "../../../../infrastructure/feature-flags/flags.js";

const productsQuerySchema = z.object({
    limit: z.coerce.number().default(50),
    offset: z.coerce.number().default(0),
    collection: z.string().optional(),
    campaign: z.string().optional(),
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
    campaignId: z.string().optional(),
    campaign: z.string().optional(),
});

export const storePublicRoutes: FastifyPluginAsync = async (fastify) => {
    const TTL = {
        productsList: 300,
        productSearch: 60,
        productDetail: 300,
        brands: 1800,
        collections: 7200,
        banners: 3600,
        homepageCollections: 3600,
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

    const serializeProductListItem = (product: any) => {
        const firstAsset = Array.isArray(product?.assets)
            ? product.assets.find((asset: any) => asset?.featured) || product.assets[0]
            : null;
        const imageUrl = firstAsset?.asset?.preview || firstAsset?.asset?.source || null;
        const stockOnHand = product.stockOnHand ?? 0;

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            salePrice: product.salePrice ?? null,
            originalPrice: product.originalPrice ?? null,
            stockOnHand,
            condition: product.condition ?? null,
            createdAt: product.createdAt ?? null,
            updatedAt: product.updatedAt ?? null,
            canBuy: stockOnHand > 0,
            brand: product.brand
                ? {
                    id: product.brand.id,
                    name: product.brand.name,
                    slug: product.brand.slug,
                }
                : null,
            image: imageUrl,
            images: imageUrl
                ? [{
                    id: firstAsset?.asset?.id || firstAsset?.id || product.id,
                    url: imageUrl,
                    featured: Boolean(firstAsset?.featured),
                }]
                : [],
            shippingMethod: product.shippingMethod
                ? {
                    id: product.shippingMethod.id,
                    code: product.shippingMethod.code,
                    name: product.shippingMethod.name,
                    description: product.shippingMethod.description ?? undefined,
                    isExpress: Boolean(product.shippingMethod.isExpress),
                }
                : null,
            campaigns: product.campaigns || [],
            activePromotion: product.activePromotion || null,
            campaignTypes: product.campaignTypes || [],
            campaignType: product.campaignType || null,
            discountTypes: product.discountTypes || [],
            discountType: product.discountType || null,
        };
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
            campaign,
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
        if (campaign) {
            const matchedCampaign = await db.query.campaigns.findFirst({
                where: or(
                    eq(schema.campaigns.id, campaign),
                    eq(schema.campaigns.slug, campaign)
                ),
                columns: {
                    id: true,
                    productIds: true,
                },
            });

            if (matchedCampaign) {
                const relatedCampaignProducts = await db.query.campaignProducts.findMany({
                    where: eq(schema.campaignProducts.campaignId, matchedCampaign.id),
                    columns: { productId: true },
                    orderBy: [asc(schema.campaignProducts.sortOrder)],
                });

                const normalizedCampaignProductIds = relatedCampaignProducts.length > 0
                    ? relatedCampaignProducts.map((entry: any) => entry.productId)
                    : (() => {
                        const rawProductIds = matchedCampaign.productIds;
                        if (!rawProductIds) return [];

                        try {
                            const parsed = JSON.parse(String(rawProductIds));
                            return Array.isArray(parsed)
                                ? parsed.map((item) => String(item).trim()).filter(Boolean)
                                : [];
                        } catch {
                            return String(rawProductIds)
                                .split(',')
                                .map((item) => item.trim())
                                .filter(Boolean);
                        }
                    })();

                if (normalizedCampaignProductIds.length > 0) {
                    whereClauses.push(inArray(schema.products.id, normalizedCampaignProductIds));
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
            columns: {
                id: true,
                name: true,
                slug: true,
                salePrice: true,
                originalPrice: true,
                stockOnHand: true,
                condition: true,
                createdAt: true,
                updatedAt: true,
            },
            with: {
                assets: {
                    columns: {
                        id: true,
                        productId: true,
                        assetId: true,
                        sortOrder: true,
                        featured: true,
                    },
                    with: {
                        asset: {
                            columns: {
                                id: true,
                                name: true,
                                source: true,
                                preview: true,
                            },
                        },
                    },
                },
                brand: {
                    columns: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                shippingMethod: {
                    columns: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                        isExpress: true,
                    },
                },
                campaignProducts: {
                    columns: {
                        id: true,
                        campaignId: true,
                        productId: true,
                        sortOrder: true,
                    },
                    with: {
                        campaign: {
                            columns: {
                                id: true,
                                name: true,
                                slug: true,
                                type: true,
                                status: true,
                                startDate: true,
                                endDate: true,
                                discountType: true,
                                discountValue: true,
                                couponCode: true,
                                minPurchaseAmount: true,
                                maxDiscountAmount: true,
                                usageLimit: true,
                                usagePerCustomer: true,
                            },
                        },
                    },
                },
            }
        });
        const normalizedResults = enrichProductsWithCampaigns(results, { onlyActive: true });
        const payload = {
            products: normalizedResults.map(serializeProductListItem),
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

    // Homepage Featured Brands
    fastify.get("/brands/homepage-featured", {
        schema: {
            tags: ["Catalog"],
            querystring: z.object({})
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:brands:homepage-featured");
        const cached = await fastify.cache.get<{ brands: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.brands}`);
            return cached;
        }
        const results = await db.query.brands.findMany({
            where: eq(schema.brands.showInHomepage, true),
            orderBy: [asc(schema.brands.name as any)],
        });
        const payload = { brands: results };
        await fastify.cache.set(cacheKey, payload, TTL.brands, ["brands"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.brands}`);
        return payload;
    });

    // Featured Brands by Collection
    fastify.get("/brands/featured", {
        schema: {
            tags: ["Catalog"],
            querystring: z.object({ collectionSlug: z.string().optional() })
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { collectionSlug } = request.query as any;
        if (!collectionSlug) return { brands: [] };
        const cacheKey = buildCacheKey("store:brands:featured", collectionSlug);
        const cached = await fastify.cache.get<{ brands: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.brands}`);
            return cached;
        }
        const collection = await db.query.collections.findFirst({
            where: eq(schema.collections.slug, collectionSlug),
            columns: { id: true },
        });
        if (!collection) return { brands: [] };
        const brandCollections = await db.query.brandCollections.findMany({
            where: eq(schema.brandCollections.collectionId, collection.id),
            orderBy: [asc(schema.brandCollections.sortOrder)],
            with: { brand: true },
        });
        const brands = brandCollections.map((bc: any) => bc.brand);
        const payload = { brands };
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
        mostShopped: z.coerce.boolean().optional(),
    });

    // Collections
    fastify.get("/collections", {
        schema: {
            tags: ["Catalog"],
            querystring: collectionsQuerySchema
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { includeChildren, parentId, take, skip, mostShopped } = request.query as z.infer<typeof collectionsQuerySchema>;
        const { collections } = schema;

        const cacheKey = buildCacheKey("store:collections:list", request.query as any);
        const cached = await fastify.cache.get<{ collections: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.collections}`);
            return cached;
        }

        let whereClause = eq(collections.enabled, true);

        if (mostShopped) {
            whereClause = and(whereClause, eq(collections.showInMostShopped, true)) as any;
        }

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
                products: true,
                ...(includeChildren ? {
                    children: {
                        where: eq(schema.collections.enabled, true),
                        orderBy: [asc(schema.collections.sortOrder)],
                        with: {
                            asset: true,
                            products: true,
                            children: {
                                where: eq(schema.collections.enabled, true),
                                orderBy: [asc(schema.collections.sortOrder)],
                                with: {
                                    asset: true,
                                    products: true,
                                }
                            }
                        }
                    }
                } : {})
            }
        });

        const mapCollection = (col: any): any => ({
            ...col,
            _count: { products: col.products?.length || 0 },
            children: col.children?.map((child: any) => ({
                ...child,
                _count: { products: child.products?.length || 0 },
                children: child.children?.map((grandchild: any) => ({
                    ...grandchild,
                    _count: { products: grandchild.products?.length || 0 },
                    products: undefined,
                })),
                products: undefined,
            })),
            products: undefined,
        });

        const payload = { collections: results.map(mapCollection) };
        await fastify.cache.set(cacheKey, payload, TTL.collections, ["collections"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.collections}`);
        return payload;
    });

    // Banners
    async function resolvePromotions(banners: any[]) {
        const result: any[] = [...banners];
        const promoIds: string[] = banners.filter((b: any) => b.promotionId).map((b: any) => b.promotionId as string);
        if (promoIds.length === 0) return result;

        const [coupons, flashSales, featuredDeals, clearanceDeals] = await Promise.all([
            db.query.coupons.findMany({ where: inArray(schema.coupons.id, promoIds), columns: { id: true, title: true } }),
            db.query.flashSales.findMany({ where: inArray(schema.flashSales.id, promoIds), columns: { id: true, title: true } }),
            db.query.featuredDeals.findMany({ where: inArray(schema.featuredDeals.id, promoIds), columns: { id: true, title: true } }),
            db.query.clearanceDeals.findMany({ where: inArray(schema.clearanceDeals.id, promoIds), columns: { id: true, title: true } }),
        ]);

        const promoMap = new Map<string, { title: string; type: string }>();
        coupons.forEach((c: { id: string; title: string }) => promoMap.set(c.id, { title: c.title, type: 'coupon' }));
        flashSales.forEach((f: { id: string; title: string }) => promoMap.set(f.id, { title: f.title, type: 'flash_sale' }));
        featuredDeals.forEach((f: { id: string; title: string }) => promoMap.set(f.id, { title: f.title, type: 'featured_deal' }));
        clearanceDeals.forEach((c: { id: string; title: string }) => promoMap.set(c.id, { title: c.title, type: 'clearance_deal' }));

        for (const banner of result) {
            if (banner.promotionId && promoMap.has(banner.promotionId)) {
                banner.promotion = promoMap.get(banner.promotionId);
            }
        }
        return result;
    }

    fastify.get("/banners", {
        schema: {
            tags: ["Marketing"],
            querystring: bannersQuerySchema
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { position, enabled, collectionId, collection, campaignId, campaign } = request.query as z.infer<typeof bannersQuerySchema>;

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

        let resolvedCampaignId = campaignId;
        if (!resolvedCampaignId && campaign) {
            const matchedCampaign = await db.query.campaigns.findFirst({
                where: or(
                    eq(schema.campaigns.id, campaign),
                    eq(schema.campaigns.slug, campaign)
                ),
                columns: { id: true }
            });

            if (!matchedCampaign) {
                return { banners: [] };
            }

            resolvedCampaignId = matchedCampaign.id;
        }

        if (resolvedCampaignId) {
            whereClauses.push(eq(schema.banners.campaignId, resolvedCampaignId));
        }

        const bannerWhereClause = whereClauses.length === 1
            ? whereClauses[0]
            : and(...whereClauses);

        const results = await db.query.banners.findMany({
            where: bannerWhereClause,
            orderBy: [asc(schema.banners.sortOrder)],
            columns: {
                id: true,
                title: true,
                description: true,
                slug: true,
                position: true,
                enabled: true,
                sortOrder: true,
                promotionId: true,
            },
            with: {
                desktopImage: {
                    columns: {
                        id: true,
                        name: true,
                        source: true,
                        preview: true,
                    },
                },
                mobileImage: {
                    columns: {
                        id: true,
                        name: true,
                        source: true,
                        preview: true,
                    },
                },
                collection: {
                    columns: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                product: {
                    columns: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                campaign: {
                    columns: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            }
        });
        const payload = { banners: await resolvePromotions(results) };
        await fastify.cache.set(cacheKey, payload, TTL.banners, ["banners"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${TTL.banners}`);
        return payload;
    });

    // Homepage Collections
    fastify.get("/homepage-collections", {
        schema: {
            tags: ["Marketing"],
            querystring: z.object({
                slug: z.string().optional(),
            })
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { slug } = request.query as { slug?: string };
        const cacheKey = buildCacheKey(`store:homepage-collections:${slug || "list"}`);
        const cached = await fastify.cache.get<{ collections: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${TTL.homepageCollections}`);
            return cached;
        }

        const conditions = [eq(schema.homepageCollections.enabled, true)];
        if (slug) {
            conditions.push(eq(schema.homepageCollections.slug, slug));
        }

        const results = await db.query.homepageCollections.findMany({
            where: and(...conditions),
            orderBy: [asc(schema.homepageCollections.sortOrder)],
            with: {
                products: {
                    orderBy: [asc(schema.homepageCollectionProducts.sortOrder)],
                    with: {
                        product: {
                            columns: {
                                id: true,
                                name: true,
                                slug: true,
                                salePrice: true,
                                originalPrice: true,
                                stockOnHand: true,
                                condition: true,
                                createdAt: true,
                                updatedAt: true,
                            },
                            with: {
                                assets: {
                                    columns: {
                                        id: true,
                                        productId: true,
                                        assetId: true,
                                        sortOrder: true,
                                        featured: true,
                                    },
                                    with: {
                                        asset: {
                                            columns: {
                                                id: true,
                                                name: true,
                                                source: true,
                                                preview: true,
                                            },
                                        },
                                    },
                                },
                                brand: {
                                    columns: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                                shippingMethod: {
                                    columns: {
                                        id: true,
                                        code: true,
                                        name: true,
                                        description: true,
                                        isExpress: true,
                                    },
                                },
                                campaignProducts: {
                                    columns: {
                                        id: true,
                                        campaignId: true,
                                        productId: true,
                                        sortOrder: true,
                                    },
                                    with: {
                                        campaign: {
                                            columns: {
                                                id: true,
                                                name: true,
                                                slug: true,
                                                type: true,
                                                status: true,
                                                startDate: true,
                                                endDate: true,
                                                discountType: true,
                                                discountValue: true,
                                                couponCode: true,
                                                minPurchaseAmount: true,
                                                maxDiscountAmount: true,
                                                usageLimit: true,
                                                usagePerCustomer: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }
        });
        const payload = {
            collections: results.map((collection: any) => ({
                id: collection.id,
                title: collection.title,
                slug: collection.slug,
                enabled: collection.enabled,
                status: collection.enabled ? "active" : "draft",
                sortOrder: collection.sortOrder,
                createdAt: collection.createdAt,
                updatedAt: collection.updatedAt,
                products: (collection.products || [])
                    .slice(0, 12)
                    .map((entry: any) => ({
                        ...entry,
                        product: entry.product
                            ? serializeProductListItem(enrichProductCampaigns(entry.product, { onlyActive: true }))
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

    // ─── DDD Promotion Endpoints ────────────────────────────────────────
    const useDDDPromotions = isRouteMigrationEnabled(featureFlags.useDDDMarketing);

    const couponMapper = new CouponMapper();
    const featuredDealMapper = new FeaturedDealMapper();
    const clearanceDealMapper = new ClearanceDealMapper();
    const flashSaleMapper = new FlashSaleMapper();
    const couponRepo = new CouponRepository(couponMapper);
    const featuredDealRepo = new FeaturedDealRepository(featuredDealMapper);
    const clearanceDealRepo = new ClearanceDealRepository(clearanceDealMapper);
    const flashSaleRepo = new FlashSaleRepository(flashSaleMapper);

    // Active Featured Deals
    fastify.get("/featured-deals", {
        schema: { tags: ["Promotions"] },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:promotions:featured-deals:list");
        const cached = await fastify.cache.get<{ deals: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", "public, max-age=300");
            return cached;
        }

        const all = await featuredDealRepo.findAll({ status: "ACTIVE" });
        const now = new Date();
        const active = all.filter(d => d.startDate <= now && d.endDate >= now);

        const payload = {
            deals: active.map(d => ({
                id: d.id,
                title: d.title,
                productId: d.productId,
                discount: d.discount,
                dealType: d.dealType,
                startDate: d.startDate,
                endDate: d.endDate,
            })),
        };
        await fastify.cache.set(cacheKey, payload, 300, ["featured-deals", "promotions"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", "public, max-age=300");
        return payload;
    });

    // Active Clearance Deals
    fastify.get("/clearance-deals", {
        schema: { tags: ["Promotions"] },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:promotions:clearance-deals:list");
        const cached = await fastify.cache.get<{ deals: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", "public, max-age=300");
            return cached;
        }

        const all = await clearanceDealRepo.findAll({ status: "ACTIVE" });
        const now = new Date();
        const active = all.filter(d => d.startDate <= now && d.endDate >= now);

        const payload = {
            deals: active.map(d => ({
                id: d.id,
                title: d.title,
                productId: d.productId,
                discount: d.discount,
                type: d.type,
                deal: d.deal,
                startDate: d.startDate,
                endDate: d.endDate,
            })),
        };
        await fastify.cache.set(cacheKey, payload, 300, ["clearance-deals", "promotions"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", "public, max-age=300");
        return payload;
    });

    // Active Flash Sales
    fastify.get("/flash-sales", {
        schema: { tags: ["Promotions"] },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("store:promotions:flash-sales:list");
        const cached = await fastify.cache.get<{ sales: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", "public, max-age=300");
            return cached;
        }

        const all = await flashSaleRepo.findAll({ status: "ACTIVE" });
        const now = new Date();
        const active = all.filter(s => s.startDate <= now && s.endDate >= now);

        const payload = {
            sales: active.map(s => ({
                id: s.id,
                title: s.title,
                discount: s.discount,
                productIds: s.productIds,
                startDate: s.startDate,
                endDate: s.endDate,
            })),
        };
        await fastify.cache.set(cacheKey, payload, 300, ["flash-sales", "promotions"]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", "public, max-age=300");
        return payload;
    });

    // Coupon Validation — uses DDD Coupon aggregate when USE_DDD_MARKETING is enabled
    if (useDDDPromotions) {
        const dddCouponValidateSchema = z.object({
            code: z.string().min(1),
            subtotal: z.coerce.number().min(0),
        });

        fastify.post("/coupons/validate", {
            schema: { tags: ["Promotions"], body: dddCouponValidateSchema },
            preHandler: [fastify.optionalStorefrontAuth, fastify.publicRateLimit],
        }, async (request, reply) => {
            const { code, subtotal } = request.body as z.infer<typeof dddCouponValidateSchema>;
            const normalizedCode = String(code).trim().toUpperCase();

            if (!normalizedCode) {
                return reply.status(400).send({ error: "Coupon code is required" });
            }

            const coupon = await couponRepo.findByCode(normalizedCode);
            if (!coupon) {
                return reply.status(404).send({ error: "Invalid coupon code" });
            }

            if (!coupon.isActive()) {
                if (coupon.isExpired()) {
                    return reply.status(400).send({ error: "Coupon has expired" });
                }
                return reply.status(400).send({ error: "Coupon is not active" });
            }

            const minAmount = coupon.minAmount.amount;
            if (subtotal < minAmount) {
                return reply.status(400).send({
                    error: `Minimum order value of KES ${minAmount.toLocaleString()} required`,
                });
            }

            let discountAmount = coupon.couponAmount.amount;
            if (discountAmount > subtotal) {
                discountAmount = subtotal;
            }

            return {
                success: true,
                code: coupon.code || normalizedCode,
                type: "FIXED_AMOUNT",
                value: coupon.couponAmount.amount,
                discountAmount,
                message: "Coupon applied successfully!",
            };
        });
    } else {
        // Legacy Campaign-based coupon validation
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
    }

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
