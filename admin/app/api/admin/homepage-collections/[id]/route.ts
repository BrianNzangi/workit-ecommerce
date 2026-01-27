import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id } = await params;
    const url = `${BACKEND_URL}/homepage-collections/${id}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${session?.session.token}`,
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying GET /homepage-collections/${id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch homepage collection' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id } = await params;
    const body = await request.json();
    const url = `${BACKEND_URL}/homepage-collections/${id}`;

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.session.token}`,
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying PATCH /homepage-collections/${id}:`, error);
        return NextResponse.json({ error: 'Failed to update homepage collection' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id } = await params;
    const url = `${BACKEND_URL}/homepage-collections/${id}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session?.session.token}`,
            },
        });

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying DELETE /homepage-collections/${id}:`, error);
        return NextResponse.json({ error: 'Failed to delete homepage collection' }, { status: 500 });
    }
}
