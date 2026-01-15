// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginCustomer } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const result = await loginCustomer(email, password);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 401 });
        }
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
    }
}
