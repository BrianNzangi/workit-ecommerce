// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password, firstName, lastName, phoneNumber } = await request.json();

        const result = await registerCustomer({
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
        });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
    } catch (error) {
        console.error('Registration API error:', error);
        return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
    }
}
