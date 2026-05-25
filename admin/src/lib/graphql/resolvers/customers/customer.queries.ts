import { CustomerService, CustomerSearchOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const customerQueries = {
    customer: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const customerService = new CustomerService();
            return await customerService.getCustomer(id);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    searchCustomers: async (
        _parent: any,
        { searchTerm, options }: { searchTerm: string; options?: CustomerSearchOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const customerService = new CustomerService();
            return await customerService.searchCustomers(searchTerm, options);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    customerOrders: async (
        _parent: any,
        { customerId }: { customerId: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const customerService = new CustomerService();
            return await customerService.getCustomerOrders(customerId);
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
