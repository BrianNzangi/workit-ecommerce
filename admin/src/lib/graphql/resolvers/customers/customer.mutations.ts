import { CustomerService, CreateCustomerInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const customerMutations = {
    registerCustomer: async (
        _parent: any,
        { input }: { input: CreateCustomerInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const customerService = new CustomerService();
            return await customerService.registerCustomer(input);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    updateCustomer: async (
        _parent: any,
        { id, input }: { id: string; input: Partial<CreateCustomerInput> },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const customerService = new CustomerService();
            return await customerService.updateCustomer(id, input);
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
