import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '../../errors';
import { OrderService } from '@/lib/services/orders/order.service';
import type { GraphQLContext } from '../../context';

export const inventoryQueries = {
    inventory: async (
        _parent: any,
        { lowStockThreshold }: { lowStockThreshold?: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const orderService = new OrderService();
            return await orderService.getInventory({ lowStockThreshold });
        } catch (e) {
            throw mapHttpError(e);
        }
    },
};
