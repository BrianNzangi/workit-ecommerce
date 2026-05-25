import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import { ProductService } from '@/lib/services/products/product.service';
import type { GraphQLContext } from '../../context';

export const variantMutations = {
    addVariantToProduct: async (
        _parent: any,
        { input }: { input: any },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const productService = new ProductService();
            return await productService.addVariant(input.productId, input);
        } catch (e) {
            throw mapHttpError(e);
        }
    },

    updateVariant: async (
        _parent: any,
        { id, input }: { id: string; input: any },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const productService = new ProductService();
            return await productService.updateVariant(id, input);
        } catch (e) {
            throw mapHttpError(e);
        }
    },

    updateVariantStock: async (
        _parent: any,
        { id, stockOnHand }: { id: string; stockOnHand: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const productService = new ProductService();
            return await productService.updateVariantStock(id, stockOnHand);
        } catch (e) {
            throw mapHttpError(e);
        }
    },
};
