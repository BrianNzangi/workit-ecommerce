import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, and } from "../../../../lib/db.js";

export const bannersPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List Banners
    // List Banners
    fastify.get("/", {
        schema: {
            tags: ["Marketing"]
        }
    }, async () => {
        const results = await db.query.banners.findMany({
            where: eq(schema.banners.enabled, true),
            orderBy: [desc(schema.banners.sortOrder)],
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
        return { banners: results };
    });

    // Get Banners by Position
    // Get Banners by Position
    fastify.get("/position/:position", {
        schema: {
            tags: ["Marketing"]
        }
    }, async (request) => {
        const { position } = request.params as any;
        const results = await db.query.banners.findMany({
            where: and(
                eq(schema.banners.position, position as any),
                eq(schema.banners.enabled, true)
            ),
            orderBy: [desc(schema.banners.sortOrder)],
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
        return { banners: results };
    });

    // Show Banner (Single)
    // Show Banner (Single)
    fastify.get("/:id", {
        schema: {
            tags: ["Marketing"]
        }
    }, async (request, reply) => {
        const { id } = request.params as any;
        const banner = await db.query.banners.findFirst({
            where: and(eq(schema.banners.id, id), eq(schema.banners.enabled, true)),
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
        if (!banner) return reply.status(404).send({ message: "Banner not found" });
        return banner;
    });
};

export default bannersPublicRoutes;

