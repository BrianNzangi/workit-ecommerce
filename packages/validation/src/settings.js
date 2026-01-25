"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = exports.rolesSettingsSchema = exports.policySettingsSchema = exports.taxSettingsSchema = exports.shippingSettingsSchema = exports.paymentSettingsSchema = exports.generalSettingsSchema = exports.settingSchema = void 0;
const zod_1 = require("zod");
const optionalString = zod_1.z.string().trim().optional().or(zod_1.z.literal(''));
const optionalEmail = zod_1.z.string().trim().optional().or(zod_1.z.literal(''));
const optionalUrl = zod_1.z.string().trim().optional().or(zod_1.z.literal(''));
exports.settingSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'Key is required'),
    value: zod_1.z.string().min(1, 'Value is required'),
});
exports.generalSettingsSchema = zod_1.z.object({
    site_name: optionalString,
    site_email: optionalEmail,
    site_phone: optionalString,
    site_address: optionalString,
    default_language: zod_1.z.string().default('en'),
    timezone: zod_1.z.string().default('Africa/Nairobi'),
    default_currency: zod_1.z.string().default('KES'),
}).passthrough();
exports.paymentSettingsSchema = zod_1.z.object({
    payment_methods: zod_1.z.array(zod_1.z.string()).default(['paystack']),
    paystack_public_key: optionalString,
    paystack_secret_key: optionalString,
    paystack_enabled: zod_1.z.boolean().default(false),
}).passthrough();
exports.shippingSettingsSchema = zod_1.z.object({
    default_shipping_method: zod_1.z.string().default('standard'),
    free_shipping_threshold: zod_1.z.coerce.number().default(0),
    handling_fee: zod_1.z.coerce.number().default(0),
    methods: zod_1.z.array(zod_1.z.any()).optional().default([]),
}).passthrough();
exports.taxSettingsSchema = zod_1.z.object({
    tax_enabled: zod_1.z.boolean().default(false),
    default_tax_rate: zod_1.z.coerce.number().default(0),
    tax_name: zod_1.z.string().default('VAT'),
    included_in_prices: zod_1.z.boolean().default(false),
}).passthrough();
exports.policySettingsSchema = zod_1.z.object({
    privacy_policy: optionalString,
    privacy_policy_enabled: zod_1.z.boolean().default(true),
    terms_of_service: optionalString,
    return_policy: optionalString,
    shipping_policy: optionalString,
    contact_required: zod_1.z.boolean().default(true),
}).passthrough();
exports.rolesSettingsSchema = zod_1.z.object({
    admin_email: optionalEmail,
    user_roles: zod_1.z.array(zod_1.z.string()).default(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),
    permissions: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).default({}),
}).passthrough();
exports.updateSettingsSchema = zod_1.z.object({
    general: exports.generalSettingsSchema.partial().optional(),
    payments: exports.paymentSettingsSchema.partial().optional(),
    shipping: exports.shippingSettingsSchema.partial().optional(),
    taxes: exports.taxSettingsSchema.partial().optional(),
    policies: exports.policySettingsSchema.partial().optional(),
    roles: exports.rolesSettingsSchema.partial().optional(),
}).passthrough();
//# sourceMappingURL=settings.js.map