import { products } from '@workit/api';

export type Product = products.Product;
export type CreateProductInput = products.CreateProductInput;

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
