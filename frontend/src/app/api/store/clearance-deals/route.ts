import { NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';

export async function GET() {
    try {
        const response = await proxyFetch('/store/clearance-deals', {
            method: 'GET',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data.deals || [], { status: 200 });
    } catch (error) {
        console.error('Failed to fetch clearance deals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch clearance deals' },
            { status: 500 }
        );
    }
}
