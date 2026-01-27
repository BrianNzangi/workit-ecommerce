import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id } = await params;
    const url = `${BACKEND_URL}/blog/${id}/toggle-publish`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.session.token}`,
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error toggling publish status:', error);
        return NextResponse.json({ error: 'Failed to toggle publish status' }, { status: 500 });
    }
}
