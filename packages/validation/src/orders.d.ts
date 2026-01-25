import { z } from "zod";
export declare const addressSchema: z.ZodObject<{
    fullName: z.ZodString;
    streetLine1: z.ZodString;
    streetLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    province: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    phoneNumber: z.ZodString;
    defaultShipping: z.ZodDefault<z.ZodBoolean>;
    defaultBilling: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const orderLineSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const checkoutSchema: z.ZodObject<{
    shippingAddress: z.ZodObject<{
        fullName: z.ZodString;
        streetLine1: z.ZodString;
        streetLine2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        province: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        phoneNumber: z.ZodString;
        defaultShipping: z.ZodDefault<z.ZodBoolean>;
        defaultBilling: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        fullName: z.ZodString;
        streetLine1: z.ZodString;
        streetLine2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        province: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        phoneNumber: z.ZodString;
        defaultShipping: z.ZodDefault<z.ZodBoolean>;
        defaultBilling: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    shippingMethodId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    paymentMethod: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type AddressInput = z.infer<typeof addressSchema>;
export type OrderLineInput = z.infer<typeof orderLineSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
