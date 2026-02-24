import type Redis from "ioredis";

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    retryAfter?: number;
}

export async function rateLimit(
    redis: Redis | null,
    key: string,
    limit = 120,
    durationSeconds = 60,
): Promise<RateLimitResult> {
    if (!redis) {
        return { success: true, limit, remaining: limit };
    }

    try {
        const requests = await redis.incr(key);

        if (requests === 1) {
            await redis.expire(key, durationSeconds);
        }

        const remaining = Math.max(0, limit - requests);
        const success = requests <= limit;

        return {
            success,
            limit,
            remaining,
            retryAfter: !success ? await redis.ttl(key) : undefined,
        };
    } catch (error) {
        // Fail open to avoid breaking the store if Redis is down
        return { success: true, limit, remaining: limit };
    }
}
