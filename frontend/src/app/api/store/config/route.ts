import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET() {
    try {
        // Fetch settings from admin API
        const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch settings: ${response.status}`);
        }

        const settings = await response.json();

        // Return only public-safe settings
        return NextResponse.json({
            paystackPublicKey: settings['payments.paystack_public_key'] || '',
            paystackEnabled: settings['payments.paystack_enabled'] === 'true',
            currency: settings['payments.default_currency'] || 'KES',
            siteName: settings['general.site_name'] || 'Workit Store',
        });
    } catch (error) {
        console.error('Error fetching store config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch store configuration' },
            { status: 500 }
        );
    }
}
