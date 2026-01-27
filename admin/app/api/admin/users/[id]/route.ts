import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function PATCH(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const { id } = await params;
    const session = await getSession();
    const body = await request.json();
    const url = `${BACKEND_URL}/users/${id}`;

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
        console.error('Error proxying PATCH /users/:id:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const { id } = await params;
    const session = await getSession();
    const url = `${BACKEND_URL}/users/${id}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Cookie': cookie || '',
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying DELETE /users/:id:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
