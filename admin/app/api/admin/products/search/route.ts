import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/products/search${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /products/search:', error);
        return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
    }
}
