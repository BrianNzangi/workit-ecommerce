"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionSchema = exports.productSchema = void 0;
const zod_1 = require("zod");
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required"),
    slug: zod_1.z.string().min(1, "Slug is required"),
    sku: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    salePrice: zod_1.z.number().min(0).nullable().optional(),
    originalPrice: zod_1.z.number().min(0).nullable().optional(),
    enabled: zod_1.z.boolean().default(true),
    condition: zod_1.z.enum(["NEW", "USED", "REFURBISHED"]).default("NEW"),
    brandId: zod_1.z.string().optional(),
    shippingMethodId: zod_1.z.string().optional(),
    collections: zod_1.z.array(zod_1.z.string()).optional(),
    homepageCollections: zod_1.z.array(zod_1.z.string()).optional(),
    assetIds: zod_1.z.array(zod_1.z.string()).optional(),
    stockOnHand: zod_1.z.number().int().min(0).default(20),
});
exports.collectionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Collection name is required"),
    slug: zod_1.z.string().min(1, "Slug is required"),
    description: zod_1.z.string().optional(),
    parentId: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().default(true),
    showInMostShopped: zod_1.z.boolean().default(false),
    sortOrder: zod_1.z.number().int().default(0),
    assetId: zod_1.z.string().optional(),
});
//# sourceMappingURL=products.js.map