import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, or, inArray, and } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const productsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Products (Admin view might include more details)
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { limit = 100, offset = 0, collectionId, brandId, enabled } = request.query as any;

        const conditions = [];

        if (enabled !== undefined) {
            conditions.push(eq(schema.products.enabled as any, enabled === 'true'));
        }

        if (brandId) {
            conditions.push(eq(schema.products.brandId as any, brandId));
        }

        if (collectionId) {
            conditions.push(inArray(
                schema.products.id as any,
                db.select({ id: schema.productCollections.productId as any })
                    .from(schema.productCollections as any)
                    .where(eq(schema.productCollections.collectionId as any, collectionId))
            ));
        }

        const results = await (db as any).query.products.findMany({
            limit: Number(limit),
            offset: Number(offset),
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [desc(schema.products.createdAt as any)],
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                homepageCollections: { with: { collection: true } },
                brand: true
            },
        });
        return { products: results, success: true };
    });

    // New Product
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { collections: collectionIds, assetIds, homepageCollections: homepageCollectionIds, ...productData } = request.body as any;
        const id = uuidv4();

        const existingBySlug = await (db as any).query.products.findFirst({
            where: eq(schema.products.slug as any, productData.slug),
        });
        if (existingBySlug) return reply.status(400).send({ message: "Product with this slug already exists" });

        const [product] = await db.insert(schema.products as any).values({ ...productData, id }).returning();

        if (collectionIds && collectionIds.length > 0) {
            await db.insert(schema.productCollections as any).values(
                collectionIds.map((collectionId: string) => ({
                    id: uuidv4(),
                    productId: product.id,
                    collectionId,
                }))
            );
        }

        if (assetIds && assetIds.length > 0) {
            await db.insert(schema.productAssets as any).values(
                assetIds.map((assetId: string, index: number) => ({
                    id: uuidv4(),
                    productId: product.id,
                    assetId,
                    sortOrder: index,
                }))
            );
        }

        if (homepageCollectionIds && homepageCollectionIds.length > 0) {
            await db.insert(schema.homepageCollectionProducts as any).values(
                homepageCollectionIds.map((hcid: string, index: number) => ({
                    id: uuidv4(),
                    productId: product.id,
                    collectionId: hcid,
                    sortOrder: index
                }))
            );
        }

        return { product, success: true };
    });

    // Search Products (Admin)
    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { q } = request.query as any;
        const results = await (db as any).query.products.findMany({
            where: or(
                ilike(schema.products.name as any, `%${q}%`),
                ilike(schema.products.sku as any, `%${q}%`)
            ),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                homepageCollections: { with: { collection: true } },
                brand: true
            },
        });
        return { products: results, success: true };
    });

    // Show Product (Admin)
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const product = await (db as any).query.products.findFirst({
            where: eq(schema.products.id as any, id),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                homepageCollections: { with: { collection: true } },
                brand: true
            },
        });
        if (!product) return reply.status(404).send({ message: "Product not found" });
        return { product, success: true };
    });

    // Update Handler
    const updateProductHandler = async (request: any, reply: any) => {
        const { id } = request.params as any;
        const { collections: collectionIds, assetIds, homepageCollections: homepageCollectionIds, ...productData } = request.body as any;

        const [product] = await db
            .update(schema.products as any)
            .set({ ...productData, updatedAt: new Date() })
            .where(eq(schema.products.id as any, id))
            .returning();

        if (!product) return reply.status(404).send({ message: "Product not found" });

        if (collectionIds !== undefined) {
            await db.delete(schema.productCollections as any).where(eq(schema.productCollections.productId as any, id));
            if (collectionIds.length > 0) {
                await db.insert(schema.productCollections as any).values(
                    collectionIds.map((cid: string) => ({ id: uuidv4(), productId: id, collectionId: cid }))
                );
            }
        }

        if (assetIds !== undefined) {
            await db.delete(schema.productAssets as any).where(eq(schema.productAssets.productId as any, id));
            if (assetIds.length > 0) {
                await db.insert(schema.productAssets as any).values(
                    assetIds.map((aid: string, index: number) => ({ id: uuidv4(), productId: id, assetId: aid, sortOrder: index }))
                );
            }
        }

        if (homepageCollectionIds !== undefined) {
            await db.delete(schema.homepageCollectionProducts as any).where(eq(schema.homepageCollectionProducts.productId as any, id));
            if (homepageCollectionIds.length > 0) {
                await db.insert(schema.homepageCollectionProducts as any).values(
                    homepageCollectionIds.map((hcid: string, index: number) => ({
                        id: uuidv4(),
                        productId: id,
                        collectionId: hcid,
                        sortOrder: index
                    }))
                );
            }
        }

        return { product, success: true };
    };

    // Edit Product
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateProductHandler);

    // Edit Product (PATCH Alias)
    fastify.patch("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateProductHandler);

    // Delete Product
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.products as any).where(eq(schema.products.id as any, id));
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: "No IDs provided" };
        }
        await db.delete(schema.products as any).where(inArray(schema.products.id as any, ids));
        return { success: true, count: ids.length };
    });
};

export default productsAdminRoutes;
