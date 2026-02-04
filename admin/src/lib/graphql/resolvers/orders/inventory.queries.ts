import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const inventoryQueries = {
    inventory: async (
        _parent: any,
        { lowStockThreshold }: { lowStockThreshold?: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        // OrderService.getInventory implementation was missing in small file, stashing stub
        throw new Error('Not implemented');
    },
};
