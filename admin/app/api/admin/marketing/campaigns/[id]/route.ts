import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    try {
        
        const session = await getSession();

        const response = await fetch(`${BACKEND_URL}/campaigns/${id}`, {
            headers: {
                'Cookie': cookie || '',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaign' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    try {
        
        const session = await getSession();

        if (!session?.session.token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/campaigns/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie || '',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to update campaign' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    try {
        
        const session = await getSession();

        if (!session?.session.token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${BACKEND_URL}/campaigns/${id}`, {
            method: 'DELETE',
            headers: {
                'Cookie': cookie || '',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error deleting campaign:', error);
        return NextResponse.json(
            { error: 'Failed to delete campaign' },
            { status: 500 }
        );
    }
}

