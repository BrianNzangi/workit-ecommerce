import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Proxies a request to the backend service.
 * If customEndpoint is provided, it uses that instead of mapping the request URL.
 */
export async function proxyRequest(request: NextRequest, customEndpoint?: string) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');
    const authHeader = headersList.get('authorization');

    let url: string;
    if (customEndpoint) {
        url = `${BACKEND_URL}${customEndpoint}`;
    } else {
        const { pathname, search } = new URL(request.url);
        // Map /api/admin/products -> /products
        const backendPath = pathname.replace(/^\/api\/admin/, '');
        url = `${BACKEND_URL}${backendPath}${search}`;
    }

    const fetchOptions: RequestInit = {
        method: request.method,
        headers: {
            'Content-Type': 'application/json',
            ...(cookie && { 'Cookie': cookie }),
            ...(authHeader && { 'Authorization': authHeader }),
        },
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
            // Try to clone and get JSON
            const body = await request.clone().json();
            fetchOptions.body = JSON.stringify(body);
        } catch (e) {
            // If JSON fails, try FormData (for file uploads)
            try {
                const formData = await request.clone().formData();
                fetchOptions.body = formData;
                // Delete Content-Type to let fetch set it with boundary for FormData
                if (fetchOptions.headers) {
                    delete (fetchOptions.headers as any)['Content-Type'];
                }
            } catch (formDataError) {
                // No body or unparseable body, leave fetchOptions.body undefined
            }
        }
    }

    try {
        const response = await fetch(url, fetchOptions);

        // Handle non-JSON responses (like CSV exports)
        const contentType = response.headers.get('content-type');
        if (contentType && (contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
            const blob = await response.blob();
            return new NextResponse(blob, {
                status: response.status,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': response.headers.get('content-disposition') || '',
                },
            });
        }

        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying ${request.method} ${url}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
