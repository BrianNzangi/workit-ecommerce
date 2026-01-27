import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    const body = await request.json();
    const url = `${BACKEND_URL}/orders/checkout`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie || '',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying POST /orders/checkout:', error);
        return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
    }
}
