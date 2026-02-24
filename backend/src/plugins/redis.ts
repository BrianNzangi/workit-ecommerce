import fp from "fastify-plugin";
import Redis from "ioredis";
import { createCacheStore } from "../lib/cache.js";

declare module "fastify" {
    interface FastifyInstance {
        redis: Redis | null;
        cache: ReturnType<typeof createCacheStore>;
    }
}

export default fp(async (fastify) => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        fastify.log.warn("REDIS_URL not set; Redis features disabled");
        fastify.decorate("redis", null);
        fastify.decorate("cache", createCacheStore(null));
        return;
    }

    const client = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    fastify.decorate("redis", client);
    fastify.decorate("cache", createCacheStore(client, fastify.log));

    fastify.addHook("onClose", async () => {
        try {
            await client.quit();
        } catch {
            client.disconnect();
        }
    });
}, { name: "redis" });
