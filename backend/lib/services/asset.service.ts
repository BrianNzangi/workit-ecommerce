import { PrismaClient, Asset, AssetType } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const SUPPORTED_DOCUMENT_TYPES = ['application/pdf'];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

// Upload directory
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export interface UploadAssetInput {
  file: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}

export interface AssetUploadResult {
  asset: Asset;
  uploadResponse: any;
}

export class AssetService {
  constructor(private prisma: PrismaClient) { }

  /**
   * Validate file type and size
   */
  private validateFile(mimeType: string, fileSize: number): { valid: boolean; assetType?: AssetType; error?: string } {
    // Determine asset type
    let assetType: AssetType;
    let maxSize: number;

    if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
      assetType = AssetType.IMAGE;
      maxSize = MAX_IMAGE_SIZE;
    } else if (SUPPORTED_VIDEO_TYPES.includes(mimeType)) {
      assetType = AssetType.VIDEO;
      maxSize = MAX_VIDEO_SIZE;
    } else if (SUPPORTED_DOCUMENT_TYPES.includes(mimeType)) {
      assetType = AssetType.DOCUMENT;
      maxSize = MAX_DOCUMENT_SIZE;
    } else {
      return {
        valid: false,
        error: `Unsupported file type: ${mimeType}. Supported types: ${[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES, ...SUPPORTED_DOCUMENT_TYPES].join(', ')}`,
      };
    }

    // Check file size
    if (fileSize > maxSize) {
      return {
        valid: false,
        error: `File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes for ${assetType}`,
      };
    }

    return { valid: true, assetType };
  }

  /**
   * Generate unique filename
   */
  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(`.${ext}`, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return `${nameWithoutExt}-${timestamp}-${random}.${ext}`;
  }

  /**
   * Upload asset to local filesystem and store metadata in database
   */
  async uploadAsset(input: UploadAssetInput): Promise<AssetUploadResult> {
    const { file, fileName, mimeType, folder = 'products' } = input;

    // Validate file
    const validation = this.validateFile(mimeType, file.length);
    if (!validation.valid) {
      throw new GraphQLError(validation.error || 'Invalid file', {
        extensions: {
          code: 'VALIDATION_ERROR',
          field: 'file',
        },
      });
    }

    const assetType = validation.assetType!;

    try {
      // Create upload directory if it doesn't exist
      const uploadPath = join(UPLOAD_DIR, folder);
      if (!existsSync(uploadPath)) {
        await mkdir(uploadPath, { recursive: true });
      }

      // Generate unique filename
      const uniqueFileName = this.generateUniqueFileName(fileName);
      const filePath = join(uploadPath, uniqueFileName);

      // Write file to disk
      await writeFile(filePath, file);

      // Generate public URL
      const publicUrl = `/uploads/${folder}/${uniqueFileName}`;

      // Get image dimensions if it's an image
      let width: number | null = null;
      let height: number | null = null;

      if (assetType === AssetType.IMAGE) {
        try {
          const metadata = await sharp(filePath).metadata();
          width = metadata.width || null;
          height = metadata.height || null;
        } catch (error) {
          console.error('Failed to extract image dimensions:', error);
          // Continue without dimensions if extraction fails
        }
      }

      // Store asset metadata in database
      const asset = await this.prisma.asset.create({
        data: {
          name: uniqueFileName,
          type: assetType,
          mimeType: mimeType,
          fileSize: file.length,
          source: publicUrl,
          preview: publicUrl, // For local files, source and preview are the same
          width,
          height,
        },
      });

      return {
        asset,
        uploadResponse: {
          fileName: uniqueFileName,
          url: publicUrl,
          size: file.length,
        },
      };
    } catch (error: any) {
      throw new GraphQLError(`Failed to upload asset: ${error.message}`, {
        extensions: {
          code: 'UPLOAD_ERROR',
          details: error,
        },
      });
    }
  }

  /**
   * Delete asset from filesystem and database
   */
  async deleteAsset(assetId: string): Promise<boolean> {
    // Find the asset in database
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new GraphQLError('Asset not found', {
        extensions: {
          code: 'NOT_FOUND',
          field: 'assetId',
        },
      });
    }

    try {
      // Delete file from filesystem
      const filePath = join(process.cwd(), 'public', asset.source);
      if (existsSync(filePath)) {
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
      }

      // Delete from database
      await this.prisma.asset.delete({
        where: { id: assetId },
      });

      return true;
    } catch (error: any) {
      throw new GraphQLError(`Failed to delete asset: ${error.message}`, {
        extensions: {
          code: 'DELETE_ERROR',
          details: error,
        },
      });
    }
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId: string): Promise<Asset | null> {
    return await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
  }

  /**
   * Get all assets with optional filtering
   */
  async getAssets(type?: AssetType, take?: number, skip?: number): Promise<Asset[]> {
    return await this.prisma.asset.findMany({
      where: type ? { type } : undefined,
      take: take || 50,
      skip: skip || 0,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generate preview URL for an asset (for local files, just return the source)
   */
  generatePreviewUrl(asset: Asset, width?: number, height?: number): string {
    // For local files, we don't have transformation capabilities
    // You could implement this with sharp library if needed
    return asset.source;
  }
}
