import { CustomerService, CustomerSearchOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const customerQueries = {
    customer: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const customerService = new CustomerService();
        return await customerService.getCustomer(id);
    },

    searchCustomers: async (
        _parent: any,
        { searchTerm, options }: { searchTerm: string; options?: CustomerSearchOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const customerService = new CustomerService();
        return await customerService.searchCustomers(searchTerm, options);
    },

    customerOrders: async (
        _parent: any,
        { customerId }: { customerId: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const customerService = new CustomerService();
        return await customerService.getCustomerOrders(customerId);
    },
};
