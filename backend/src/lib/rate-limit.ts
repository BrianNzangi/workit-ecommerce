import type { Redis as RedisClient } from "ioredis";

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    retryAfter?: number;
}

export async function rateLimit(
    redis: RedisClient | null,
    key: string,
    limit = 120,
    durationSeconds = 60,
): Promise<RateLimitResult> {
    if (!redis || redis.status !== "ready") {
        return { success: true, limit, remaining: limit };
    }

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

    try {
        const requests = await withTimeout(redis.incr(key));

        if (requests === 1) {
            await withTimeout(redis.expire(key, durationSeconds));
        }

        const remaining = Math.max(0, limit - requests);
        const success = requests <= limit;

        return {
            success,
            limit,
            remaining,
            retryAfter: !success ? await withTimeout(redis.ttl(key)) : undefined,
        };
    } catch (error) {
        // Fail open to avoid breaking the store if Redis is down
        return { success: true, limit, remaining: limit };
    }
}
