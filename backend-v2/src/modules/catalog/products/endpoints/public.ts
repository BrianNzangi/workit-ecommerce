import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, or, and, inArray } from "../../../../lib/db.js";

export const productsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List Products
    fastify.get("/", {
        schema: {
            tags: ["Catalog"]
        }
    }, async (request) => {
        const { limit = 50, offset = 0, collection: collectionSlug } = request.query as any;

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
                brand: true
            },
        });

        return { products: results };
    });

    // Search Products
    fastify.get("/search", {
        schema: {
            tags: ["Catalog"]
        }
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
            },
        });

        return { products: results };
    });

    // Show Product (by ID or Slug)
    fastify.get("/:idOrSlug", {
        schema: {
            tags: ["Catalog"]
        }
    }, async (request, reply) => {
        const { idOrSlug } = request.params as any;

        const product = await db.query.products.findFirst({
            where: or(eq(schema.products.id, idOrSlug), eq(schema.products.slug, idOrSlug)),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true
            },
        });

        if (!product) {
            return reply.status(404).send({ message: "Product not found" });
        }

        return product;
    });
};

export default productsPublicRoutes;
