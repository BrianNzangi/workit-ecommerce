import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, inArray, asc, and, or } from "../../../../lib/db.js";

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

const fetchProductsByIds = async (productIds: string[]) => {
    if (productIds.length === 0) return [];

    const products = await (db as any).query.products.findMany({
        where: inArray(schema.products.id as any, productIds),
        with: {
            assets: { with: { asset: true } },
            collections: { with: { collection: true } },
            brand: true,
        },
    });

    const byId = new Map(products.map((product: any) => [product.id, product]));
    return productIds.map((id) => byId.get(id)).filter(Boolean);
};

const resolveFeaturedProducts = async (campaign: any) => {
    const relations = await (db as any).query.campaignProducts.findMany({
        where: eq(schema.campaignProducts.campaignId as any, campaign.id),
        orderBy: [asc(schema.campaignProducts.sortOrder as any)],
        with: {
            product: {
                with: {
                    assets: { with: { asset: true } },
                    collections: { with: { collection: true } },
                    brand: true,
                },
            },
        },
    });

    if (relations.length > 0) {
        const featuredProducts = relations
            .map((entry: any) => entry.product)
            .filter(Boolean);

        return {
            productIds: featuredProducts.map((product: any) => product.id),
            featuredProducts,
        };
    }

    const productIds = parseIdArray(campaign.productIds);
    const featuredProducts = await fetchProductsByIds(productIds);

    return { productIds, featuredProducts };
};

export const campaignsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List Campaigns (Active/Public)
    // List Campaigns (Active/Public)
    fastify.get("/", {
        schema: {
            tags: ["Marketing"]
        }
    }, async () => {
        const campaigns = await db.query.campaigns.findMany({
            where: eq(schema.campaigns.status, 'ACTIVE'),
            orderBy: [desc(schema.campaigns.createdAt)],
        });

        const hydrated = await Promise.all(campaigns.map(async (campaign: any) => {
            const { featuredProducts, productIds } = await resolveFeaturedProducts(campaign);
            return {
                ...campaign,
                productIds,
                featuredProducts,
                featuredProductsCount: productIds.length,
            };
        }));

        return { campaigns: hydrated };
    });

    // Show Campaign
    // Show Campaign
    fastify.get("/:idOrSlug", {
        schema: {
            tags: ["Marketing"]
        }
    }, async (request, reply) => {
        const { idOrSlug } = request.params as any;
        const campaign = await db.query.campaigns.findFirst({
            where: and(
                eq(schema.campaigns.status, 'ACTIVE'),
                or(
                    eq(schema.campaigns.id, idOrSlug),
                    eq(schema.campaigns.slug, idOrSlug)
                )
            ) as any,
        });
        if (!campaign) return reply.status(404).send({ message: "Campaign not found" });

        const { featuredProducts, productIds } = await resolveFeaturedProducts(campaign);
        return {
            ...campaign,
            productIds,
            featuredProducts,
            featuredProductsCount: productIds.length,
        };
    });
};

export default campaignsPublicRoutes;

