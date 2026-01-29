import { apiClient } from '@/lib/api-client';
import {
  validationError,
  notFoundError,
} from '@/lib/graphql/errors';

export interface UploadAssetInput {
  file: any; // Buffer or File
  fileName: string;
  mimeType: string;
  folder?: string;
}

export interface AssetUploadResult {
  asset: any;
  uploadResponse: any;
}

export class AssetService {
  constructor() { }

  /**
   * Upload asset via API
   */
  async uploadAsset(input: UploadAssetInput): Promise<AssetUploadResult> {
    try {
      const formData = new FormData();

      // If input.file is a Buffer or Blob, we can append it directly
      // In the browser, input.file will likely be a File object
      formData.append('file', input.file, input.fileName);
      if (input.folder) formData.append('folder', input.folder);

      const response = await apiClient.post<any>('/assets/upload', formData);

      return {
        asset: response,
        uploadResponse: response
      };
    } catch (error: any) {
      throw validationError(error.message || 'Failed to upload asset');
    }
  }


  async deleteAsset(assetId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/assets/${assetId}`);
      return true;
    } catch (error: any) {
      if (error.message?.includes('404')) throw notFoundError('Asset not found');
      throw error;
    }
  }

  async getAsset(assetId: string): Promise<any | null> {
    try {
      return await apiClient.get<any>(`/assets/${assetId}`);
    } catch (error: any) {
      if (error.message?.includes('404')) return null;
      throw error;
    }
  }

  async getAssets(type?: any, take?: number, skip?: number): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (take) params.append('limit', take.toString());
      if (skip) params.append('offset', skip.toString());
      return await apiClient.get<any[]>(`/assets?${params.toString()}`);
    } catch (error) {
      throw error;
    }
  }

  generatePreviewUrl(asset: any, width?: number, height?: number): string {
    return asset.source;
  }
}
