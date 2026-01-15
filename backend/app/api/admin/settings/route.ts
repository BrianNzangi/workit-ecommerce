import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/settings - Get all settings
export async function GET(request: NextRequest) {
    try {
        // Fetch settings from database
        const settings = await (prisma as any).setting.findMany();

        // Transform settings array into structured object
        const settingsObj = settings.reduce((acc: Record<string, any>, setting: any) => {
            const keys = setting.key.split('.');
            let current = acc;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = setting.value;
            return acc;
        }, {} as any);

        // Fetch shipping methods from database
        const shippingMethods = await prisma.shippingMethod.findMany({
            where: { enabled: true },
            select: { id: true, code: true, name: true, description: true, isExpress: true },
        });

        // Fetch shipping zones with cities from database
        const shippingZones = await prisma.shippingZone.findMany({
            include: {
                cities: true,
                shippingMethod: {
                    select: { id: true, code: true, name: true },
                },
            },
        });

        // Transform prices from cents to decimal format
        const transformedZones = shippingZones.map(zone => ({
            ...zone,
            cities: zone.cities.map(city => ({
                ...city,
                price: city.price / 100, // Convert cents to KES
            })),
        }));

        // Get user roles from AdminRole enum
        const userRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

        // Return default structure if no settings exist
        const defaultSettings = {
            general: {
                site_name: settingsObj.general?.site_name || '',
                site_email: settingsObj.general?.site_email || '',
                site_phone: settingsObj.general?.site_phone || '',
                site_address: settingsObj.general?.site_address || '',
                site_logo_url: settingsObj.general?.site_logo_url || '',
                default_language: settingsObj.general?.default_language || 'en',
                timezone: settingsObj.general?.timezone || 'UTC',
            },
            payments: {
                default_currency: settingsObj.payments?.default_currency || 'KES',
                payment_methods: settingsObj.payments?.payment_methods
                    ? JSON.parse(settingsObj.payments.payment_methods)
                    : ['paystack'],
                paystack_public_key: settingsObj.payments?.paystack_public_key || '',
                paystack_secret_key: settingsObj.payments?.paystack_secret_key || '',
                paystack_enabled: settingsObj.payments?.paystack_enabled === 'true' || false,
            },
            roles: {
                admin_email: settingsObj.roles?.admin_email || '',
                user_roles: userRoles,
                permissions: settingsObj.roles?.permissions
                    ? JSON.parse(settingsObj.roles.permissions)
                    : {},
            },
            shipping: {
                methods: shippingMethods,
                default_shipping_method: settingsObj.shipping?.default_shipping_method || 'standard',
                shipping_zones: transformedZones,
                free_shipping_threshold: parseFloat(settingsObj.shipping?.free_shipping_threshold || '0'),
                handling_fee: parseFloat(settingsObj.shipping?.handling_fee || '0'),
            },
            taxes: {
                tax_enabled: settingsObj.taxes?.tax_enabled === 'true' || false,
                default_tax_rate: parseFloat(settingsObj.taxes?.default_tax_rate || '0'),
                tax_name: settingsObj.taxes?.tax_name || 'VAT',
                included_in_prices: settingsObj.taxes?.included_in_prices === 'true' || false,
                duty_enabled: settingsObj.taxes?.duty_enabled === 'true' || false,
                duty_rates: settingsObj.taxes?.duty_rates
                    ? JSON.parse(settingsObj.taxes.duty_rates)
                    : [],
            },
            policies: {
                privacy_policy: settingsObj.policies?.privacy_policy || '',
                privacy_policy_enabled: settingsObj.policies?.privacy_policy_enabled === 'true' || true,
                terms_of_service: settingsObj.policies?.terms_of_service || '',
                return_policy: settingsObj.policies?.return_policy || '',
                shipping_policy: settingsObj.policies?.shipping_policy || '',
                contact_required: settingsObj.policies?.contact_required === 'true' || true,
            },
        };

        return NextResponse.json(defaultSettings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/settings - Save settings
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Flatten the settings object into key-value pairs
        const flattenSettings = (obj: any, prefix = ''): Array<{ key: string; value: string }> => {
            const result: Array<{ key: string; value: string }> = [];

            for (const [key, value] of Object.entries(obj)) {
                const newKey = prefix ? `${prefix}.${key}` : key;

                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    result.push(...flattenSettings(value, newKey));
                } else {
                    result.push({
                        key: newKey,
                        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                    });
                }
            }

            return result;
        };

        const settingsToSave = flattenSettings(body);

        // Save each setting
        for (const setting of settingsToSave) {
            await (prisma as any).setting.upsert({
                where: { key: setting.key },
                update: { value: setting.value },
                create: {
                    key: setting.key,
                    value: setting.value,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            {
                error: 'Failed to save settings',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
