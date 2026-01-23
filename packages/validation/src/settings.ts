import { z } from 'zod';

// More relaxed validation to avoid strictly failing on common patterns
const optionalString = z.string().trim().optional().or(z.literal(''));
const optionalEmail = z.string().trim().optional().or(z.literal(''));
const optionalUrl = z.string().trim().optional().or(z.literal(''));

// Setting schema for key-value pairs
export const settingSchema = z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.string().min(1, 'Value is required'),
});

// General/Store settings schema
export const generalSettingsSchema = z.object({
    site_name: optionalString,
    site_email: optionalEmail,
    site_phone: optionalString,
    site_address: optionalString,
    default_language: z.string().default('en'),
    timezone: z.string().default('Africa/Nairobi'),
    default_currency: z.string().default('KES'),
}).passthrough();

// Payment settings schema
export const paymentSettingsSchema = z.object({
    payment_methods: z.array(z.string()).default(['paystack']),
    paystack_public_key: optionalString,
    paystack_secret_key: optionalString,
    paystack_enabled: z.boolean().default(false),
}).passthrough();

// Shipping settings schema
export const shippingSettingsSchema = z.object({
    default_shipping_method: z.string().default('standard'),
    free_shipping_threshold: z.coerce.number().default(0),
    handling_fee: z.coerce.number().default(0),
    methods: z.array(z.any()).optional().default([]),
}).passthrough();

// Tax settings schema
export const taxSettingsSchema = z.object({
    tax_enabled: z.boolean().default(false),
    default_tax_rate: z.coerce.number().default(0),
    tax_name: z.string().default('VAT'),
    included_in_prices: z.boolean().default(false),
}).passthrough();

// Policy settings schema
export const policySettingsSchema = z.object({
    privacy_policy: optionalString,
    privacy_policy_enabled: z.boolean().default(true),
    terms_of_service: optionalString,
    return_policy: optionalString,
    shipping_policy: optionalString,
    contact_required: z.boolean().default(true),
}).passthrough();

// Roles settings schema
export const rolesSettingsSchema = z.object({
    admin_email: optionalEmail,
    user_roles: z.array(z.string()).default(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),
    permissions: z.record(z.string(), z.any()).default({}),
}).passthrough();

// Combined settings update schema
export const updateSettingsSchema = z.object({
    general: generalSettingsSchema.partial().optional(),
    payments: paymentSettingsSchema.partial().optional(),
    shipping: shippingSettingsSchema.partial().optional(),
    taxes: taxSettingsSchema.partial().optional(),
    policies: policySettingsSchema.partial().optional(),
    roles: rolesSettingsSchema.partial().optional(),
}).passthrough();

// Type exports
export type SettingInput = z.infer<typeof settingSchema>;
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type PaymentSettingsInput = z.infer<typeof paymentSettingsSchema>;
export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>;
export type TaxSettingsInput = z.infer<typeof taxSettingsSchema>;
export type PolicySettingsInput = z.infer<typeof policySettingsSchema>;
export type RolesSettingsInput = z.infer<typeof rolesSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
