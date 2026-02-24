import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";
import { buildCacheKey } from "../../../../lib/cache.js";

export const collectionsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    const LIST_TTL_SECONDS = 900;
    const DETAIL_TTL_SECONDS = 900;
    const CACHE_TAG = "collections";

    // List Collections
    // List Collections
    fastify.get("/", {
        schema: {
            tags: ["Catalog"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("public:collections:list");
        const cached = await fastify.cache.get<{ collections: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${LIST_TTL_SECONDS}`);
            return cached;
        }

        const results = await db.query.collections.findMany({
            orderBy: [desc(schema.collections.name)],
            with: { asset: true }
        });
        const payload = { collections: results };
        await fastify.cache.set(cacheKey, payload, LIST_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${LIST_TTL_SECONDS}`);
        return payload;
    });

    // Show Collection
    // Show Collection
    fastify.get("/:id", {
        schema: {
            tags: ["Catalog"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { id } = request.params as any;

        const cacheKey = `public:collections:detail:${id}`;
        const cached = await fastify.cache.get<any>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
            return cached;
        }

        const collection = await db.query.collections.findFirst({
            where: eq(schema.collections.id, id),
            with: { asset: true }
        });
        if (!collection) return reply.status(404).send({ message: "Collection not found" });
        await fastify.cache.set(cacheKey, collection, DETAIL_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
        return collection;
    });

    // Show Collection by Slug
    // Show Collection by Slug
    fastify.get("/slug/:slug", {
        schema: {
            tags: ["Catalog"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { slug } = request.params as any;

        const cacheKey = `public:collections:slug:${slug}`;
        const cached = await fastify.cache.get<any>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
            return cached;
        }

        const collection = await db.query.collections.findFirst({
            where: eq(schema.collections.slug, slug),
            with: { asset: true }
        });
        if (!collection) return reply.status(404).send({ message: "Collection not found" });
        await fastify.cache.set(cacheKey, collection, DETAIL_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
        return collection;
    });
};

export default collectionsPublicRoutes;
