import { ShippingMethodService, CreateShippingMethodInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const shippingMutations = {
    createShippingMethod: async (
        _parent: any,
        { input }: { input: CreateShippingMethodInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.createShippingMethod(input);
    },

    updateShippingMethod: async (
        _parent: any,
        { id, input }: { id: string; input: Partial<CreateShippingMethodInput> },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.updateShippingMethod(id, input);
    },

    deleteShippingMethod: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.deleteShippingMethod(id);
    },
};
