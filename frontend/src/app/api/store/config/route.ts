import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function GET() {
    try {
        // Fetch public settings from backend
        const response = await fetch(`${BACKEND_URL}/settings/public`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.warn(`Backend API returned ${response.status}. Falling back to env vars.`);
            return NextResponse.json({
                paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
                paystackEnabled: process.env.NEXT_PUBLIC_PAYSTACK_ENABLED === 'true',
                currency: process.env.NEXT_PUBLIC_CURRENCY || 'KES',
                siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Workit Store',
            });
        }

        const settings = await response.json();

        // Map backend settings to frontend config format
        return NextResponse.json({
            paystackPublicKey: settings['payments.paystack_public_key'] || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            paystackEnabled: settings['payments.paystack_enabled'] === 'true' || process.env.NEXT_PUBLIC_PAYSTACK_ENABLED === 'true',
            currency: settings['general.default_currency'] || process.env.NEXT_PUBLIC_CURRENCY || 'KES',
            siteName: settings['general.site_name'] || process.env.NEXT_PUBLIC_SITE_NAME || 'Workit Store',
        });

    } catch (error) {
        console.error('Error fetching store config:', error);

        // Fallback to environment variables
        return NextResponse.json({
            paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            paystackEnabled: process.env.NEXT_PUBLIC_PAYSTACK_ENABLED === 'true',
            currency: process.env.NEXT_PUBLIC_CURRENCY || 'KES',
            siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Workit Store',
        });
    }
}
