import { SettingsService } from './settings.service';
import type { UpdateSettingsInput } from '@workit/validation';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        general: {
            site_name: any;
            site_email: any;
            site_phone: any;
            site_address: any;
            default_language: any;
            timezone: any;
            default_currency: any;
        };
        payments: {
            payment_methods: any;
            paystack_public_key: any;
            paystack_secret_key: any;
            paystack_enabled: boolean;
        };
        roles: {
            admin_email: any;
            user_roles: string[];
            permissions: any;
        };
        shipping: {
            methods: {
                id: string;
                code: string;
                name: string;
                description: string | null;
                isExpress: boolean;
            }[];
            default_shipping_method: any;
            free_shipping_threshold: number;
            handling_fee: number;
        };
        taxes: {
            tax_enabled: boolean;
            default_tax_rate: number;
            tax_name: any;
            included_in_prices: boolean;
        };
        policies: {
            privacy_policy: any;
            privacy_policy_enabled: true;
            terms_of_service: any;
            return_policy: any;
            shipping_policy: any;
            contact_required: true;
        };
    }>;
    getPublicSettings(): Promise<Record<string, any>>;
    updateSettings(input: UpdateSettingsInput): Promise<{
        success: boolean;
    }>;
}
