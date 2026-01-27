import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    
    const body = await request.json();
    const url = `${BACKEND_URL}/orders/${id}/status`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie || '',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying PUT /orders/${id}/status:`, error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}

