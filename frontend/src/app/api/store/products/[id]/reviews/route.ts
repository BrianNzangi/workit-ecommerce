import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const response = await proxyFetch(`/store/products/${id}/reviews`, {
            method: 'GET',
            cache: 'no-store',
        });
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: response.status });
        }
        const json = await response.json();
        return NextResponse.json(json, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const response = await proxyFetch(`/store/products/${id}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const json = await response.json();
        return NextResponse.json(json, { status: response.status });
    } catch (error) {
        console.error('Failed to submit review:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
