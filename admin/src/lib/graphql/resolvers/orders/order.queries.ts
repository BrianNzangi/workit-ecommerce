import { OrderService, OrderListOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const orderQueries = {
    order: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const orderService = new OrderService();
            return await orderService.getOrder(id);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    orders: async (
        _parent: any,
        { options }: { options?: OrderListOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const orderService = new OrderService();
            return await orderService.getOrders(options);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    searchOrders: async (
        _parent: any,
        { searchTerm }: { searchTerm: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const orderService = new OrderService();
            return await orderService.searchOrders(searchTerm);
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
