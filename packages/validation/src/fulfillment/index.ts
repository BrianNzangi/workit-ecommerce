import { z } from "zod";

// --- Address Schemas ---
export const addressSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    streetLine1: z.string().min(1, "Address line 1 is required"),
    streetLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default("KE"),
    phoneNumber: z.string().min(1, "Phone number is required"),
});

// --- Checkout Schemas ---
export const checkoutItemSchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    salePrice: z.number().optional(),
    originalPrice: z.number().optional(),
});

export const checkoutSchema = z.object({
    items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
    customerEmail: z.string().email("Invalid email"),
    customerName: z.string().min(1, "Customer name is required"),
    customerId: z.string().uuid().optional(),
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    shippingMethodId: z.string().min(1, "Please select a shipping method"),
    shippingCost: z.number().min(0).optional(),
});

// --- Order Schemas ---
export const orderStatusSchema = z.object({
    state: z.enum([
        "Created",
        "PaymentPending",
        "PaymentReceived",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Refunded"
    ]),
});

// --- Shipping Schemas ---
export const shippingMethodSchema = z.object({
    name: z.string().min(1, "Method name is required"),
    code: z.string().min(1, "Method code is required"),
    description: z.string().optional(),
    enabled: z.boolean().default(true),
    isExpress: z.boolean().default(false),
});

export const shippingZoneSchema = z.object({
    shippingMethodId: z.string().uuid(),
    county: z.string().min(1, "County name is required"),
    cities: z.array(z.object({
        cityTown: z.string().min(1),
        standardPrice: z.number().min(0),
        expressPrice: z.number().min(0),
    })).optional(),
});
