import { FastifyPluginAsync } from "fastify";
import { db, schema, and, eq, or, ilike, desc, count, isNull, inArray, asc, isNotNull, gt } from "../../../../lib/db.js";
import { z } from "zod";
import { productSearchService } from "../../../../services/search/product-search.service.js";
import { buildCacheKey } from "../../../../lib/cache.js";

const productsQuerySchema = z.object({
    limit: z.coerce.number().default(50),
    offset: z.coerce.number().default(0),
    collection: z.string().optional(),
    brand: z.string().optional(),
    q: z.string().optional(),
    shippingMethodId: z.string().optional(),
    onSale: z.coerce.boolean().optional(),
    inStock: z.coerce.boolean().optional(),
});

const bannersQuerySchema = z.object({
    position: z.string().optional(),
    enabled: z.coerce.boolean().optional(),
    collectionId: z.string().optional(),
    collection: z.string().optional(),
});

const normalizeCampaignDate = (value: unknown): Date | null => {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const enrichStoreProductCampaigns = (product: any) => {
    const now = new Date();
    const campaignRows = Array.isArray(product?.campaignProducts) ? product.campaignProducts : [];
    const campaigns = campaignRows
        .map((row: any) => row?.campaign)
        .filter(Boolean)
        .filter((campaign: any) => {
            if (campaign.status !== "ACTIVE") return false;
            const startsAt = normalizeCampaignDate(campaign.startDate);
            const endsAt = normalizeCampaignDate(campaign.endDate);
            if (startsAt && startsAt > now) return false;
            if (endsAt && endsAt < now) return false;
            return true;
        });

    const dedupedCampaigns = Array.from(
        new Map(campaigns.map((campaign: any) => [campaign.id, campaign])).values()
    );
    const campaignTypes = Array.from(
        new Set(dedupedCampaigns.map((campaign: any) => campaign.type).filter(Boolean))
    );
    const discountTypes = Array.from(
        new Set(dedupedCampaigns.map((campaign: any) => campaign.discountType).filter(Boolean))
    );

    return {
        ...product,
        campaigns: dedupedCampaigns.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            slug: campaign.slug,
            type: campaign.type,
            discountType: campaign.discountType,
            status: campaign.status,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
        })),
        campaignTypes,
        campaignType: campaignTypes[0] || null,
        discountTypes,
        discountType: discountTypes[0] || null,
        campaignProducts: undefined,
    };
};

const enrichStoreProductsCampaigns = (products: any[]) =>
    products.map((product: any) => enrichStoreProductCampaigns(product));

export const storePublicRoutes: FastifyPluginAsync = async (fastify) => {
    const TTL = {
        productsList: 60,
        productDetail: 300,
        brands: 900,
        collections: 900,
        banners: 300,
        homepageCollections: 300,
        campaigns: 300,
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
        const { limit, offset, collection, brand, q, shippingMethodId, onSale, inStock } = request.query as z.infer<typeof productsQuerySchema>;

        const cacheKey = buildCacheKey("store:products:list", request.query as any);
        const cached = await fastify.cache.get<{ products: any[] }>(cacheKey);
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
        if (q) {
            whereClauses.push(or(
                ilike(schema.products.name, `%${q}%`),
                ilike(schema.products.description, `%${q}%`)
            )!);
        }

        const results = await db.query.products.findMany({
            where: and(...whereClauses),
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.products.createdAt)],
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            }
        });
        const payload = { products: enrichStoreProductsCampaigns(results) };
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
    }, async (request) => {
        const { q, limit } = request.query as z.infer<typeof searchQuerySchema>;
        const results = await productSearchService.searchStoreProducts(q, limit);
        return { products: results };
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
        const payload = enrichStoreProductCampaigns(product);
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
                products: { with: { product: { with: { assets: { with: { asset: true } } } } } }
            }
        });
        const payload = { collections: results };
        await fastify.cache.set(cacheKey, payload, TTL.homepageCollections, ["homepage-collections"]);
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
