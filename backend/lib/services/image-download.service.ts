import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export class ImageDownloadService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    }

    /**
     * Download an image from a URL and save it locally
     */
    async downloadImage(url: string, folder: string = 'products'): Promise<any> {
        try {
            // Fetch the image
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }

            // Get content type and validate it's an image
            const contentType = response.headers.get('content-type');
            if (!contentType?.startsWith('image/')) {
                throw new Error(`URL does not point to an image: ${contentType}`);
            }

            // Get the image buffer
            const buffer = await response.arrayBuffer();
            const imageBuffer = Buffer.from(buffer);

            // Extract filename from URL or generate one
            const urlPath = new URL(url).pathname;
            const originalName = path.basename(urlPath);
            const ext = path.extname(originalName) || '.jpg';

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = crypto.randomBytes(3).toString('hex');
            const filename = `${path.basename(originalName, ext)}-${timestamp}-${randomString}${ext}`;

            // Ensure folder exists
            const folderPath = path.join(this.uploadDir, folder);
            await fs.mkdir(folderPath, { recursive: true });

            // Save file
            const filePath = path.join(folderPath, filename);
            await fs.writeFile(filePath, imageBuffer);

            // Create asset record
            const asset = await prisma.asset.create({
                data: {
                    name: filename,
                    type: 'IMAGE',
                    mimeType: contentType,
                    fileSize: imageBuffer.length,
                    source: `/uploads/${folder}/${filename}`,
                    preview: `/uploads/${folder}/${filename}`,
                    width: null,
                    height: null,
                },
            });

            return asset;
        } catch (error) {
            console.error(`Error downloading image from ${url}:`, error);
            throw error;
        }
    }

    /**
     * Download multiple images from URLs
     */
    async downloadMultiple(urls: string[], folder: string = 'products'): Promise<any[]> {
        const assets: any[] = [];
        const errors: { url: string; error: string }[] = [];

        for (const url of urls) {
            try {
                const asset = await this.downloadImage(url.trim(), folder);
                assets.push(asset);
            } catch (error: any) {
                errors.push({ url, error: error.message });
            }
        }

        if (errors.length > 0) {
            console.warn('Some images failed to download:', errors);
        }

        return assets;
    }

    /**
     * Parse comma-separated image URLs from CSV
     */
    parseImageUrls(imageUrlsString: string): string[] {
        if (!imageUrlsString || imageUrlsString.trim() === '') {
            return [];
        }

        return imageUrlsString
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);
    }
}
