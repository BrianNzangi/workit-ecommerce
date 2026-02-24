import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, or, and, inArray } from "../../../../lib/db.js";
import { buildCacheKey } from "../../../../lib/cache.js";

const normalizeCampaignDate = (value: unknown): Date | null => {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const enrichProductCampaigns = (product: any, onlyActive = true) => {
    const now = new Date();
    const campaignRows = Array.isArray(product?.campaignProducts) ? product.campaignProducts : [];
    const campaigns = campaignRows
        .map((row: any) => row?.campaign)
        .filter(Boolean)
        .filter((campaign: any) => {
            if (!onlyActive) return true;
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

const enrichProductsWithCampaigns = (products: any[], onlyActive = true) =>
    products.map((product: any) => enrichProductCampaigns(product, onlyActive));

export const productsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    const LIST_TTL_SECONDS = 60;
    const DETAIL_TTL_SECONDS = 300;
    const CACHE_TAG = "products";

    // List Products
    fastify.get("/", {
        schema: {
            tags: ["Catalog"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { limit = 50, offset = 0, collection: collectionSlug } = request.query as any;

        const cacheKey = buildCacheKey("public:products:list", request.query as any);
        const cached = await fastify.cache.get<{ products: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${LIST_TTL_SECONDS}`);
            return cached;
        }

        const filters = [];

        if (collectionSlug) {
            const collection = await db.query.collections.findFirst({
                where: eq(schema.collections.slug, collectionSlug)
            });
            if (collection) {
                const productIds = await db.select({ productId: schema.productCollections.productId })
                    .from(schema.productCollections)
                    .where(eq(schema.productCollections.collectionId, collection.id));

                if (productIds.length > 0) {
                    filters.push(inArray(
                        schema.products.id,
                        productIds.map((p: any) => p.productId)
                    ));
                } else {
                    // If collection exists but has no products, force empty result
                    filters.push(eq(schema.products.id, "___none___"));
                }
            } else {
                // If collection slug doesn't exist, force empty result
                filters.push(eq(schema.products.id, "___none___"));
            }
        }

        const results = await db.query.products.findMany({
            limit: Number(limit),
            offset: Number(offset),
            where: filters.length > 0 ? and(...filters) : undefined,
            orderBy: [desc(schema.products.createdAt)],
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            },
        });

        const payload = { products: enrichProductsWithCampaigns(results) };
        await fastify.cache.set(cacheKey, payload, LIST_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${LIST_TTL_SECONDS}`);
        return payload;
    });

    // Search Products
    fastify.get("/search", {
        schema: {
            tags: ["Catalog"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request) => {
        const { q } = request.query as any;

        const results = await db.query.products.findMany({
            where: or(
                ilike(schema.products.name, `%${q}%`),
                ilike(schema.products.description, `%${q}%`),
                ilike(schema.products.sku, `%${q}%`)
            ),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                campaignProducts: { with: { campaign: true } },
            },
        });

        return { products: enrichProductsWithCampaigns(results) };
    });

    // Show Product (by ID or Slug)
    fastify.get("/:idOrSlug", {
        schema: {
            tags: ["Catalog"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { idOrSlug } = request.params as any;

        const cacheKey = `public:products:detail:${idOrSlug}`;
        const cached = await fastify.cache.get<any>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
            return cached;
        }

        const product = await db.query.products.findFirst({
            where: or(eq(schema.products.id, idOrSlug), eq(schema.products.slug, idOrSlug)),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            },
        });

        if (!product) {
            return reply.status(404).send({ message: "Product not found" });
        }

        const payload = enrichProductCampaigns(product);
        await fastify.cache.set(cacheKey, payload, DETAIL_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
        return payload;
    });
};

export default productsPublicRoutes;
