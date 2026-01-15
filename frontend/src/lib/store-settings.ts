/**
 * Store Settings API Client
 * Fetches configuration from the admin backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface StoreSettings {
    // General settings
    'general.site_name': string;
    'general.site_email': string;

    // Payment settings
    'payments.default_currency': string;
    'payments.paystack_public_key': string;
    'payments.paystack_secret_key': string;
    'payments.paystack_enabled': string;

    // Tax settings
    'taxes.default_tax_rate': string;

    // Shipping settings
    'shipping.free_shipping_threshold': string;
}

export interface StoreConfig {
    siteName: string;
    siteEmail: string;
    currency: string;
    paystackPublicKey: string;
    paystackEnabled: boolean;
    taxRate: number;
    freeShippingThreshold: number;
}

/**
 * Fetch all store settings from the admin API
 */
export async function fetchStoreSettings(): Promise<StoreSettings> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Always fetch fresh settings
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch settings: ${response.status}`);
        }

        const settings = await response.json();
        return settings;
    } catch (error) {
        console.error('Error fetching store settings:', error);
        throw error;
    }
}

/**
 * Fetch and parse store configuration
 */
export async function fetchStoreConfig(): Promise<StoreConfig> {
    const settings = await fetchStoreSettings();

    return {
        siteName: settings['general.site_name'] || 'Workit Store',
        siteEmail: settings['general.site_email'] || '',
        currency: settings['payments.default_currency'] || 'KES',
        paystackPublicKey: settings['payments.paystack_public_key'] || '',
        paystackEnabled: settings['payments.paystack_enabled'] === 'true',
        taxRate: parseFloat(settings['taxes.default_tax_rate'] || '16'),
        freeShippingThreshold: parseFloat(settings['shipping.free_shipping_threshold'] || '0'),
    };
}

/**
 * Get Paystack public key from settings
 */
export async function getPaystackPublicKey(): Promise<string> {
    const settings = await fetchStoreSettings();
    return settings['payments.paystack_public_key'] || '';
}
