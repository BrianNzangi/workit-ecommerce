import { FastifyPluginAsync } from "fastify";
import { db, schema, and, eq, or, ilike, desc, count, isNull, inArray } from "../../../../lib/db.js";
import { z } from "zod";

const productsQuerySchema = z.object({
    limit: z.coerce.number().default(50),
    offset: z.coerce.number().default(0),
    collection: z.string().optional(),
    brand: z.string().optional(),
    q: z.string().optional()
});

export const storePublicRoutes: FastifyPluginAsync = async (fastify) => {
    // Products
    fastify.get("/products", {
        schema: {
            tags: ["Catalog"],
            querystring: productsQuerySchema
        }
    }, async (request) => {
        const { limit, offset, collection, brand, q } = request.query as z.infer<typeof productsQuerySchema>;

        const whereClauses = [eq(schema.products.enabled, true)];

        if (collection) {
            const col = await db.query.collections.findFirst({
                where: eq(schema.collections.slug, collection)
            });

            if (col) {
                const productConnections = await db.select({ productId: schema.productCollections.productId })
                    .from(schema.productCollections)
                    .where(eq(schema.productCollections.collectionId, col.id));

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
                brand: true
            }
        });
        return { products: results };
    });

    const productParamsSchema = z.object({
        idOrSlug: z.string()
    });

    fastify.get("/products/:idOrSlug", {
        schema: {
            tags: ["Catalog"],
            params: productParamsSchema
        }
    }, async (request, reply) => {
        const { idOrSlug } = request.params as z.infer<typeof productParamsSchema>;
        const product = await db.query.products.findFirst({
            where: or(eq(schema.products.id, idOrSlug), eq(schema.products.slug, idOrSlug)),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true
            }
        });
        if (!product) return reply.status(404).send({ message: "Product not found" });
        return product;
    });

    const searchQuerySchema = z.object({
        q: z.string()
    });

    // Search
    fastify.get("/products/search", {
        schema: {
            tags: ["Catalog"],
            querystring: searchQuerySchema
        }
    }, async (request) => {
        const { q } = request.query as z.infer<typeof searchQuerySchema>;
        const results = await db.query.products.findMany({
            where: and(
                eq(schema.products.enabled, true),
                or(ilike(schema.products.name, `%${q}%`), ilike(schema.products.description, `%${q}%`))
            ),
            with: { assets: { with: { asset: true } } }
        });
        return { products: results };
    });

    // Brands
    fastify.get("/brands", {
        schema: {
            tags: ["Catalog"],
            querystring: z.object({})
        }
    }, async () => {
        const results = await db.query.brands.findMany({});
        return { brands: results };
    });

    const collectionsQuerySchema = z.object({
        includeChildren: z.coerce.boolean().optional().default(false),
        parentId: z.string().optional(),
        take: z.coerce.number().optional().default(50),
        skip: z.coerce.number().optional().default(0),
    });

    // Collections
    fastify.get("/collections", {
        schema: {
            tags: ["Catalog"],
            querystring: collectionsQuerySchema
        }
    }, async (request) => {
        const { includeChildren, parentId, take, skip } = request.query as z.infer<typeof collectionsQuerySchema>;
        const { collections } = schema;

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
            with: {
                asset: true,
                ...(includeChildren ? { children: { with: { asset: true } } } : {})
            }
        });
        return { collections: results };
    });

    // Banners
    fastify.get("/banners", {
        schema: {
            tags: ["Marketing"],
            querystring: z.object({})
        }
    }, async () => {
        const results = await db.query.banners.findMany({
            where: eq(schema.banners.enabled, true),
            with: { desktopImage: true, mobileImage: true }
        });
        return { banners: results };
    });

    // Homepage Collections
    fastify.get("/homepage-collections", {
        schema: {
            tags: ["Marketing"],
            querystring: z.object({})
        }
    }, async () => {
        const results = await db.query.homepageCollections.findMany({
            where: eq(schema.homepageCollections.enabled, true),
            with: {
                products: { with: { product: { with: { assets: { with: { asset: true } } } } } }
            }
        });
        return { collections: results };
    });

    // Campaigns
    fastify.get("/campaigns", {
        schema: {
            tags: ["Marketing"],
            querystring: z.object({})
        }
    }, async () => {
        const results = await db.query.campaigns.findMany({
            where: eq(schema.campaigns.status, 'ACTIVE'),
        });
        return { campaigns: results };
    });

    const cartValidateSchema = z.object({
        items: z.array(z.any())
    });

    // Cart Validation
    fastify.post("/cart/validate", {
        schema: {
            tags: ["Cart"],
            body: cartValidateSchema
        }
    }, async (request) => {
        const { items } = request.body as z.infer<typeof cartValidateSchema>;
        return { valid: true, items };
    });

    // Shipping Info
    fastify.get("/shipping", {
        schema: {
            tags: ["Fulfillment"],
            querystring: z.object({})
        }
    }, async () => {
        const methods = await db.query.shippingMethods.findMany({
            where: eq(schema.shippingMethods.enabled, true),
            with: { zones: { with: { cities: true } } }
        });
        return { methods };
    });

    // Policies
    fastify.get("/policies", {
        schema: {
            tags: ["Store"],
            querystring: z.object({})
        }
    }, async () => {
        return {
            shippingPolicy: "Standard shipping policy...",
            returnPolicy: "30-day return policy...",
            privacyPolicy: "Privacy policy...",
            termsOfService: "Terms of service..."
        };
    });
};

export default storePublicRoutes;
