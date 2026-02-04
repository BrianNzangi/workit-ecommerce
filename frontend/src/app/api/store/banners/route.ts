import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    try {
        const response = await proxyFetch(`/store/banners?${searchParams.toString()}`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }

        const data = await response.json();

        // backend-v2 returns { banners: [...] }, but frontend expects [...]
        const banners = data.banners || data;

        return NextResponse.json(banners, { status: 200 });
    } catch (error) {
        console.error('❌ Failed to fetch banners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}
