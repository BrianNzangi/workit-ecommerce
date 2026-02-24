import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";
import { buildCacheKey } from "../../../../lib/cache.js";

export const brandsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    const LIST_TTL_SECONDS = 900;
    const DETAIL_TTL_SECONDS = 900;
    const CACHE_TAG = "brands";

    // List Brands
    // List Brands
    fastify.get("/", {
        schema: {
            tags: ["Catalog"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (_request, reply) => {
        const cacheKey = buildCacheKey("public:brands:list");
        const cached = await fastify.cache.get<{ brands: any[] }>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${LIST_TTL_SECONDS}`);
            return cached;
        }

        const results = await db.query.brands.findMany({
            orderBy: [desc(schema.brands.name)],
        });
        const payload = { brands: results };
        await fastify.cache.set(cacheKey, payload, LIST_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${LIST_TTL_SECONDS}`);
        return payload;
    });

    // Show Brand
    // Show Brand
    fastify.get("/:id", {
        schema: {
            tags: ["Catalog"]
        },
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { id } = request.params as any;

        const cacheKey = `public:brands:detail:${id}`;
        const cached = await fastify.cache.get<any>(cacheKey);
        if (cached) {
            reply.header("x-cache", "HIT");
            reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
            return cached;
        }

        const brand = await db.query.brands.findFirst({
            where: eq(schema.brands.id, id),
        });
        if (!brand) return reply.status(404).send({ message: "Brand not found" });
        await fastify.cache.set(cacheKey, brand, DETAIL_TTL_SECONDS, [CACHE_TAG]);
        reply.header("x-cache", "MISS");
        reply.header("Cache-Control", `public, max-age=${DETAIL_TTL_SECONDS}`);
        return brand;
    });
};

export default brandsPublicRoutes;
