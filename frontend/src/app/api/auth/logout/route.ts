// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logoutCustomer } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await logoutCustomer();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout API error:', error);
        return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
    }
}
