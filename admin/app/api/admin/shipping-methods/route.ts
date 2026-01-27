import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    const url = `${BACKEND_URL}/shipping-methods`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': cookie || '',
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /shipping-methods:', error);
        return NextResponse.json({ error: 'Failed to fetch shipping methods' }, { status: 500 });
    }
}
