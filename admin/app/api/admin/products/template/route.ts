import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();
    const url = `${BACKEND_URL}/products/template`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': cookie || '',
            },
        });

        // Get the CSV template text from backend
        const csvText = await response.text();

        // Return as downloadable CSV template
        return new NextResponse(csvText, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="product-import-template.csv"',
            },
        });
    } catch (error) {
        console.error('Error proxying GET /products/template:', error);
        return NextResponse.json({ error: 'Failed to download template' }, { status: 500 });
    }
}
