import { ProductService, ProductListOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const productQueries = {
    product: async (
        _parent: any,
        { id }: { id: string },
        _context: GraphQLContext
    ) => {
        const productService = new ProductService();
        return await productService.getProduct(id);
    },

    products: async (
        _parent: any,
        { options }: { options?: ProductListOptions },
        _context: GraphQLContext
    ) => {
        const productService = new ProductService();
        return await productService.getProducts(options);
    },

    searchProducts: async (
        _parent: any,
        { searchTerm }: { searchTerm: string },
        _context: GraphQLContext
    ) => {
        const productService = new ProductService();
        return await productService.searchProducts(searchTerm);
    },

    searchProductsEnhanced: async (
        _parent: any,
        { searchTerm, options }: { searchTerm: string; options?: Record<string, any> },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        if (!searchTerm) return [];
        try {
            const productService = new ProductService();
            return await productService.searchProductsEnhanced(searchTerm, options);
        } catch (e) {
            throw mapHttpError(e);
        }
    },
};
