import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '@workit/db';
import type { ProductInput } from '@workit/validation';
export declare class ProductService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    createProduct(input: ProductInput): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        enabled: boolean;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        shippingMethodId: string | null;
        deletedAt: Date | null;
    }>;
    updateProduct(id: string, input: Partial<ProductInput>): Promise<{
        id: string;
        name: string;
        slug: string;
        sku: string | null;
        description: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        enabled: boolean;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        shippingMethodId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    getProduct(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        enabled: boolean;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        shippingMethodId: string | null;
        deletedAt: Date | null;
        assets: {
            id: string;
            productId: string;
            assetId: string;
            sortOrder: number;
            featured: boolean;
            asset: {
                id: string;
                name: string;
                createdAt: Date;
                type: "IMAGE" | "VIDEO" | "DOCUMENT";
                mimeType: string;
                fileSize: number;
                source: string;
                preview: string;
                width: number | null;
                height: number | null;
            };
        }[];
        collections: {
            id: string;
            productId: string;
            sortOrder: number;
            collectionId: string;
            collection: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                slug: string;
                enabled: boolean;
                assetId: string | null;
                sortOrder: number;
                parentId: string | null;
                showInMostShopped: boolean;
            };
        }[];
        homepageCollections: {
            id: string;
            productId: string;
            sortOrder: number;
            collectionId: string;
            collection: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                enabled: boolean;
                title: string;
                sortOrder: number;
            };
        }[];
    }>;
    getProducts(options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        enabled: boolean;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        shippingMethodId: string | null;
        deletedAt: Date | null;
        assets: {
            id: string;
            productId: string;
            assetId: string;
            sortOrder: number;
            featured: boolean;
            asset: {
                id: string;
                name: string;
                createdAt: Date;
                type: "IMAGE" | "VIDEO" | "DOCUMENT";
                mimeType: string;
                fileSize: number;
                source: string;
                preview: string;
                width: number | null;
                height: number | null;
            };
        }[];
        collections: {
            id: string;
            productId: string;
            sortOrder: number;
            collectionId: string;
            collection: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                slug: string;
                enabled: boolean;
                assetId: string | null;
                sortOrder: number;
                parentId: string | null;
                showInMostShopped: boolean;
            };
        }[];
        homepageCollections: {
            id: string;
            productId: string;
            sortOrder: number;
            collectionId: string;
            collection: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                enabled: boolean;
                title: string;
                sortOrder: number;
            };
        }[];
    }[]>;
    searchProducts(query: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        enabled: boolean;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        shippingMethodId: string | null;
        deletedAt: Date | null;
        assets: {
            id: string;
            productId: string;
            assetId: string;
            sortOrder: number;
            featured: boolean;
            asset: {
                id: string;
                name: string;
                createdAt: Date;
                type: "IMAGE" | "VIDEO" | "DOCUMENT";
                mimeType: string;
                fileSize: number;
                source: string;
                preview: string;
                width: number | null;
                height: number | null;
            };
        }[];
        collections: {
            id: string;
            productId: string;
            sortOrder: number;
            collectionId: string;
            collection: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                slug: string;
                enabled: boolean;
                assetId: string | null;
                sortOrder: number;
                parentId: string | null;
                showInMostShopped: boolean;
            };
        }[];
        homepageCollections: {
            id: string;
            productId: string;
            sortOrder: number;
            collectionId: string;
            collection: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                enabled: boolean;
                title: string;
                sortOrder: number;
            };
        }[];
    }[]>;
    deleteProduct(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        enabled: boolean;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        shippingMethodId: string | null;
        deletedAt: Date | null;
    }>;
    importProducts(body: any): Promise<{
        success: boolean;
        imported: number;
        failed: number;
        errors: string[];
    }>;
    exportProducts(): Promise<string>;
    getImportTemplate(): Promise<string>;
}
