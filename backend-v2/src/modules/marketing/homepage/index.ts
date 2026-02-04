import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../lib/db.js";
import homepageAdminRoutes from "./endpoints/admin.js";

export const homepageRoutes: FastifyPluginAsync = async (fastify) => {
    // Admin Routes
    await fastify.register(homepageAdminRoutes, { prefix: "/admin" });

    // Homepage Collections Public Routes
    // Homepage Collections
    fastify.get("/collections", {
        schema: {
            tags: ["Marketing"]
        }
    }, async () => {
        const results = await db.query.homepageCollections.findMany({
            orderBy: [desc(schema.homepageCollections.sortOrder)],
            with: {
                products: { with: { product: true } }
            }
        });
        return { collections: results };
    });

    fastify.get("/collections/:id", {
        schema: {
            tags: ["Marketing"]
        }
    }, async (request, reply) => {
        const { id } = request.params as any;
        const collection = await db.query.homepageCollections.findFirst({
            where: eq(schema.homepageCollections.id, id),
            with: {
                products: { with: { product: true } }
            }
        });
        if (!collection) return reply.status(404).send({ message: "Collection not found" });
        return collection;
    });
};

export default homepageRoutes;
