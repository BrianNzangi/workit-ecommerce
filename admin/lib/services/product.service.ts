import { apiClient } from '@/lib/api-client';
import {
  validationError,
  notFoundError,
} from '@/lib/graphql/errors';

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string | null;
  enabled?: boolean;
  condition?: 'NEW' | 'REFURBISHED';
  sku?: string;
  salePrice?: number;
  originalPrice?: number;
  brandId?: string;
  shippingMethodId?: string;
  stockOnHand?: number;
  assetIds?: string[];
  collections?: string[];
  homepageCollections?: string[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string | null;
  enabled?: boolean;
  condition?: 'NEW' | 'REFURBISHED';
  sku?: string;
  salePrice?: number;
  originalPrice?: number;
  brandId?: string;
  shippingMethodId?: string;
  stockOnHand?: number;
  assetIds?: string[];
  collections?: string[];
  homepageCollections?: string[];
}

export interface ProductListOptions {
  take?: number;
  skip?: number;
  includeDeleted?: boolean;
}

export interface SearchProductsOptions {
  take?: number;
  skip?: number;
  enabledOnly?: boolean;
  inStockOnly?: boolean;
  groupByProduct?: boolean;
}

export class ProductService {
  constructor() { }

  /**
   * Create a new product
   */
  async createProduct(input: CreateProductInput): Promise<any> {
    try {
      const response = await apiClient.post('/products', input);
      return response;
    } catch (error: any) {
      throw validationError(error.message || 'Failed to create product');
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<any> {
    try {
      const response = await apiClient.patch(`/products/${id}`, input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Product not found');
      throw validationError(error.message || 'Failed to update product');
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/products/${id}`);
      return true;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Product not found');
      throw validationError(error.message || 'Failed to delete product');
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string, includeDeleted = false): Promise<any | null> {
    try {
      const params = new URLSearchParams();
      if (includeDeleted) params.append('includeDeleted', 'true');
      const response = await apiClient.get(`/products/${id}?${params.toString()}`);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) return null;
      throw error;
    }
  }

  /**
   * Get a list of products
   */
  async getProducts(options: ProductListOptions = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());
      if (options.includeDeleted) params.append('includeDeleted', 'true');

      const response = await apiClient.get<any[]>(`/products?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search products
   */
  async searchProducts(searchTerm: string, options: ProductListOptions = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());

      const response = await apiClient.get<any[]>(`/products/search?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
