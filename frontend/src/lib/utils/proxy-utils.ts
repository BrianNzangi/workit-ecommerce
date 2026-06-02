import { getCachedData, setCachedData } from './redis';
import { rateLimit } from '../security/rate-limit';
import { headers } from 'next/headers';
import { observeApiRequestDuration } from './metrics';

type ProxyFetchOptions = RequestInit & {
    useRequestContext?: boolean;
};

const inflightRequests = new Map<string, Promise<Response>>();

function getBackendUrl() {
    // We use bracket notation to prevent Next.js from inlining these values at build time
    const env = process.env as Record<string, string | undefined>;
    return (
        env['BACKEND_API_URL'] ||
        env['NEXT_PUBLIC_BACKEND_URL'] ||
        env['NEXT_PUBLIC_API_URL'] ||
        'http://localhost:3001'
    ).replace(/\/$/, '');
}

export async function proxyFetch(path: string, options: ProxyFetchOptions = {}) {
    const isProduction = process.env.NODE_ENV === 'production';
    const startedAt = Date.now();
    const method = options.method?.toUpperCase() || 'GET';
    const useRequestContext = options.useRequestContext !== false;

    // 1. Rate Limiting (Protects the backend from abuse)
    if (useRequestContext) {
        try {
            const headerList = await headers();
            const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

            // Limit to 100 requests per minute per IP for proxy routes
            const limiter = await rateLimit(ip, 600, 60);

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
    }

    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const bypassCache = options.cache === 'no-store';
    const isExternalUrl = path.startsWith('http');
    // Cache all GET responses (internal and external) in Redis to absorb
    // backend cache-miss spikes and reduce load on the origin server.
    // The backend already caches, but a dual-layer cache (frontend + backend)
    // means a cache miss at the backend still gets served from the frontend.
    const canUseProxyCache = isProduction && !bypassCache;
    const cacheKey = `proxy:${path}`;

    // 2. Try to get from Redis cache if it's a GET request
    if (isGet && canUseProxyCache) {
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { 'Content-Type': 'application/json', 'x-cache': 'HIT' },
            });
        }
    }

    const backendUrl = getBackendUrl();
    const url = isExternalUrl ? path : `${backendUrl}${path}`;

    // Deduplicate in-flight GET requests to the same URL so concurrent
    // calls (e.g. 9 homepage-collection slug routes) share a single backend request.
    if (isGet) {
        const pending = inflightRequests.get(url);
        if (pending) {
            return pending.then(r => r.clone());
        }
    }

    const routeLabel = (() => {
        try {
            return isExternalUrl ? new URL(path).pathname || '/' : path.split('?')[0] || '/';
        } catch {
            return path.split('?')[0] || '/';
        }
    })();

    const env = process.env as Record<string, string | undefined>;
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-key': env['INTERNAL_API_KEY'] || '',
    };

    // Forward cookies if available
    if (useRequestContext) {
        try {
            const headerList = await headers();
            const cookie = headerList.get('cookie');
            if (cookie) {
                defaultHeaders['cookie'] = cookie;
            }
        } catch (e) {
            // next/headers might throw if called outside of request context
        }
    }

    try {
        const requestPromise = fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (isGet) {
            inflightRequests.set(url, requestPromise);
            requestPromise.finally(() => {
                if (inflightRequests.get(url) === requestPromise) {
                    inflightRequests.delete(url);
                }
            });
        }

        const response = await requestPromise;

        // 3. If it's a successful GET response, cache it in Redis
        if (isGet && response.ok && canUseProxyCache) {
            const clonedResponse = response.clone();
            try {
                const data = await clonedResponse.json();
                const ttl = (options as any).next?.revalidate || 300;
                await setCachedData(cacheKey, data, ttl);
            } catch (e) {
                // Not JSON or other error, skip caching
            }
        }

        observeApiRequestDuration(routeLabel, method, response.status, Date.now() - startedAt);
        return response;
    } catch (error) {
        observeApiRequestDuration(routeLabel, method, 500, Date.now() - startedAt);
        throw error;
    }
}
