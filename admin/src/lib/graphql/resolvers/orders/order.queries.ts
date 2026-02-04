import { OrderService, OrderListOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const orderQueries = {
    order: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const orderService = new OrderService();
        return await orderService.getOrder(id);
    },

    orders: async (
        _parent: any,
        { options }: { options?: OrderListOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const orderService = new OrderService();
        return await orderService.getOrders(options);
    },

    searchOrders: async (
        _parent: any,
        { searchTerm }: { searchTerm: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const orderService = new OrderService();
        return await orderService.searchOrders(searchTerm);
    },
};
