import { apiClient } from '@/lib/api-client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface RegisterCustomerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UpdateCustomerInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  enabled?: boolean;
}

export interface CreateAddressInput {
  customerId: string;
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  phoneNumber: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
}

export interface UpdateAddressInput {
  fullName?: string;
  streetLine1?: string;
  streetLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
}

export interface CustomerSearchOptions {
  take?: number;
  skip?: number;
}

export class CustomerService {
  constructor() { }

  /**
   * Register a new customer via API
   */
  async registerCustomer(input: RegisterCustomerInput): Promise<any> {
    try {
      // Assuming backend handles validation and hashing
      const response = await apiClient.post<any>('/customers', input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('exists')) {
        throw duplicateError(error.message, 'email');
      }
      throw validationError(error.message || 'Failed to register customer');
    }
  }

  /**
   * Update customer information via API
   */
  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/customers/${id}`, input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Customer not found');
      throw validationError(error.message || 'Failed to update customer');
    }
  }

  /**
   * Get customer by ID via API
   */
  async getCustomer(id: string): Promise<any | null> {
    try {
      const response = await apiClient.get<any>(`/customers/${id}`);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) return null;
      throw error;
    }
  }

  /**
   * Search customers via API
   */
  async searchCustomers(
    searchTerm: string,
    options: CustomerSearchOptions = {}
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());

      const response = await apiClient.get<any[]>(`/customers/search?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new address for a customer via API
   */
  async createAddress(input: CreateAddressInput): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/customers/${input.customerId}/addresses`, input);
      return response;
    } catch (error: any) {
      throw validationError(error.message || 'Failed to create address');
    }
  }

  /**
   * Update an address via API
   */
  async updateAddress(id: string, input: UpdateAddressInput): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/customers/addresses/${id}`, input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Address not found');
      throw validationError(error.message || 'Failed to update address');
    }
  }

  /**
   * Delete an address via API
   */
  async deleteAddress(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/customers/addresses/${id}`);
      return true;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Address not found');
      throw error;
    }
  }

  /**
   * Get customer orders via API
   */
  async getCustomerOrders(customerId: string) {
    try {
      const response = await apiClient.get<any[]>(`/customers/${customerId}/orders`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}
