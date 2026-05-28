import type { FastifyBaseLogger } from "fastify";
import type { Redis as RedisClient } from "ioredis";

export interface CacheStore {
    enabled: boolean;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds: number, tags?: string[]): Promise<void>;
    del(keys: string | string[]): Promise<void>;
    invalidateTag(tag: string): Promise<void>;
    invalidateTags(tags: string[]): Promise<void>;
}

const tagKey = (tag: string) => `cache:tag:${tag}`;

export function buildCacheKey(prefix: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
        return prefix;
    }

    const entries: Array<[string, string]> = [];
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item !== undefined && item !== null) {
                    entries.push([key, String(item)]);
                }
            });
            return;
        }
        entries.push([key, String(value)]);
    });

    entries.sort(([a], [b]) => a.localeCompare(b));

    const query = new URLSearchParams(entries).toString();
    return query ? `${prefix}?${query}` : prefix;
}

export function createCacheStore(redis: RedisClient | null, log?: FastifyBaseLogger): CacheStore {
    const enableCacheInDev = process.env.ENABLE_CACHE_IN_DEV === "true";
    const cacheEnabled = Boolean(redis) && (process.env.NODE_ENV === "production" || enableCacheInDev);

    if (!cacheEnabled || !redis) {
        return {
            enabled: false,
            async get<T>() {
                return null;
            },
            async set() {
                return;
            },
            async del() {
                return;
            },
            async invalidateTag() {
                return;
            },
            async invalidateTags() {
                return;
            },
        };
    }

    const isRedisReady = () => Boolean(redis && redis.status === "ready");
    const withTimeout = async <T>(promise: Promise<T>, timeoutMs = 250): Promise<T> => {
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
        try {
            return await Promise.race([
                promise,
                new Promise<T>((_, reject) => {
                    timeoutHandle = setTimeout(() => reject(new Error("Redis operation timed out")), timeoutMs);
                }),
            ]);
        } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle);
        }
    };

    return {
        enabled: true,
        async get<T>(key: string): Promise<T | null> {
            if (!isRedisReady()) {
                return null;
            }
            try {
                const data = await withTimeout(redis.get(key));
                return data ? (JSON.parse(data) as T) : null;
            } catch (error) {
                log?.error({ error, key }, "Redis cache get failed");
                return null;
            }
        },
        async set(key: string, value: unknown, ttlSeconds: number, tags?: string[]): Promise<void> {
            if (!isRedisReady()) {
                return;
            }
            try {
                const payload = JSON.stringify(value);
                const pipeline = redis.pipeline();
                pipeline.set(key, payload, "EX", ttlSeconds);

                if (Array.isArray(tags) && tags.length > 0) {
                    tags.forEach((tag) => {
                        const tagSet = tagKey(tag);
                        pipeline.sadd(tagSet, key);
                        pipeline.expire(tagSet, ttlSeconds);
                    });
                }

                await withTimeout(pipeline.exec());
            } catch (error) {
                log?.error({ error, key }, "Redis cache set failed");
            }
        },
        async del(keys: string | string[]): Promise<void> {
            if (!isRedisReady()) {
                return;
            }
            try {
                const list = Array.isArray(keys) ? keys : [keys];
                if (list.length > 0) {
                    await withTimeout(redis.del(...list));
                }
            } catch (error) {
                log?.error({ error, keys }, "Redis cache delete failed");
            }
        },
        async invalidateTag(tag: string): Promise<void> {
            if (!isRedisReady()) {
                return;
            }
            try {
                const setKey = tagKey(tag);
                const keys = await withTimeout(redis.smembers(setKey));
                if (keys.length > 0) {
                    await withTimeout(redis.del(...keys));
                }
                await withTimeout(redis.del(setKey));
            } catch (error) {
                log?.error({ error, tag }, "Redis cache tag invalidation failed");
            }
        },
        async invalidateTags(tags: string[]): Promise<void> {
            for (const tag of tags) {
                await this.invalidateTag(tag);
            }
        },
    };
}
