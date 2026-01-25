"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchema = exports.orderLineSchema = exports.addressSchema = void 0;
const zod_1 = require("zod");
exports.addressSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required"),
    streetLine1: zod_1.z.string().min(1, "Street address is required"),
    streetLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, "City is required"),
    province: zod_1.z.string().min(1, "Province is required"),
    postalCode: zod_1.z.string().min(1, "Postal code is required"),
    country: zod_1.z.string().min(1, "Country is required").default("KE"),
    phoneNumber: zod_1.z.string().min(1, "Phone number is required"),
    defaultShipping: zod_1.z.boolean().default(false),
    defaultBilling: zod_1.z.boolean().default(false),
});
exports.orderLineSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, "Product ID is required"),
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
});
exports.checkoutSchema = zod_1.z.object({
    shippingAddress: exports.addressSchema,
    billingAddress: exports.addressSchema.optional(),
    shippingMethodId: zod_1.z.string().min(1, "Shipping method is required"),
    items: zod_1.z.array(exports.orderLineSchema).min(1, "Cart cannot be empty"),
    paymentMethod: zod_1.z.string().default("paystack"),
});
//# sourceMappingURL=orders.js.map