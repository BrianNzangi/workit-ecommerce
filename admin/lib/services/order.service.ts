import { apiClient } from '@/lib/api-client';
import {
  validationError,
  notFoundError,
} from '@/lib/graphql/errors';

export interface CreateOrderLineInput {
  variantId: string;
  quantity: number;
}

export interface OrderAddressInput {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  phoneNumber: string;
}

export interface CreateOrderInput {
  customerId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  password?: string;
  shippingAddress?: OrderAddressInput;
  billingAddress?: OrderAddressInput;
  lines: CreateOrderLineInput[];
  shippingMethodId?: string;
  shippingCost?: number;
  tax?: number;
}

export interface OrderListOptions {
  take?: number;
  skip?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'total';
  sortOrder?: 'asc' | 'desc';
  state?: string;
}

export interface OrderSearchOptions {
  take?: number;
  skip?: number;
}

export class OrderService {
  constructor() { }

  /**
   * Create a new order via NestJS API
   */
  async createOrder(input: CreateOrderInput): Promise<any> {
    try {
      const response = await apiClient.post('/orders/checkout', input);
      return response;
    } catch (error: any) {
      throw validationError(error.message || 'Checkout failed');
    }
  }

  /**
   * Update order status via NestJS API
   */
  async updateOrderStatus(id: string, state: string): Promise<any> {
    try {
      const response = await apiClient.request<any>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ state }),
      });
      return response;
    } catch (error: any) {
      if (error.message.includes('404')) throw notFoundError('Order not found');
      throw validationError(error.message || 'Failed to update order status');
    }
  }

  /**
   * Get a single order by ID via NestJS API
   */
  async getOrder(id: string): Promise<any | null> {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response;
    } catch (error: any) {
      if (error.message.includes('404')) return null;
      throw error;
    }
  }

  /**
   * Get a list of orders via NestJS API
   */
  async getOrders(options: OrderListOptions = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.state) params.append('state', options.state);

      const response = await apiClient.get<any[]>(`/orders?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search orders via NestJS API
   */
  async searchOrders(searchTerm: string, options: OrderSearchOptions = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());

      const response = await apiClient.get<any[]>(`/orders/search?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get inventory levels via NestJS API
   */
  async getInventory(options: { lowStockThreshold?: number } = {}) {
    try {
      const params = new URLSearchParams();
      if (options.lowStockThreshold) params.append('threshold', options.lowStockThreshold.toString());

      const response = await apiClient.get<any>(`/products/inventory?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
