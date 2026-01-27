import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ stat: string }> }
) {
    const { stat } = await params;
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Bridge from /api/admin/dashboard/[stat] to backend /analytics/dashboard/[stat]
    const url = `${BACKEND_URL}/analytics/dashboard/${stat}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': cookie || '',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Backend error: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error proxying GET /api/admin/dashboard/${stat}:`, error);
        return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
    }
}
