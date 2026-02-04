import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const variantMutations = {
    addVariantToProduct: async (
        _parent: any,
        { input }: { input: any },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        throw new Error('Not implemented');
    },

    updateVariant: async (
        _parent: any,
        { id, input }: { id: string; input: any },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        throw new Error('Not implemented');
    },

    updateVariantStock: async (
        _parent: any,
        { id, stockOnHand }: { id: string; stockOnHand: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        throw new Error('Not implemented');
    },
};
