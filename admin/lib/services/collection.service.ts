import { apiClient } from '@/lib/api-client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateCollectionInput {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  enabled?: boolean;
  showInMostShopped?: boolean;
  sortOrder?: number;
  assetId?: string | null;
}

export interface UpdateCollectionInput {
  name?: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  enabled?: boolean;
  showInMostShopped?: boolean;
  sortOrder?: number;
  assetId?: string | null;
}

export interface CollectionListOptions {
  take?: number;
  skip?: number;
  parentId?: string | null;
  includeChildren?: boolean;
}

export class CollectionService {
  constructor() { }

  /**
   * Create a new collection (Level 1 or Level 2) via API
   */
  async createCollection(input: CreateCollectionInput): Promise<any> {
    try {
      const response = await apiClient.post<any>('/collections', input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('exists')) {
        throw duplicateError(error.message, 'slug');
      }
      throw validationError(error.message || 'Failed to create collection');
    }
  }

  /**
   * Update an existing collection via API
   */
  async updateCollection(id: string, input: UpdateCollectionInput): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/collections/${id}`, input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Collection not found');
      throw validationError(error.message || 'Failed to update collection');
    }
  }

  /**
   * Get a single collection by ID via API
   */
  async getCollection(id: string, includeChildren = true): Promise<any | null> {
    try {
      const params = new URLSearchParams();
      if (includeChildren) params.append('includeChildren', 'true');
      const response = await apiClient.get<any>(`/collections/${id}?${params.toString()}`);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) return null;
      throw error;
    }
  }

  /**
   * Get a list of collections via API
   */
  async getCollections(options: CollectionListOptions = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());
      if (options.parentId !== undefined) params.append('parentId', options.parentId || '');
      if (options.includeChildren) params.append('includeChildren', 'true');

      const response = await apiClient.get<any[]>(`/collections?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign a product to a collection via API
   */
  async assignProductToCollection(
    productId: string,
    collectionId: string,
    sortOrder = 0
  ): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/collections/${collectionId}/products/${productId}`, { sortOrder });
      return response;
    } catch (error: any) {
      throw validationError(error.message || 'Failed to assign product');
    }
  }

  /**
   * Remove a product from a collection via API
   */
  async removeProductFromCollection(productId: string, collectionId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/collections/${collectionId}/products/${productId}`);
      return true;
    } catch (error: any) {
      throw validationError(error.message || 'Failed to remove product');
    }
  }

  /**
   * Update sort order for a collection via API
   */
  async updateCollectionSortOrder(id: string, sortOrder: number): Promise<any> {
    return this.updateCollection(id, { sortOrder });
  }
}
