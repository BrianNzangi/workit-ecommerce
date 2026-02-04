import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";

const assetsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/", {
        schema: {
            tags: ["Catalog"]
        }
    }, async () => {
        const results = await db.query.assets.findMany({
            orderBy: [desc(schema.assets.createdAt)],
        });
        return { assets: results };
    });

    fastify.get("/:id", {
        schema: {
            tags: ["Catalog"]
        }
    }, async (request, reply) => {
        const { id } = request.params as any;
        const asset = await db.query.assets.findFirst({
            where: eq(schema.assets.id, id),
        });
        if (!asset) return reply.status(404).send({ message: "Asset not found" });
        return asset;
    });
};

export default assetsPublicRoutes;
