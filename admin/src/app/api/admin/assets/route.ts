import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { proxyRequest } from '@/lib/shared/network';

// Next.js App Router route segment config for large uploads
export const maxDuration = 60; // seconds

function getBackendUrl() {
    const env = process.env as Record<string, string | undefined>;
    return (
        env['BACKEND_API_URL'] ||
        env['BACKEND_URL'] ||
        env['NEXT_PUBLIC_BACKEND_URL'] ||
        env['NEXT_PUBLIC_API_URL'] ||
        'http://localhost:3001'
    ).replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
    const { search } = new URL(request.url);
    return proxyRequest(request, `/catalog/assets/admin${search}`);
}

export async function POST(request: NextRequest) {
    // For file uploads, stream the raw request body to the backend
    // instead of re-parsing FormData (which can corrupt multipart boundaries)
    const headersList = await headers();
    const cookie = headersList.get('cookie');
    const authHeader = headersList.get('authorization');
    const csrfHeaderName = (
        process.env.NEXT_PUBLIC_CSRF_HEADER_NAME?.trim() ||
        process.env.CSRF_HEADER_NAME?.trim() ||
        'x-xsrf-token'
    ).toLowerCase();
    const csrfToken =
        headersList.get(csrfHeaderName) ||
        headersList.get('x-xsrf-token') ||
        headersList.get('x-csrf-token');
    const contentType = request.headers.get('content-type') || '';
    const env = process.env as Record<string, string | undefined>;

    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/catalog/assets/admin`;

    console.log(`[Asset Upload Proxy] POST -> ${url}`);

    try {
        // Read the body as ArrayBuffer and forward it
        const bodyBuffer = await request.arrayBuffer();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'x-api-key': env['INTERNAL_API_KEY'] || '',
                ...(cookie && { 'Cookie': cookie }),
                ...(authHeader && { 'Authorization': authHeader }),
                ...(csrfToken && { [csrfHeaderName]: csrfToken }),
            },
            body: bodyBuffer,
        });

        const data = await response.json().catch(() => ({}));
        console.log(`[Asset Upload Proxy] Response: ${response.status}`, data);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`[Asset Upload Proxy] Error:`, error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    return proxyRequest(request);
}
