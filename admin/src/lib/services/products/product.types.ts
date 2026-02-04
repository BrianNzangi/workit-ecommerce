import { products } from '@workit/api';

export type Product = products.Product;
export type CreateProductInput = products.CreateProductInput;

export interface ProductListOptions {
    limit?: number;
    offset?: number;
    collectionId?: string;
    enabled?: boolean;
}
