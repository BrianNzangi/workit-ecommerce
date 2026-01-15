import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Return configuration from environment variables
        // These are public-safe values only
        return NextResponse.json({
            paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            paystackEnabled: process.env.NEXT_PUBLIC_PAYSTACK_ENABLED === 'true',
            currency: process.env.NEXT_PUBLIC_CURRENCY || 'KES',
            siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Workit Store',
        });
    } catch (error) {
        console.error('Error fetching store config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch store configuration' },
            { status: 500 }
        );
    }
}
