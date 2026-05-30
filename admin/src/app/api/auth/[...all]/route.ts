import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = Number(process.env.ADMIN_AUTH_RATE_LIMIT_MAX) || 10;
const WINDOW_MS = (Number(process.env.ADMIN_AUTH_RATE_LIMIT_WINDOW_MS) || 60_000);

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return true;
    }

    if (record.count >= MAX_REQUESTS) return false;

    record.count++;
    return true;
}

// Cleanup stale entries every 60s
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
        if (now > val.resetAt) rateLimitMap.delete(key);
    }
}, 60_000);

function getBackendUrl() {
    const env = process.env as Record<string, string | undefined>;
    return (
        env.BACKEND_API_URL ||
        env.BACKEND_URL ||
        env.NEXT_PUBLIC_BACKEND_URL ||
        env.NEXT_PUBLIC_API_URL ||
        'http://localhost:3001'
    ).replace(/\/$/, '');
}

function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
    return req.headers.get('x-real-ip') || 'unknown';
}

async function handler(req: NextRequest) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        const ip = getClientIp(req);
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }
    }

    const backendUrl = getBackendUrl();
    const path = req.nextUrl.pathname.replace('/api/auth', '/auth');
    const url = `${backendUrl}${path}${req.nextUrl.search}`;

    try {
        const headers = new Headers(req.headers);

        headers.delete('host');
        headers.delete('connection');

        if (!headers.has('content-type')) {
            headers.set('content-type', 'application/json');
        }

        const body = req.method !== 'GET' && req.method !== 'HEAD'
            ? await req.arrayBuffer()
            : undefined;

        const response = await fetch(url, {
            method: req.method,
            headers,
            body,
            credentials: 'include',
            cache: 'no-store',
        });

        const data = await response.arrayBuffer();
        const responseHeaders = new Headers();

        const getSetCookie = (headers: Headers) => {
            const anyHeaders = headers as unknown as { getSetCookie?: () => string[] };
            if (typeof anyHeaders.getSetCookie === "function") {
                return anyHeaders.getSetCookie();
            }
            const single = headers.get("set-cookie");
            return single ? [single] : [];
        };

        const setCookies = getSetCookie(response.headers);

        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            if (key.toLowerCase() !== "transfer-encoding") {
                responseHeaders.set(key, value);
            }
        });

        setCookies.forEach((cookie) => {
            responseHeaders.append("set-cookie", cookie);
        });

        return new NextResponse(data, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('[Auth Proxy Error]:', error);
        return NextResponse.json(
            { error: 'Authentication service unavailable' },
            { status: 503 }
        );
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
