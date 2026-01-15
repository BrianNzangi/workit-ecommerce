// Store API Types

export interface ProductImage {
    id: string;
    url: string;
    altText: string;
    position: number;
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stockOnHand: number;
    option: string | null;
    optionValue: string | null;
    enabled: boolean;
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description?: string | null;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compareAtPrice?: number;
    sku: string;
    trackInventory: boolean;
    stockQuantity: number;
    status: string;
    images: ProductImage[];
    collections: Collection[];
    brand?: Brand;
    variants: ProductVariant[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponse {
    success: boolean;
    data: {
        products: Product[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}

export interface ProductResponse {
    success: boolean;
    data: Product;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
}
