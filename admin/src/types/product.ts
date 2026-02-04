import type { Brand } from './brand';
import type { Collection } from './collection';

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
