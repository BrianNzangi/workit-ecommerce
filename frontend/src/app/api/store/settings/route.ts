/**
 * Store Settings API Route
 * 
 * Fetches store configuration including collections, banners, and categories
 * from the backend API at http://localhost:3001
 */

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/store/settings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('❌ Failed to fetch store settings:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch store settings',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
