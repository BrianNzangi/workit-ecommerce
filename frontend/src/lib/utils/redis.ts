import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

let warned = false;

if (!redisUrl && process.env.NODE_ENV === 'production' && !warned) {
    warned = true;
    console.warn('⚠️ REDIS_URL is not set in production');
}

export const redis = redisUrl
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        connectTimeout: 1000,
        retryStrategy: () => null,
    })
    : null;

function isRedisReady() {
    return Boolean(redis && redis.status === 'ready');
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 250): Promise<T> {
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
}

/**
 * Cache utility for Redis
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
    if (!isRedisReady()) return null;
    try {
        const client = redis;
        if (!client) return null;
        const data = await withTimeout(client.get(key));
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Redis Get Error [${key}]:`, error);
        return null;
    }
}

export async function setCachedData(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    if (!isRedisReady()) return;
    try {
        const client = redis;
        if (!client) return;
        await withTimeout(client.set(key, JSON.stringify(data), 'EX', ttlSeconds));
    } catch (error) {
        console.error(`Redis Set Error [${key}]:`, error);
    }
}
