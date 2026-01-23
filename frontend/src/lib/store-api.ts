import { apiClient } from './api-client';

/**
 * Store API Client (REST)
 */

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  children?: Collection[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  variants?: any[];
}

/**
 * Get products via NestJS API
 */
export async function getProducts(options: { limit?: number; offset?: number } = {}): Promise<any[]> {
  try {
    const response = await apiClient.get('/products', {
      params: options
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get product by slug via NestJS API
 */
export async function getProductBySlug(slug: string): Promise<any | null> {
  try {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

/**
 * Search products via NestJS API
 */
export async function searchProducts(searchTerm: string): Promise<any[]> {
  try {
    const response = await apiClient.get('/products/search', {
      params: { q: searchTerm }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Checkout via NestJS API
 */
export async function checkout(input: any): Promise<any> {
  try {
    const response = await apiClient.post('/orders/checkout', input);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Checkout failed');
  }
}

// NOTE: Banners and Collections might still need implementation in the NestJS backend
// to fully replace the GraphQL calls below.

export async function getCollections(): Promise<Collection[]> {
  // For now, return empty or implement in NestJS
  console.warn('getCollections not yet migrated to REST');
  return [];
}

export async function getBanners(): Promise<any[]> {
  // For now, return empty or implement in NestJS
  console.warn('getBanners not yet migrated to REST');
  return [];
}
