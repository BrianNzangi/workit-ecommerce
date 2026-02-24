import { NextRequest, NextResponse } from 'next/server';

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

/**
 * Proxy all auth requests to the Fastify backend
 * This is optimized for production and handles cookie/header forwarding correctly.
 */
async function handler(req: NextRequest) {
    const backendUrl = getBackendUrl();
    const path = req.nextUrl.pathname.replace('/api/auth', '/auth');
    const url = `${backendUrl}${path}${req.nextUrl.search}`;

    try {
        const headers = new Headers(req.headers);

        // Remove host header to avoid conflicts with backend
        headers.delete('host');
        headers.delete('connection');

        // Ensure content-type is forwarded if present
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
