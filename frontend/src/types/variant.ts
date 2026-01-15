// Variant type for Vendure backend
export interface Variant {
    id: string; // UUID - NEVER convert to number
    sku: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    status: 'active' | 'inactive';
    inventory: {
        track: boolean;
        stockOnHand: number;
        lowStockThreshold?: number;
    };
    options?: {
        name: string;
        value: string;
    }[];
    images?: {
        id: string;
        url: string;
        altText?: string;
    }[];
}
