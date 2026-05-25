import { ProductService, CreateProductInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
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
        { productId, assetId, sortOrder, featured }: { productId: string; assetId: string; sortOrder?: number; featured?: boolean },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const productService = new ProductService();
            return await productService.addAsset(productId, { assetId, sortOrder, featured });
        } catch (e) {
            throw mapHttpError(e);
        }
    },

    removeAssetFromProduct: async (
        _parent: any,
        { productId, assetId }: { productId: string; assetId: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const productService = new ProductService();
            return await productService.removeAsset(productId, assetId);
        } catch (e) {
            throw mapHttpError(e);
        }
    },

    setFeaturedAsset: async (
        _parent: any,
        { productId, assetId }: { productId: string; assetId: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const productService = new ProductService();
            return await productService.setFeaturedAsset(productId, assetId);
        } catch (e) {
            throw mapHttpError(e);
        }
    },
};
