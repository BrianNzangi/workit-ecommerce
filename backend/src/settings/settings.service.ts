import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import type {
    SettingInput,
    GeneralSettingsInput,
    PaymentSettingsInput,
    ShippingSettingsInput,
    TaxSettingsInput,
    PolicySettingsInput,
    RolesSettingsInput
} from '@workit/validation';
import { DRIZZLE } from '../database/database.module';

@Injectable()
export class SettingsService {
    constructor(
        @Inject(DRIZZLE)
        private db: PostgresJsDatabase<typeof schema>,
    ) { }


    // Get a single setting by key
    async getSetting(key: string) {
        const [setting] = await this.db
            .select()
            .from(schema.settings)
            .where(eq(schema.settings.key, key))
            .limit(1);

        if (!setting) {
            throw new NotFoundException(`Setting with key "${key}" not found`);
        }

        return setting;
    }

    // Get all settings
    async getAllSettings() {
        return this.db.select().from(schema.settings);
    }

    // Get settings as key-value object
    async getSettingsObject() {
        const settings = await this.getAllSettings();
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string>);
    }

    // Get settings as structured object (matching backend-old format)
    async getStructuredSettings() {
        const settings = await this.getAllSettings();

        // Transform settings array into nested object structure
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

        // Get shipping methods and zones
        const shippingMethods = await this.db
            .select({
                id: schema.shippingMethods.id,
                code: schema.shippingMethods.code,
                name: schema.shippingMethods.name,
                description: schema.shippingMethods.description,
                isExpress: schema.shippingMethods.isExpress,
            })
            .from(schema.shippingMethods)
            .where(eq(schema.shippingMethods.enabled, true));

        // Return structured settings matching backend-old format
        return {
            general: {
                site_name: settingsObj.general?.site_name || '',
                site_email: settingsObj.general?.site_email || '',
                site_phone: settingsObj.general?.site_phone || '',
                site_address: settingsObj.general?.site_address || '',
                default_language: settingsObj.general?.default_language || 'en',
                timezone: settingsObj.general?.timezone || 'Africa/Nairobi',
                default_currency: settingsObj.general?.default_currency || 'KES',
            },
            payments: {
                payment_methods: settingsObj.payments?.payment_methods
                    ? JSON.parse(settingsObj.payments.payment_methods)
                    : ['paystack'],
                paystack_public_key: settingsObj.payments?.paystack_public_key || '',
                paystack_secret_key: settingsObj.payments?.paystack_secret_key || '',
                paystack_enabled: settingsObj.payments?.paystack_enabled === 'true' || false,
            },
            roles: {
                admin_email: settingsObj.roles?.admin_email || '',
                user_roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
                permissions: settingsObj.roles?.permissions
                    ? JSON.parse(settingsObj.roles.permissions)
                    : {},
            },
            shipping: {
                methods: shippingMethods,
                default_shipping_method: settingsObj.shipping?.default_shipping_method || 'standard',
                free_shipping_threshold: parseFloat(settingsObj.shipping?.free_shipping_threshold || '0'),
                handling_fee: parseFloat(settingsObj.shipping?.handling_fee || '0'),
            },
            taxes: {
                tax_enabled: settingsObj.taxes?.tax_enabled === 'true' || false,
                default_tax_rate: parseFloat(settingsObj.taxes?.default_tax_rate || '0'),
                tax_name: settingsObj.taxes?.tax_name || 'VAT',
                included_in_prices: settingsObj.taxes?.included_in_prices === 'true' || false,
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
    }

    // Get public settings (safe for storefront)
    async getPublicSettings() {
        const settings = await this.getAllSettings();

        const settingsMap = settings.reduce((acc: Record<string, any>, setting: any) => {
            // Only expose safe settings to public
            const isSafe = (
                setting.key.startsWith('general.') ||
                setting.key.startsWith('policies.') ||
                setting.key.startsWith('shipping.') ||
                setting.key.startsWith('taxes.') ||
                setting.key === 'general.default_currency' ||
                setting.key === 'payments.paystack_public_key' ||
                setting.key === 'payments.paystack_enabled'
            );

            if (isSafe && !setting.key.toLowerCase().includes('secret')) {
                acc[setting.key] = setting.value;
            }

            return acc;
        }, {} as Record<string, any>);

        return settingsMap;
    }

    // Create or update a setting
    async upsertSetting(input: SettingInput) {
        const existing = await this.db
            .select()
            .from(schema.settings)
            .where(eq(schema.settings.key, input.key))
            .limit(1);

        if (existing.length > 0) {
            const [updated] = await this.db
                .update(schema.settings)
                .set({
                    value: input.value,
                    updatedAt: new Date(),
                })
                .where(eq(schema.settings.key, input.key))
                .returning();
            return updated;
        } else {
            const [created] = await this.db
                .insert(schema.settings)
                .values(input)
                .returning();
            return created;
        }
    }

    // Bulk upsert settings (flattening nested objects)
    async upsertStructuredSettings(settings: Record<string, any>) {
        const flattenSettings = (obj: any, prefix = ''): SettingInput[] => {
            const result: SettingInput[] = [];

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

        const settingsToSave = flattenSettings(settings);

        const results = await Promise.all(
            settingsToSave.map(setting => this.upsertSetting(setting))
        );

        return results;
    }

    // Delete a setting
    async deleteSetting(key: string) {
        const [deleted] = await this.db
            .delete(schema.settings)
            .where(eq(schema.settings.key, key))
            .returning();

        if (!deleted) {
            throw new NotFoundException(`Setting with key "${key}" not found`);
        }

        return deleted;
    }

    // Helper methods for specific setting sections
    async updateGeneralSettings(input: Partial<GeneralSettingsInput>) {
        return this.upsertStructuredSettings({ general: input });
    }

    async updatePaymentSettings(input: Partial<PaymentSettingsInput>) {
        return this.upsertStructuredSettings({ payments: input });
    }

    async updateShippingSettings(input: Partial<ShippingSettingsInput>) {
        return this.upsertStructuredSettings({ shipping: input });
    }

    async updateTaxSettings(input: Partial<TaxSettingsInput>) {
        return this.upsertStructuredSettings({ taxes: input });
    }

    async updatePolicySettings(input: Partial<PolicySettingsInput>) {
        return this.upsertStructuredSettings({ policies: input });
    }

    async updateRolesSettings(input: Partial<RolesSettingsInput>) {
        return this.upsertStructuredSettings({ roles: input });
    }
}
