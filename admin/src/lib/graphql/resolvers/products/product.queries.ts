import { ProductService, ProductListOptions } from '@/lib/services';
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
        _args: any,
        context: GraphQLContext
    ) => {
        // requireAuth(context.auth);
        throw new Error('Not implemented');
    },
};
