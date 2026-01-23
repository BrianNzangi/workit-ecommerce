import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Slug is required"),
    sku: z.string().optional(),
    description: z.string().optional(),
    salePrice: z.number().min(0).nullable().optional(),
    originalPrice: z.number().min(0).nullable().optional(),
    enabled: z.boolean().default(true),
    condition: z.enum(["NEW", "USED", "REFURBISHED"]).default("NEW"),
    brandId: z.string().optional(),
    shippingMethodId: z.string().optional(),
    collections: z.array(z.string()).optional(),
    homepageCollections: z.array(z.string()).optional(),
    assetIds: z.array(z.string()).optional(),
    stockOnHand: z.number().int().min(0).default(20),
});

export const collectionSchema = z.object({
    name: z.string().min(1, "Collection name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    parentId: z.string().optional(),
    enabled: z.boolean().default(true),
    showInMostShopped: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
    assetId: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
