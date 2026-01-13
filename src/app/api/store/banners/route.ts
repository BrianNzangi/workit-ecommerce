// src/app/api/store/banners/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const position = searchParams.get('position');

        // Build query parameters
        const params = new URLSearchParams();
        if (position) {
            params.append('position', position);
        }

        const url = `${API_BASE_URL}/api/store/banners${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to fetch banners:', response.statusText);
            return NextResponse.json(
                { error: 'Failed to fetch banners' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
