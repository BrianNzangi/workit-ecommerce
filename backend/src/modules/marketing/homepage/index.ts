import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../lib/db.js";
import { buildCacheKey } from "../../../lib/cache.js";
import homepageAdminRoutes from "./endpoints/admin.js";

export const homepageRoutes: FastifyPluginAsync = async (fastify) => {
    const LIST_TTL_SECONDS = 300;
    const DETAIL_TTL_SECONDS = 300;
    const CACHE_TAG = "homepage-collections";

    // Admin Routes
    await fastify.register(homepageAdminRoutes, { prefix: "/admin" });

    // Homepage Collections Public Routes
    // Homepage Collections
    fastify.get("/collections", {
        schema: {
            tags: ["Marketing"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("public:homepage:collections:list");
        const cached = await fastify.cache.get<{ collections: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${LIST_TTL_SECONDS}`);
            return cached;
        }

        const results = await db.query.homepageCollections.findMany({
            orderBy: [desc(schema.homepageCollections.sortOrder)],
            with: {
                products: { with: { product: true } }
            }
        });
        const payload = { collections: results };
        await fastify.cache.set(cacheKey, payload, LIST_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${LIST_TTL_SECONDS}`);
        return payload;
    });

    fastify.get("/collections/:id", {
        schema: {
            tags: ["Marketing"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { id } = request.params as any;

        const cacheKey = `public:homepage:collections:detail:${id}`;
        const cached = await fastify.cache.get<any>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
            return cached;
        }

        const collection = await db.query.homepageCollections.findFirst({
            where: eq(schema.homepageCollections.id, id),
            with: {
                products: { with: { product: true } }
            }
        });
        if (!collection) return reply.status(404).send({ message: "Collection not found" });
        await fastify.cache.set(cacheKey, collection, DETAIL_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
        return collection;
    });
};

export default homepageRoutes;
