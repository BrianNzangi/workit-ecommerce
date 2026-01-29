import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ REDIS_URL is not set in production');
}

export const redis = redisUrl
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => Math.min(times * 50, 2000),
    })
    : null;

/**
 * Cache utility for Redis
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Redis Get Error [${key}]:`, error);
        return null;
    }
}

export async function setCachedData(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (error) {
        console.error(`Redis Set Error [${key}]:`, error);
    }
}
