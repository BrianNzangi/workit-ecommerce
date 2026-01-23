import { apiClient } from '@/lib/api-client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateHomepageCollectionInput {
  title: string;
  slug?: string;
  enabled?: boolean;
  sortOrder?: number;
}

export interface UpdateHomepageCollectionInput {
  title?: string;
  slug?: string;
  enabled?: boolean;
  sortOrder?: number;
}

export interface HomepageCollectionListOptions {
  take?: number;
  skip?: number;
  enabled?: boolean;
}

export class HomepageCollectionService {
  constructor() { }

  async createHomepageCollection(input: CreateHomepageCollectionInput): Promise<any> {
    try {
      const response = await apiClient.post<any>('/homepage-collections', input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('exists')) throw duplicateError(error.message, 'slug');
      throw validationError(error.message || 'Failed to create homepage collection');
    }
  }

  async updateHomepageCollection(
    id: string,
    input: UpdateHomepageCollectionInput
  ): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/homepage-collections/${id}`, input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Homepage collection not found');
      throw validationError(error.message || 'Failed to update homepage collection');
    }
  }

  async getHomepageCollection(id: string): Promise<any | null> {
    try {
      return await apiClient.get<any>(`/homepage-collections/${id}`);
    } catch (error: any) {
      if (error.message?.includes('404')) return null;
      throw error;
    }
  }

  async getHomepageCollections(options: HomepageCollectionListOptions = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());
      if (options.enabled !== undefined) params.append('enabled', String(options.enabled));

      return await apiClient.get<any[]>(`/homepage-collections?${params.toString()}`);
    } catch (error) {
      throw error;
    }
  }

  async addProductToHomepageCollection(
    collectionId: string,
    productId: string,
    sortOrder = 0
  ): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/homepage-collections/${collectionId}/products/${productId}`, { sortOrder });
      return response;
    } catch (error: any) {
      throw validationError(error.message || 'Failed to add product');
    }
  }

  async removeProductFromHomepageCollection(collectionId: string, productId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/homepage-collections/${collectionId}/products/${productId}`);
      return true;
    } catch (error: any) {
      throw validationError(error.message || 'Failed to remove product');
    }
  }

  async reorderHomepageCollectionProducts(
    collectionId: string,
    productOrders: Array<{ productId: string; sortOrder: number }>
  ): Promise<boolean> {
    try {
      await apiClient.put(`/homepage-collections/${collectionId}/reorder`, { productOrders });
      return true;
    } catch (e) {
      throw validationError('Failed to reorder products');
    }
  }
}
