import { CustomerService } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const addressMutations = {
    createAddress: async (
        _parent: any,
        { customerId, input }: { customerId: string; input: any },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const customerService = new CustomerService();
            return await customerService.createAddress(customerId, input);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    updateAddress: async (
        _parent: any,
        { id, input }: { id: string; input: any },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const customerService = new CustomerService();
            return await customerService.updateAddress(id, input);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    deleteAddress: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const customerService = new CustomerService();
            return await customerService.deleteAddress(id);
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
