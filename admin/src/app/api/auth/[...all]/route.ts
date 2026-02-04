import { NextRequest, NextResponse } from 'next/server';

const ENCORE_AUTH_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Proxy all auth requests to the Encore backend
 */
async function handler(req: NextRequest) {
    const path = req.nextUrl.pathname.replace('/api/auth', '/auth');
    const url = `${ENCORE_AUTH_URL}${path}${req.nextUrl.search}`;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': req.headers.get('cookie') || '',
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
            credentials: 'include',
        });

        const data = await response.text();
        const headers = new Headers();

        // Forward cookies from Encore backend
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'set-cookie') {
                headers.append(key, value);
            } else {
                headers.set(key, value);
            }
        });

        return new NextResponse(data, {
            status: response.status,
            headers,
        });
    } catch (error) {
        console.error('Auth proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to auth service' },
            { status: 500 }
        );
    }
}

export const GET = handler;
export const POST = handler;
