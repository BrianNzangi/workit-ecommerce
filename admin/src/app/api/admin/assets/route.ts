import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Increase body size limit for file uploads (default is 1MB)
export const config = {
    api: {
        bodyParser: false,
    },
};

function getBackendUrl() {
    const env = process.env as Record<string, string | undefined>;
    return (
        env['BACKEND_API_URL'] ||
        env['NEXT_PUBLIC_BACKEND_URL'] ||
        env['NEXT_PUBLIC_API_URL'] ||
        'http://localhost:3001'
    ).replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
    const { search } = new URL(request.url);
    const { proxyRequest } = await import('@/lib/shared/network');
    return proxyRequest(request, `/catalog/assets/admin${search}`);
}

export async function POST(request: NextRequest) {
    // For file uploads, we need to stream the raw body to the backend
    // instead of re-parsing FormData (which can corrupt multipart boundaries)
    const headersList = await headers();
    const cookie = headersList.get('cookie');
    const authHeader = headersList.get('authorization');
    const contentType = request.headers.get('content-type') || '';
    const env = process.env as Record<string, string | undefined>;

    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/catalog/assets/admin`;

    console.log(`[Asset Upload Proxy] POST -> ${url}`);

    try {
        // Stream the raw request body directly to the backend
        // This preserves the multipart boundary and file data intact
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'x-api-key': env['INTERNAL_API_KEY'] || '',
                ...(cookie && { 'Cookie': cookie }),
                ...(authHeader && { 'Authorization': authHeader }),
            },
            body: request.body,
            // @ts-ignore - duplex is needed for streaming request bodies
            duplex: 'half',
        });

        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`[Asset Upload Proxy] Error:`, error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const { proxyRequest } = await import('@/lib/shared/network');
    return proxyRequest(request);
}
