import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';

/**
 * Collections API Route
 * 
 * Proxies requests to the backend store collections API.
 * Uses proxyFetch for secure API key injection and Redis caching.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    console.log(`[Collections API] Received params: ${searchParams.toString()}`);

    try {
        // Build the proxy path with correctly formatted query parameters
        const proxyParams = new URLSearchParams(searchParams);

        // Ensure assets are included if not specified
        if (!proxyParams.has('includeAssets')) {
            proxyParams.set('includeAssets', 'true');
        }

        const response = await proxyFetch(`/store/collections?${proxyParams.toString()}`, {
            method: 'GET',
            // Default revalidation of 5 minutes
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Backend API error: ${response.status} ${response.statusText}`, errorText);
            return NextResponse.json(
                { error: 'Backend API error', status: response.status },
                { status: response.status }
            );
        }

        const data = await response.json();

        // backend returns { collections: [...] }, but frontend expects [...]
        const collections = Array.isArray(data) ? data : (data.collections || []);

        return NextResponse.json(collections, { status: 200 });
    } catch (error) {
        console.error('❌ Collections API proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collections' },
            { status: 500 }
        );
    }
}
