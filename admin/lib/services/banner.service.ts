import { apiClient } from '@/lib/api-client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateBannerInput {
  title: string;
  slug?: string;
  position: any; // BbannerPosition enum
  enabled?: boolean;
  sortOrder?: number;
  desktopImageId?: string | null;
  mobileImageId?: string | null;
  collectionId?: string | null;
}

export interface UpdateBannerInput {
  title?: string;
  slug?: string;
  position?: any;
  enabled?: boolean;
  sortOrder?: number;
  desktopImageId?: string | null;
  mobileImageId?: string | null;
  collectionId?: string | null;
}

export interface BannerListOptions {
  take?: number;
  skip?: number;
  position?: any;
  enabled?: boolean;
}

export class BannerService {
  constructor() { }

  async createBanner(input: CreateBannerInput): Promise<any> {
    try {
      const response = await apiClient.post<any>('/banners', input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('exists')) throw duplicateError(error.message, 'slug');
      throw validationError(error.message || 'Failed to create banner');
    }
  }

  async updateBanner(id: string, input: UpdateBannerInput): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/banners/${id}`, input);
      return response;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Banner not found');
      throw validationError(error.message || 'Failed to update banner');
    }
  }

  async getBanner(id: string): Promise<any | null> {
    try {
      return await apiClient.get<any>(`/banners/${id}`);
    } catch (error: any) {
      if (error.message?.includes('404')) return null;
      throw error;
    }
  }

  async getBannerBySlug(slug: string): Promise<any | null> {
    try {
      const response = await apiClient.get<any[]>(`/banners?slug=${slug}`);
      return response[0] || null;
    } catch (error) {
      return null;
    }
  }

  async getBanners(options: BannerListOptions = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (options.take) params.append('limit', options.take.toString());
      if (options.skip) params.append('offset', options.skip.toString());
      if (options.position) params.append('position', options.position);
      if (options.enabled !== undefined) params.append('enabled', String(options.enabled));

      return await apiClient.get<any[]>(`/banners?${params.toString()}`);
    } catch (error) {
      throw error;
    }
  }
}
