import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '@workit/db';
import type { ProductInput } from '@workit/validation';
export declare class ProductService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    createProduct(input: ProductInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        deletedAt: Date | null;
        description: string | null;
        enabled: boolean;
        shippingMethodId: string | null;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        deletedAt: Date | null;
        description: string | null;
        enabled: boolean;
        shippingMethodId: string | null;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        assets: {
            id: string;
            productId: string;
            assetId: string;
            sortOrder: number;
            featured: boolean;
            asset: {
                name: string;
                id: string;
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
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                assetId: string | null;
                sortOrder: number;
                description: string | null;
                enabled: boolean;
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
                title: string;
                slug: string;
                sortOrder: number;
                enabled: boolean;
            };
        }[];
    }>;
    getProducts(options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        deletedAt: Date | null;
        description: string | null;
        enabled: boolean;
        shippingMethodId: string | null;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        assets: {
            id: string;
            productId: string;
            assetId: string;
            sortOrder: number;
            featured: boolean;
            asset: {
                name: string;
                id: string;
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
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                assetId: string | null;
                sortOrder: number;
                description: string | null;
                enabled: boolean;
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
                title: string;
                slug: string;
                sortOrder: number;
                enabled: boolean;
            };
        }[];
    }[]>;
    searchProducts(query: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        deletedAt: Date | null;
        description: string | null;
        enabled: boolean;
        shippingMethodId: string | null;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
        assets: {
            id: string;
            productId: string;
            assetId: string;
            sortOrder: number;
            featured: boolean;
            asset: {
                name: string;
                id: string;
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
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                assetId: string | null;
                sortOrder: number;
                description: string | null;
                enabled: boolean;
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
                title: string;
                slug: string;
                sortOrder: number;
                enabled: boolean;
            };
        }[];
    }[]>;
    deleteProduct(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        deletedAt: Date | null;
        description: string | null;
        enabled: boolean;
        shippingMethodId: string | null;
        sku: string | null;
        salePrice: number | null;
        originalPrice: number | null;
        stockOnHand: number;
        condition: "NEW" | "REFURBISHED";
        brandId: string | null;
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
