import { PaymentService } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const paymentQueries = {
    paymentByReference: async (
        _parent: any,
        { reference }: { reference: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const paymentService = new PaymentService();
        return await paymentService.getPaymentByReference(reference);
    },

    paymentByOrderId: async (
        _parent: any,
        { orderId }: { orderId: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const paymentService = new PaymentService();
        return await paymentService.getPaymentByOrderId(orderId);
    },
};
