import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/analytics/dashboard/sales${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': cookie || '',
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /analytics/dashboard/sales:', error);
        return NextResponse.json({ error: 'Failed to fetch sales analytics' }, { status: 500 });
    }
}
