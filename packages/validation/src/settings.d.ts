import { z } from 'zod';
export declare const settingSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
}, z.core.$strip>;
export declare const generalSettingsSchema: z.ZodObject<{
    site_name: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    site_email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    site_phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    site_address: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    default_language: z.ZodDefault<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    default_currency: z.ZodDefault<z.ZodString>;
}, z.core.$loose>;
export declare const paymentSettingsSchema: z.ZodObject<{
    payment_methods: z.ZodDefault<z.ZodArray<z.ZodString>>;
    paystack_public_key: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    paystack_secret_key: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    paystack_enabled: z.ZodDefault<z.ZodBoolean>;
}, z.core.$loose>;
export declare const shippingSettingsSchema: z.ZodObject<{
    default_shipping_method: z.ZodDefault<z.ZodString>;
    free_shipping_threshold: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    handling_fee: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    methods: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny>>>;
}, z.core.$loose>;
export declare const taxSettingsSchema: z.ZodObject<{
    tax_enabled: z.ZodDefault<z.ZodBoolean>;
    default_tax_rate: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    tax_name: z.ZodDefault<z.ZodString>;
    included_in_prices: z.ZodDefault<z.ZodBoolean>;
}, z.core.$loose>;
export declare const policySettingsSchema: z.ZodObject<{
    privacy_policy: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    privacy_policy_enabled: z.ZodDefault<z.ZodBoolean>;
    terms_of_service: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    return_policy: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    shipping_policy: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    contact_required: z.ZodDefault<z.ZodBoolean>;
}, z.core.$loose>;
export declare const rolesSettingsSchema: z.ZodObject<{
    admin_email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    user_roles: z.ZodDefault<z.ZodArray<z.ZodString>>;
    permissions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$loose>;
export declare const updateSettingsSchema: z.ZodObject<{
    general: z.ZodOptional<z.ZodObject<{
        site_name: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        site_email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        site_phone: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        site_address: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        default_language: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        default_currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, z.core.$loose>>;
    payments: z.ZodOptional<z.ZodObject<{
        payment_methods: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
        paystack_public_key: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        paystack_secret_key: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        paystack_enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$loose>>;
    shipping: z.ZodOptional<z.ZodObject<{
        default_shipping_method: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        free_shipping_threshold: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
        handling_fee: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
        methods: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny>>>>;
    }, z.core.$loose>>;
    taxes: z.ZodOptional<z.ZodObject<{
        tax_enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        default_tax_rate: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
        tax_name: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        included_in_prices: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$loose>>;
    policies: z.ZodOptional<z.ZodObject<{
        privacy_policy: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        privacy_policy_enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        terms_of_service: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        return_policy: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        shipping_policy: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        contact_required: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$loose>>;
    roles: z.ZodOptional<z.ZodObject<{
        admin_email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        user_roles: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
        permissions: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    }, z.core.$loose>>;
}, z.core.$loose>;
export type SettingInput = z.infer<typeof settingSchema>;
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type PaymentSettingsInput = z.infer<typeof paymentSettingsSchema>;
export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>;
export type TaxSettingsInput = z.infer<typeof taxSettingsSchema>;
export type PolicySettingsInput = z.infer<typeof policySettingsSchema>;
export type RolesSettingsInput = z.infer<typeof rolesSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
