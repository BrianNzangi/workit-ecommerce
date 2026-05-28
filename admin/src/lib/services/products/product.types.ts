export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    sku: string;
    salePrice: number;
    originalPrice: number;
    stockOnHand: number;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    assets?: any[];
    collections?: any[];
}

export interface CreateProductInput {
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    sku: string;
    salePrice: number;
    originalPrice: number;
    stockOnHand: number;
    enabled?: boolean;
    collections?: string[];
    homepageCollections?: string[];
    assetIds?: string[];
}

export interface ProductListOptions {
    limit?: number;
    offset?: number;
    page?: number;
    q?: string;
    brandId?: string;
    condition?: string;
    stockStatus?: string;
    minPrice?: number;
    maxPrice?: number;
    includeTotalAll?: boolean;
    collectionId?: string;
    enabled?: boolean;
}

export interface ProductListResponse {
    products: Product[];
    total: number;
    totalAll?: number;
    limit?: number;
    offset?: number;
    success?: boolean;
}
