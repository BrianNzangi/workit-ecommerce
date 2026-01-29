import { getCachedData, setCachedData } from './redis';
import { rateLimit } from './rate-limit';
import { headers } from 'next/headers';

export const BACKEND_URL = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001'
).replace(/\/$/, '');

export async function proxyFetch(path: string, options: RequestInit = {}) {
    // 1. Rate Limiting (Protects the backend from abuse)
    try {
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

        // Limit to 100 requests per minute per IP for proxy routes
        const limiter = await rateLimit(ip, 120, 60);

        if (!limiter.success) {
            return new Response(JSON.stringify({
                error: 'Too Many Requests',
                retryAfter: limiter.retryAfter
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(limiter.retryAfter)
                },
            });
        }
    } catch (e) {
        // next/headers might throw if called outside of request context
        // we skip rate limiting in that case
    }

    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const cacheKey = `proxy:${path}`;

    // 2. Try to get from Redis cache if it's a GET request
    if (isGet) {
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { 'Content-Type': 'application/json', 'x-cache': 'HIT' },
            });
        }
    }

    const url = path.startsWith('http') ? path : `${BACKEND_URL}${path}`;

    if (BACKEND_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
        console.warn(`⚠️ [Proxy Warning] Frontend is defaulting to localhost in production! URL: ${url}`);
    } else {
        console.log(`[Proxy] Fetching: ${url}`);
    }

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-key': process.env.INTERNAL_API_KEY || '',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    // 3. If it's a successful GET response, cache it in Redis
    if (isGet && response.ok) {
        const clonedResponse = response.clone();
        try {
            const data = await clonedResponse.json();
            const ttl = (options as any).next?.revalidate || 300;
            await setCachedData(cacheKey, data, ttl);
        } catch (e) {
            // Not JSON or other error, skip caching
        }
    }

    return response;
}
