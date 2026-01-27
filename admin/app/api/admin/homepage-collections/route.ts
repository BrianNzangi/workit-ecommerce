import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const session = await getSession();
    const url = `${BACKEND_URL}/homepage-collections`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${session?.session.token}`,
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /homepage-collections:', error);
        return NextResponse.json({ error: 'Failed to fetch homepage collections' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    const body = await request.json();
    const url = `${BACKEND_URL}/homepage-collections`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.session.token}`,
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying POST /homepage-collections:', error);
        return NextResponse.json({ error: 'Failed to create homepage collection' }, { status: 500 });
    }
}
