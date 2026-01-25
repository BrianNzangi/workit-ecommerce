import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import type { SettingInput, GeneralSettingsInput, PaymentSettingsInput, ShippingSettingsInput, TaxSettingsInput, PolicySettingsInput, RolesSettingsInput } from '@workit/validation';
export declare class SettingsService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    getSetting(key: string): Promise<{
        id: string;
        key: string;
        value: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllSettings(): Promise<{
        id: string;
        key: string;
        value: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getSettingsObject(): Promise<Record<string, string>>;
    getStructuredSettings(): Promise<{
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
    upsertSetting(input: SettingInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }>;
    upsertStructuredSettings(settings: Record<string, any>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
    deleteSetting(key: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }>;
    updateGeneralSettings(input: Partial<GeneralSettingsInput>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
    updatePaymentSettings(input: Partial<PaymentSettingsInput>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
    updateShippingSettings(input: Partial<ShippingSettingsInput>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
    updateTaxSettings(input: Partial<TaxSettingsInput>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
    updatePolicySettings(input: Partial<PolicySettingsInput>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
    updateRolesSettings(input: Partial<RolesSettingsInput>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
}
