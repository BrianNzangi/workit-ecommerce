import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    const { id } = await params;
    const url = `${BACKEND_URL}/collections/${id}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': cookie || '',
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying GET /collections/${id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    const { id } = await params;
    const body = await request.json();
    const url = `${BACKEND_URL}/collections/${id}`;

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie || '',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying PATCH /collections/${id}:`, error);
        return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    const { id } = await params;
    const url = `${BACKEND_URL}/collections/${id}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Cookie': cookie || '',
            },
        });

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying DELETE /collections/${id}:`, error);
        return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
    }
}
