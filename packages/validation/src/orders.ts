import { z } from "zod";

export const addressSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    streetLine1: z.string().min(1, "Street address is required"),
    streetLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required").default("KE"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    defaultShipping: z.boolean().default(false),
    defaultBilling: z.boolean().default(false),
});

export const orderLineSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const checkoutSchema = z.object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    shippingMethodId: z.string().min(1, "Shipping method is required"),
    items: z.array(orderLineSchema).min(1, "Cart cannot be empty"),
    paymentMethod: z.string().default("paystack"),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type OrderLineInput = z.infer<typeof orderLineSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
