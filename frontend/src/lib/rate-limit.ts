import { redis } from './redis';

/**
 * Simple Rate Limiter using Redis
 * 
 * @param identifier - Unique ID for the user (usually IP address)
 * @param limit - Max requests allowed
 * @param duration - Time window in seconds
 * @returns Object indicating if the request is allowed and remaining requests
 */
export async function rateLimit(
    identifier: string,
    limit: number = 60,
    duration: number = 60
) {
    if (!redis) return { success: true, limit, remaining: limit };

    const key = `ratelimit:${identifier}`;

    try {
        const requests = await redis.incr(key);

        if (requests === 1) {
            await redis.expire(key, duration);
        }

        const remaining = Math.max(0, limit - requests);
        const success = requests <= limit;

        return {
            success,
            limit,
            remaining,
            retryAfter: !success ? await redis.ttl(key) : undefined
        };
    } catch (error) {
        console.error('Rate Limit Error:', error);
        // On redis error, we allow the request to not break the app
        return { success: true, limit, remaining: limit };
    }
}
