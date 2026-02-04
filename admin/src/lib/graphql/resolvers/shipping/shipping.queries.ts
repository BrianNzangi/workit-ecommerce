import { ShippingMethodService, ShippingMethodListOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const shippingQueries = {
    shippingMethod: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.getShippingMethod(id);
    },

    shippingMethods: async (
        _parent: any,
        { options }: { options?: ShippingMethodListOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.getShippingMethods(options);
    },
};
