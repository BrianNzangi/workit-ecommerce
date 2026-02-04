import { BaseService } from '../base/base.service';
import { validationError, notFoundError } from '@/lib/graphql/errors';
import { UploadAssetInput, AssetUploadResult } from './asset.types';

export class AssetService extends BaseService {
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

            // Note: Use raw fetch for file upload as the SDK might not handle FormData seamlessly
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const response = await fetch(`${baseUrl}/catalog/assets/admin/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {
                    // Let browser set content-type for multipart/form-data with boundary
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            const result = await response.json();

            return {
                asset: result,
                uploadResponse: result,
            };
        } catch (error: any) {
            throw validationError(error.message || 'Failed to upload asset');
        }
    }

    async deleteAsset(assetId: string): Promise<boolean> {
        try {
            await this.adminClient.assets.delete(assetId);
            return true;
        } catch (error: any) {
            if (error.message?.includes('404')) throw notFoundError('Asset not found');
            throw error;
        }
    }

    async getAsset(assetId: string): Promise<any | null> {
        try {
            return await this.adminClient.assets.get(assetId);
        } catch (error: any) {
            if (error.message?.includes('404')) return null;
            throw error;
        }
    }

    async getAssets(type?: any, take?: number, skip?: number): Promise<any[]> {
        try {
            const response = await this.adminClient.assets.list({ take, skip });
            return response.assets;
        } catch (error) {
            throw error;
        }
    }

    generatePreviewUrl(asset: any, _width?: number, _height?: number): string {
        return asset.source;
    }
}
