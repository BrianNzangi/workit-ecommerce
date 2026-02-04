import { OrderService } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';
import { OrderState } from '@/lib/shared/types';

export const orderMutations = {
    createOrder: async (
        _parent: any,
        { input }: { input: any },
        _context: GraphQLContext
    ) => {
        const orderService = new OrderService();
        return await orderService.createOrder(input);
    },

    updateOrderStatus: async (
        _parent: any,
        { id, state }: { id: string; state: OrderState },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const orderService = new OrderService();
        return await orderService.updateOrderStatus(id, state);
    },
};
