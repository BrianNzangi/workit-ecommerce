import { BaseService } from '../base/base.service';
import { Customer, CreateCustomerInput, CustomerSearchOptions } from './customer.types';

export class CustomerService extends BaseService {
    /**
     * Register a new customer
     */
    async registerCustomer(input: CreateCustomerInput): Promise<Customer> {
        return this.adminClient.customers.create(input);
    }

    async createCustomer(input: CreateCustomerInput): Promise<Customer> {
        return this.registerCustomer(input);
    }

    /**
     * Get all customers
     */
    async getCustomers(options: any = {}): Promise<any> {
        return this.adminClient.customers.list(options);
    }

    /**
     * Update an existing customer
     */
    async updateCustomer(id: string, input: Partial<CreateCustomerInput>): Promise<Customer> {
        return this.adminClient.customers.update(id, input);
    }

    /**
     * Get a single customer by ID
     */
    async getCustomer(id: string): Promise<Customer | null> {
        try {
            return await this.adminClient.customers.get(id);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    }

    /**
     * Search for customers by delegating the search term to the backend
     */
    async searchCustomers(
        searchTerm: string,
        options: CustomerSearchOptions = {}
    ): Promise<Customer[]> {
        const response: any = await this.adminClient.customers.list({ q: searchTerm, ...options });
        return Array.isArray(response) ? response : (response.customers || []);
    }

    /**
     * Manage customer addresses
     */
    async createAddress(customerId: string, input: any): Promise<any> {
        // Note: If types are missing, ensure SDK is up to date with backend
        return (this.adminClient.customers as any).createAddress({ id: customerId, ...input });
    }

    async updateAddress(id: string, input: any): Promise<any> {
        return (this.adminClient.customers as any).updateAddress({ id, ...input });
    }

    async deleteAddress(id: string): Promise<boolean> {
        await (this.adminClient.customers as any).removeAddress({ id });
        return true;
    }

    /**
     * Get customer orders
     */
    async getCustomerOrders(customerId: string): Promise<any[]> {
        // Note: SDK seems to be missing getOrders type currently
        const response = await (this.adminClient.customers as any).getOrders({ id: customerId });
        return response as any;
    }
}
