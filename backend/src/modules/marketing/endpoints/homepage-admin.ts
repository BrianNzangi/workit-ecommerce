import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, asc } from "../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const homepageAdminRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.content.manage')]
    }, async () => {
        const results = await db.query.homepageCollections.findMany({
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
                                sku: true,
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
                            },
                        },
                    },
                },
            },
        });

        return { collections: results };
    });

    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.content.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;

        const collection = await db.query.homepageCollections.findFirst({
            where: eq(schema.homepageCollections.id, id),
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
                                sku: true,
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
                            },
                        },
                    },
                },
            },
        });

        if (!collection) {
            return reply.status(404).send({ message: "Homepage collection not found" });
        }

        return { collection };
    });

    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.content.manage')]
    }, async (request, reply) => {
        try {
            const data = request.body as any;
            const id = uuidv4();
            const now = new Date();

            const [collection] = await db.insert(schema.homepageCollections).values({
                id,
                title: data.title,
                slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                enabled: data.enabled ?? true,
                sortOrder: data.sortOrder ?? 0,
                createdAt: now,
                updatedAt: now,
            }).returning();

            if (data.productIds?.length > 0) {
                const productLinks = data.productIds.map((productId: string, index: number) => ({
                    id: uuidv4(),
                    collectionId: id,
                    productId,
                    sortOrder: index,
                }));

                await db.insert(schema.homepageCollectionProducts).values(productLinks);
            }

            await fastify.cache?.invalidateTags?.(["homepage-collections"]);

            return { collection };
        } catch (error: any) {
            if (error.cause?.code === '23505' || error.message?.includes('HomepageCollection_slug_unique')) {
                return reply.status(400).send({
                    success: false,
                    message: "A homepage collection with this slug already exists."
                });
            }
            throw error;
        }
    });

    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.content.manage')]
    }, async (request, reply) => {
        try {
            const { id } = request.params as any;
            const data = request.body as any;
            const now = new Date();

            const existing = await db.query.homepageCollections.findFirst({
                where: eq(schema.homepageCollections.id, id),
            });

            if (!existing) {
                return reply.status(404).send({ message: "Homepage collection not found" });
            }

            const updateData: any = { updatedAt: now };

            if (data.title !== undefined) updateData.title = data.title;
            if (data.slug !== undefined) updateData.slug = data.slug;
            if (data.enabled !== undefined) updateData.enabled = data.enabled;
            if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

            const [collection] = await db.update(schema.homepageCollections)
                .set(updateData)
                .where(eq(schema.homepageCollections.id, id))
                .returning();

            if (data.productIds !== undefined) {
                await db.delete(schema.homepageCollectionProducts)
                    .where(eq(schema.homepageCollectionProducts.collectionId, id));

                if (data.productIds.length > 0) {
                    const productLinks = data.productIds.map((productId: string, index: number) => ({
                        id: uuidv4(),
                        collectionId: id,
                        productId,
                        sortOrder: index,
                    }));

                    await db.insert(schema.homepageCollectionProducts).values(productLinks);
                }
            }

            await fastify.cache?.invalidateTags?.(["homepage-collections"]);

            return { collection };
        } catch (error: any) {
            if (error.cause?.code === '23505' || error.message?.includes('HomepageCollection_slug_unique')) {
                return reply.status(400).send({
                    success: false,
                    message: "A homepage collection with this slug already exists."
                });
            }
            throw error;
        }
    });

    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.content.manage')]
    }, async (request) => {
        const { id } = request.params as any;

        await db.delete(schema.homepageCollections).where(eq(schema.homepageCollections.id, id));
        await fastify.cache?.invalidateTags?.(["homepage-collections"]);
        return { success: true };
    });
};

export default homepageAdminRoutes;
