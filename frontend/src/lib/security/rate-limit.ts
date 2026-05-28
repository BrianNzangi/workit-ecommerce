import { redis } from '../utils/redis';

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
    if (!redis || redis.status !== 'ready') return { success: true, limit, remaining: limit };

    const key = `ratelimit:${identifier}`;
    const withTimeout = async <T>(promise: Promise<T>, timeoutMs = 250): Promise<T> => {
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
        try {
            return await Promise.race([
                promise,
                new Promise<T>((_, reject) => {
                    timeoutHandle = setTimeout(() => reject(new Error('Redis operation timed out')), timeoutMs);
                }),
            ]);
        } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle);
        }
    };

    try {
        const requests = await withTimeout(redis.incr(key));

        if (requests === 1) {
            await withTimeout(redis.expire(key, duration));
        }

        const remaining = Math.max(0, limit - requests);
        const success = requests <= limit;

        return {
            success,
            limit,
            remaining,
            retryAfter: !success ? await withTimeout(redis.ttl(key)) : undefined
        };
    } catch (error) {
        console.error('Rate Limit Error:', error);
        // On redis error, we allow the request to not break the app
        return { success: true, limit, remaining: limit };
    }
}
