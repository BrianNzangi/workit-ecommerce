import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy all auth requests to the Fastify backend
 * This is optimized for production and handles cookie/header forwarding correctly.
 */
async function handler(req: NextRequest) {
    const path = req.nextUrl.pathname.replace('/api/auth', '/auth');
    const url = `${BACKEND_URL}${path}${req.nextUrl.search}`;

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

        // Forward all headers from backend, especially set-cookie
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'set-cookie') {
                responseHeaders.append(key, value);
            } else if (key.toLowerCase() !== 'transfer-encoding') {
                responseHeaders.set(key, value);
            }
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
