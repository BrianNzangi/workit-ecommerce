import { PaymentService, InitializePaymentInput } from '@/lib/services';
import type { GraphQLContext } from '../../context';

export const paymentMutations = {
    initializePayment: async (
        _parent: any,
        { input }: { input: InitializePaymentInput },
        _context: GraphQLContext
    ) => {
        const paymentService = new PaymentService();
        return await paymentService.initializePayment(input);
    },
};
