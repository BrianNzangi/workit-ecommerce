import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";

export const collectionsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List Collections
    // List Collections
    fastify.get("/", {
        schema: {
            tags: ["Catalog"]
        }
    }, async () => {
        const results = await db.query.collections.findMany({
            orderBy: [desc(schema.collections.name)],
            with: { asset: true }
        });
        return { collections: results };
    });

    // Show Collection
    // Show Collection
    fastify.get("/:id", {
        schema: {
            tags: ["Catalog"]
        }
    }, async (request, reply) => {
        const { id } = request.params as any;
        const collection = await db.query.collections.findFirst({
            where: eq(schema.collections.id, id),
            with: { asset: true }
        });
        if (!collection) return reply.status(404).send({ message: "Collection not found" });
        return collection;
    });

    // Show Collection by Slug
    // Show Collection by Slug
    fastify.get("/slug/:slug", {
        schema: {
            tags: ["Catalog"]
        }
    }, async (request, reply) => {
        const { slug } = request.params as any;
        const collection = await db.query.collections.findFirst({
            where: eq(schema.collections.slug, slug),
            with: { asset: true }
        });
        if (!collection) return reply.status(404).send({ message: "Collection not found" });
        return collection;
    });
};

export default collectionsPublicRoutes;
