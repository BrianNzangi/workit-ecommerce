import { NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';

export async function GET() {
    try {
        const response = await proxyFetch('/store/homepage-collections', {
            method: 'GET',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('❌ Failed to fetch homepage collections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch homepage collections' },
            { status: 500 }
        );
    }
}
