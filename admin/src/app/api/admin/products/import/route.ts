import { headers as nextHeaders } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
    const headersList = await nextHeaders();
    const cookie = headersList.get('cookie');

    const csrfHeaderName = (
        process.env.NEXT_PUBLIC_CSRF_HEADER_NAME?.trim() ||
        process.env.CSRF_HEADER_NAME?.trim() ||
        'x-xsrf-token'
    ).toLowerCase();
    const csrfToken =
        request.headers.get(csrfHeaderName) ||
        headersList.get(csrfHeaderName) ||
        headersList.get('x-xsrf-token') ||
        headersList.get('x-csrf-token');

    try {
        const body = await request.json();
        const { products } = body;

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'No products provided' }, { status: 400 });
        }

        const backendUrl = getBackendUrl();
        const url = `${backendUrl}/catalog/products/_admin/import`;

        const forwardHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (cookie) forwardHeaders['Cookie'] = cookie;
        if (csrfToken) forwardHeaders[csrfHeaderName] = csrfToken;

        // Send both csvData (old) and products (new) for backward compatibility
        const response = await fetch(url, {
            method: 'POST',
            headers: forwardHeaders,
            body: JSON.stringify({ products, csvData: products }),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying POST /products/import:', error);
        return NextResponse.json({ error: 'Failed to import products' }, { status: 500 });
    }
}
