import type { FastifyBaseLogger } from "fastify";
import type { Redis as RedisClient } from "ioredis";

export interface CacheStore {
    enabled: boolean;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds: number, tags?: string[]): Promise<void>;
    del(keys: string | string[]): Promise<void>;
    invalidateTag(tag: string): Promise<void>;
    invalidateTags(tags: string[]): Promise<void>;
    clearProxyCache(): Promise<void>;
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
            async clearProxyCache() {
                return;
            },
        };
    }

    const cacheGetTimeoutMs = Number(process.env.REDIS_CACHE_GET_TIMEOUT_MS ?? 150);
    const cacheWriteTimeoutMs = Number(process.env.REDIS_CACHE_WRITE_TIMEOUT_MS ?? 150);
    const cacheInvalidateTimeoutMs = Number(process.env.REDIS_CACHE_INVALIDATE_TIMEOUT_MS ?? 200);
    const failureThreshold = Number(process.env.REDIS_CACHE_FAILURE_THRESHOLD ?? 3);
    const circuitCooldownMs = Number(process.env.REDIS_CACHE_CIRCUIT_COOLDOWN_MS ?? 30_000);
    const verboseFailureCount = Number(process.env.REDIS_CACHE_VERBOSE_FAILURES ?? 3);

    let consecutiveFailures = 0;
    let circuitOpenUntil = 0;
    let circuitOpenLoggedUntil = 0;
    let circuitCloseLogged = false;

    const isRedisReady = () => Boolean(redis && redis.status === "ready");
    const isCircuitOpen = () => Date.now() < circuitOpenUntil;

    const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
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

    const openCircuit = (operation: string) => {
        const now = Date.now();
        circuitOpenUntil = now + circuitCooldownMs;
        if (circuitOpenLoggedUntil < circuitOpenUntil) {
            circuitOpenLoggedUntil = circuitOpenUntil;
            log?.warn(
                { operation, failures: consecutiveFailures, cooldownMs: circuitCooldownMs },
                "Redis cache circuit opened; temporarily bypassing cache",
            );
        }
    };

    const recordSuccess = () => {
        if (consecutiveFailures > 0) {
            consecutiveFailures = 0;
        }
        if (circuitOpenUntil > 0 && !isCircuitOpen() && !circuitCloseLogged) {
            circuitCloseLogged = true;
            circuitOpenUntil = 0;
            circuitOpenLoggedUntil = 0;
            log?.info("Redis cache circuit closed after recovery");
        }
    };

    const reportFailure = (operation: string, details: Record<string, unknown>, error: unknown) => {
        consecutiveFailures += 1;
        circuitCloseLogged = false;

        const level =
            consecutiveFailures <= verboseFailureCount
                ? "error"
                : consecutiveFailures === verboseFailureCount + 1
                    ? "warn"
                    : "debug";

        const message =
            consecutiveFailures <= verboseFailureCount
                ? `Redis cache ${operation} failed`
                : `Redis cache ${operation} failed; suppressing repeated logs`;

        const payload = { err: error, ...details };
        if (level === "error") {
            log?.error(payload, message);
        } else if (level === "warn") {
            log?.warn(payload, message);
        } else {
            log?.debug(payload, message);
        }

        if (consecutiveFailures >= failureThreshold) {
            openCircuit(operation);
        }
    };

    const store: CacheStore = {
        enabled: true,
        async get<T>(key: string): Promise<T | null> {
            if (!isRedisReady() || isCircuitOpen()) {
                return null;
            }
            try {
                const data = await withTimeout(redis.get(key), cacheGetTimeoutMs);
                recordSuccess();
                return data ? (JSON.parse(data) as T) : null;
            } catch (error) {
                reportFailure("get", { key }, error);
                return null;
            }
        },
        async set(key: string, value: unknown, ttlSeconds: number, tags?: string[]): Promise<void> {
            if (!isRedisReady() || isCircuitOpen()) {
                return;
            }

            let payload: string;
            try {
                payload = JSON.stringify(value);
            } catch (error) {
                reportFailure("set", { key }, error);
                return;
            }

            void (async () => {
                try {
                    const pipeline = redis.pipeline();
                    pipeline.set(key, payload, "EX", ttlSeconds);

                    if (Array.isArray(tags) && tags.length > 0) {
                        tags.forEach((tag) => {
                            const setKey = tagKey(tag);
                            pipeline.sadd(setKey, key);
                            pipeline.expire(setKey, ttlSeconds);
                        });
                    }

                    await withTimeout(pipeline.exec(), cacheWriteTimeoutMs);
                    recordSuccess();
                } catch (error) {
                    reportFailure("set", { key }, error);
                }
            })();
        },
        async del(keys: string | string[]): Promise<void> {
            if (!isRedisReady() || isCircuitOpen()) {
                return;
            }
            try {
                const list = Array.isArray(keys) ? keys : [keys];
                if (list.length > 0) {
                    await withTimeout(redis.del(...list), cacheInvalidateTimeoutMs);
                    recordSuccess();
                }
            } catch (error) {
                reportFailure("delete", { keys }, error);
            }
        },
        async invalidateTag(tag: string): Promise<void> {
            if (!isRedisReady() || isCircuitOpen()) {
                return;
            }
            try {
                const setKey = tagKey(tag);
                const keys = await withTimeout(redis.smembers(setKey), cacheInvalidateTimeoutMs);
                if (keys.length > 0) {
                    await withTimeout(redis.del(...keys), cacheInvalidateTimeoutMs);
                }
                await withTimeout(redis.del(setKey), cacheInvalidateTimeoutMs);
                recordSuccess();
            } catch (error) {
                reportFailure("invalidateTag", { tag }, error);
            }
        },
        async invalidateTags(tags: string[]): Promise<void> {
            if (!Array.isArray(tags) || tags.length === 0) {
                return;
            }
            void Promise.all(tags.map((tag) => store.invalidateTag(tag)));
        },
        async clearProxyCache(): Promise<void> {
            if (!isRedisReady() || isCircuitOpen()) {
                return;
            }
            try {
                const keys = await withTimeout(
                    redis.keys('proxy:*'),
                    cacheInvalidateTimeoutMs,
                );
                if (keys.length > 0) {
                    await withTimeout(redis.del(...keys), cacheInvalidateTimeoutMs);
                }
                recordSuccess();
            } catch (error) {
                reportFailure('clearProxyCache', {}, error);
            }
        },
    };

    return store;
}
