import { apiClient } from '@/lib/api-client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateShippingMethodInput {
  code: string;
  name: string;
  description?: string | null;
  enabled?: boolean;
}

export interface UpdateShippingMethodInput {
  code?: string;
  name?: string;
  description?: string | null;
  enabled?: boolean;
}

export interface ShippingMethodListOptions {
  take?: number;
  skip?: number;
  enabledOnly?: boolean;
}

export class ShippingMethodService {
  constructor() { }

  async createShippingMethod(input: CreateShippingMethodInput): Promise<any> {
    try {
      const response = await apiClient.post<any>('/shipping-methods', input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('exists')) throw duplicateError(error.message, 'code');
      throw validationError(error.message || 'Failed to create shipping method');
    }
  }

  async updateShippingMethod(
    id: string,
    input: UpdateShippingMethodInput
  ): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/shipping-methods/${id}`, input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Shipping method not found');
      throw validationError(error.message || 'Failed to update shipping method');
    }
  }

  async getShippingMethod(id: string): Promise<any | null> {
    try {
      return await apiClient.get<any>(`/shipping-methods/${id}`);
    } catch (error: any) {
      if (error.message?.includes('404')) return null;
      throw error;
    }
  }

  async getShippingMethods(
    options: ShippingMethodListOptions = {}
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());
      if (options.enabledOnly) params.append('enabled', 'true');

      return await apiClient.get<any[]>(`/shipping-methods?${params.toString()}`);
    } catch (error) {
      throw error;
    }
  }

  async deleteShippingMethod(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/shipping-methods/${id}`);
      return true;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Shipping method not found');
      throw error;
    }
  }
}
