import { z } from "zod";
export declare const productSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    salePrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    originalPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    condition: z.ZodDefault<z.ZodEnum<{
        NEW: "NEW";
        REFURBISHED: "REFURBISHED";
        USED: "USED";
    }>>;
    brandId: z.ZodOptional<z.ZodString>;
    shippingMethodId: z.ZodOptional<z.ZodString>;
    collections: z.ZodOptional<z.ZodArray<z.ZodString>>;
    homepageCollections: z.ZodOptional<z.ZodArray<z.ZodString>>;
    assetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    stockOnHand: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const collectionSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    showInMostShopped: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    assetId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ProductInput = z.infer<typeof productSchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
