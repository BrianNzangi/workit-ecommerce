import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (
    process.env.BACKEND_API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3001'
).replace(/\/$/, '');
const CRON_SECRET = process.env.CRON_SECRET || 'workit-cron-secret-2024';
const CSRF_COOKIE_NAME = process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME?.trim() || 'XSRF-TOKEN';
const CSRF_HEADER_NAME = (
    process.env.NEXT_PUBLIC_CSRF_HEADER_NAME?.trim() ||
    process.env.CSRF_HEADER_NAME?.trim() ||
    'x-xsrf-token'
).toLowerCase();

function getCookieValue(cookieHeader: string | null, name: string) {
    if (!cookieHeader) return undefined;

    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
        const [rawName, ...rest] = cookie.trim().split('=');
        if (rawName === name) {
            return decodeURIComponent(rest.join('='));
        }
    }

    return undefined;
}

async function callBackend(endpoint: string, init?: RequestInit) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');
    const authHeader = headersList.get('authorization');
    const csrfToken =
        headersList.get(CSRF_HEADER_NAME) ||
        headersList.get('x-xsrf-token') ||
        headersList.get('x-csrf-token') ||
        getCookieValue(cookie, CSRF_COOKIE_NAME);

    return fetch(`${BACKEND_URL}${endpoint}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(cookie ? { Cookie: cookie } : {}),
            ...(authHeader ? { Authorization: authHeader } : {}),
            ...(csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {}),
            ...((init?.headers as Record<string, string> | undefined) || {}),
        },
    });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ job: string }> }) {
    const { job } = await params;

    try {
        let response: Response;

        response = await callBackend(`/cron/${job}`, {
            headers: {
                Authorization: `Bearer ${CRON_SECRET}`,
            },
        });

        const data = await response.json().catch(() => ({}));

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to execute cron job', message: error.message },
            { status: 500 }
        );
    }
}
