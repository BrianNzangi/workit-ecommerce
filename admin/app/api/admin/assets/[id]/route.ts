import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    
    const url = `${BACKEND_URL}/assets/${id}`;

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
        console.error(`Error proxying DELETE /assets/${id}:`, error);
        return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }
}

