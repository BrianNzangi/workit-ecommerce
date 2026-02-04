import type { Product } from './product';

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
