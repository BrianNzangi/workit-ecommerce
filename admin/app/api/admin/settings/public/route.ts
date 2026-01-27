import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const url = `${BACKEND_URL}/settings/public`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /settings/public:', error);
        return NextResponse.json({ error: 'Failed to fetch public settings' }, { status: 500 });
    }
}
