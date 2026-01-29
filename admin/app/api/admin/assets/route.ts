import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    await getSession();
    const { searchParams } = new URL(request.url);
    const take = searchParams.get('take') || '50';
    const skip = searchParams.get('skip') || '0';

    const url = `${BACKEND_URL}/assets?take=${take}&skip=${skip}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': cookie || '',
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    await getSession();

    try {
        const formData = await request.formData();

        const backendResponse = await fetch(`${BACKEND_URL}/assets/upload`, {
            method: 'POST',
            headers: {
                'Cookie': cookie || '',
                // Don't set Content-Type, fetch will set it with boundary
            },
            body: formData,
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || 'Failed to upload asset to backend' },
                { status: backendResponse.status }
            );
        }

        const data = await backendResponse.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error proxying asset upload:', error);
        return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 });
    }
}
