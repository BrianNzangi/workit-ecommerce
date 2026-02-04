
import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const homepageAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Collections (Admin)
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async () => {
        const results = await db.query.homepageCollections.findMany({
            orderBy: [desc(schema.homepageCollections.sortOrder)],
            with: {
                products: { with: { product: true } }
            }
        });
        return { collections: results, success: true };
    });

    // Create Collection
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { title, enabled, sortOrder, productIds } = request.body as any;
        const id = uuidv4();

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const [collection] = await db.insert(schema.homepageCollections).values({
            id,
            title,
            slug,
            enabled: enabled ?? true,
            sortOrder: sortOrder ?? 0,
        }).returning();

        if (productIds && Array.isArray(productIds) && productIds.length > 0) {
            await db.insert(schema.homepageCollectionProducts).values(
                productIds.map((productId: string, index: number) => ({
                    id: uuidv4(),
                    collectionId: collection.id,
                    productId,
                    sortOrder: index
                }))
            );
        }

        return { collection, success: true };
    });

    // Get Collection
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const collection = await db.query.homepageCollections.findFirst({
            where: eq(schema.homepageCollections.id, id),
            with: {
                products: { with: { product: true } }
            }
        });
        if (!collection) return reply.status(404).send({ message: "Collection not found" });
        return { collection, success: true };
    });

    // Update Handler
    const updateHomepageCollectionHandler = async (request: any, reply: any) => {
        const { id } = request.params as any;
        const { title, enabled, sortOrder, productIds } = request.body as any;

        const updateData: any = { updatedAt: new Date() };
        if (title) {
            updateData.title = title;
            updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (enabled !== undefined) updateData.enabled = enabled;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

        const [collection] = await db.update(schema.homepageCollections)
            .set(updateData)
            .where(eq(schema.homepageCollections.id, id))
            .returning();

        if (!collection) return reply.status(404).send({ message: "Collection not found" });

        // Update products associations if provided
        if (productIds !== undefined && Array.isArray(productIds)) {
            // Remove existing
            await db.delete(schema.homepageCollectionProducts)
                .where(eq(schema.homepageCollectionProducts.collectionId, id));

            // Add new
            if (productIds.length > 0) {
                await db.insert(schema.homepageCollectionProducts).values(
                    productIds.map((productId: string, index: number) => ({
                        id: uuidv4(),
                        collectionId: id,
                        productId,
                        sortOrder: index
                    }))
                );
            }
        }

        return { collection, success: true };
    };

    // Update Collection
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateHomepageCollectionHandler);

    // Update Collection (PATCH Alias)
    fastify.patch("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateHomepageCollectionHandler);

    // Delete Collection
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.homepageCollections).where(eq(schema.homepageCollections.id, id));
        return { success: true };
    });
};

export default homepageAdminRoutes;
