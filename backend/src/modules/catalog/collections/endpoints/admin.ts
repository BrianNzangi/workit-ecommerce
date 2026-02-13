import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, inArray, asc } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const collectionsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Collections
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { includeChildren } = request.query as any;

        const withRelations: any = {
            asset: true,
            products: true // We need this to count products if _count is not available via other means, or just don't include it if not asked
        };

        if (includeChildren === 'true') {
            withRelations.children = {
                orderBy: [asc(schema.collections.sortOrder as any)],
                with: {
                    asset: true,
                    products: true,
                    children: {
                        orderBy: [asc(schema.collections.sortOrder as any)],
                        with: {
                            asset: true,
                            products: true,
                        }
                    }
                }
            };
        }

        const results = await (db as any).query.collections.findMany({
            orderBy: [asc(schema.collections.sortOrder as any)],
            with: withRelations
        });

        const mapCollection = (col: any): any => ({
            ...col,
            _count: {
                products: col.products?.length || 0
            },
            children: col.children?.map((child: any) => ({
                ...child,
                _count: {
                    products: child.products?.length || 0
                },
                children: child.children?.map((grandchild: any) => ({
                    ...grandchild,
                    _count: {
                        products: grandchild.products?.length || 0
                    },
                    products: undefined,
                })),
                products: undefined,
            })),
            products: undefined
        });

        return {
            collections: results.map(mapCollection),
            success: true
        };
    });

    // New Collection
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        try {
            const collectionData = request.body as any;
            const id = uuidv4();
            const [collection] = await db.insert(schema.collections).values({ ...collectionData, id }).returning();
            return { collection, success: true };
        } catch (error: any) {
            if (error.code === '23505' && error.message.includes('Collection_slug_unique')) {
                return reply.status(400).send({
                    success: false,
                    message: "A collection with this slug already exists. Please use a unique slug."
                });
            }
            throw error;
        }
    });

    // Search Collections
    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { q } = request.query as any;
        const results = await (db as any).query.collections.findMany({
            where: ilike(schema.collections.name as any, `%${q}%`),
            with: { asset: true }
        });
        return { collections: results, success: true };
    });

    // Show Collection
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const collection = await db.query.collections.findFirst({
            where: eq(schema.collections.id, id),
            with: { asset: true }
        });
        if (!collection) return reply.status(404).send({ message: "Collection not found" });
        return collection;
    });

    // Update Collection Handler
    const updateCollectionHandler = async (request: any, reply: any) => {
        try {
            const { id } = request.params as any;
            const collectionData = request.body as any;
            const [collection] = await db.update(schema.collections).set({ ...collectionData, updatedAt: new Date() }).where(eq(schema.collections.id, id)).returning();
            if (!collection) return reply.status(404).send({ message: "Collection not found" });
            return { collection, success: true };
        } catch (error: any) {
            if (error.code === '23505' && error.message.includes('Collection_slug_unique')) {
                return reply.status(400).send({
                    success: false,
                    message: "A collection with this slug already exists. Please use a unique slug."
                });
            }
            throw error;
        }
    };

    // Edit Collection
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateCollectionHandler);

    // Edit Collection (PATCH Alias)
    fastify.patch("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateCollectionHandler);

    // Delete Collection
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.collections).where(eq(schema.collections.id, id));
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
        await db.delete(schema.collections).where(inArray(schema.collections.id, ids));
        return { success: true, count: ids.length };
    });
};

export default collectionsAdminRoutes;
