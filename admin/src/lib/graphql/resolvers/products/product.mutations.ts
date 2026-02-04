import { ProductService, CreateProductInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const productMutations = {
    createProduct: async (
        _parent: any,
        { input }: { input: CreateProductInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const productService = new ProductService();
        return await productService.createProduct(input);
    },

    updateProduct: async (
        _parent: any,
        { id, input }: { id: string; input: Partial<CreateProductInput> },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const productService = new ProductService();
        return await productService.updateProduct(id, input);
    },

    deleteProduct: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const productService = new ProductService();
        return await productService.deleteProduct(id);
    },

    addAssetToProduct: async (
        _parent: any,
        _args: any,
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        throw new Error('Not implemented');
    },

    removeAssetFromProduct: async (
        _parent: any,
        _args: any,
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        throw new Error('Not implemented');
    },

    setFeaturedAsset: async (
        _parent: any,
        _args: any,
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        throw new Error('Not implemented');
    },
};
