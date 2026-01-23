/**
 * Collections API Route
 * 
 * Proxies requests to the backend Collections API
 * GET /api/collections
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function GET(request: NextRequest) {
    try {
        // Get query parameters from the request
        const searchParams = request.nextUrl.searchParams;
        const parentId = searchParams.get('parentId');
        const includeChildren = searchParams.get('includeChildren');
        const take = searchParams.get('take');
        const skip = searchParams.get('skip');

        // Build backend URL with query parameters
        const backendParams = new URLSearchParams();
        if (parentId) backendParams.set('parentId', parentId);
        if (includeChildren) backendParams.set('includeChildren', includeChildren);
        if (take) backendParams.set('take', take);
        if (skip) backendParams.set('skip', skip);

        // Always include assets for images
        backendParams.set('includeAssets', 'true');

        const backendUrl = `${BACKEND_URL}/store/collections?${backendParams.toString()}`;

        console.log('🔍 Fetching collections from:', backendUrl);

        // Forward the request to the backend
        const response = await fetch(backendUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('📡 Backend response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Backend error response:', errorText);
            throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Collections fetched successfully:', data.length || 0, 'items');

        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('❌ Collections API error:', error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json(
            {
                error: 'Failed to fetch collections',
                message: error instanceof Error ? error.message : 'Unknown error',
                backendUrl: `${BACKEND_URL}/api/store/collections`
            },
            { status: 500 }
        );
    }
}
