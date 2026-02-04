import { NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';

export async function GET() {
    try {
        const response = await proxyFetch('/store/shipping');

        if (!response.ok) {
            console.error(`Backend API returned ${response.status}`);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch shipping zones from backend' },
                { status: response.status }
            );
        }

        const data = await response.json();
        // The backend /store/shipping returns { methods: [...] }
        // We'll return the methods array as the data
        return NextResponse.json({ success: true, data: data.methods });
    } catch (error) {
        console.error('Error fetching shipping zones:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
