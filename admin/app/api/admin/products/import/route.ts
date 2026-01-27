import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
    const headersList = await headers();
    const cookie = headersList.get('cookie');

    const session = await getSession();

    // Get the FormData from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    try {
        // Read the CSV file content
        const text = await file.text();

        // Parse CSV to JSON
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
        }

        // Get headers from first line
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        // Parse data rows
        const csvData = lines.slice(1).map(line => {
            // Simple CSV parsing (handles quoted fields)
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim()); // Push last value

            // Create object from headers and values
            const row: any = {};
            headers.forEach((header, index) => {
                row[header] = values[index]?.replace(/^"|"$/g, '') || '';
            });
            return row;
        });

        const url = `${BACKEND_URL}/products/import`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie || '',
            },
            body: JSON.stringify({ csvData }),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying POST /products/import:', error);
        return NextResponse.json({ error: 'Failed to import products' }, { status: 500 });
    }
}
