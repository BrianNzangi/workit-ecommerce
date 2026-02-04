import { z } from "zod";

// --- Product Schemas ---
export const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase and contain only letters, numbers, and hyphens"),
    description: z.string().optional(),
    sku: z.string().min(1, "SKU is required"),
    salePrice: z.number().min(0, "Price cannot be negative"),
    originalPrice: z.number().min(0, "Price cannot be negative"),
    stockOnHand: z.number().int().min(0, "Stock cannot be negative"),
    enabled: z.boolean().default(true),
    collections: z.array(z.string()).optional(),
    assetIds: z.array(z.string()).optional(),
    brandId: z.string().uuid().nullable().optional(),
});

export const updateProductSchema = productSchema.partial();

// --- Collection Schemas ---
export const collectionSchema = z.object({
    name: z.string().min(1, "Collection name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/),
    description: z.string().nullable().optional(),
    enabled: z.boolean().default(true),
    featured: z.boolean().default(false),
    parentId: z.string().uuid().nullable().optional(),
    assetId: z.string().uuid().nullable().optional(),
});

export const updateCollectionSchema = collectionSchema.partial();

// --- Brand Schemas ---
export const brandSchema = z.object({
    name: z.string().min(1, "Brand name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/),
    enabled: z.boolean().default(true),
});

export const updateBrandSchema = brandSchema.partial();

// --- Asset Schemas ---
export const assetSchema = z.object({
    name: z.string().min(1),
    source: z.string().url(),
    type: z.string(),
    size: z.number().positive(),
});
