// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getActiveCustomer } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const customer = await getActiveCustomer();

        if (customer) {
            return NextResponse.json({ customer });
        } else {
            return NextResponse.json({ customer: null }, { status: 401 });
        }
    } catch (error) {
        console.error('Get customer API error:', error);
        return NextResponse.json({ error: 'Failed to get customer' }, { status: 500 });
    }
}
