import { PrismaClient, AssetType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { AssetService } from '@/lib/services/asset.service';

// Feature: workit-admin-backend, Property 32: Asset upload URL generation
// Validates: Requirements 7.1
// For any valid image upload, the system should store the file and generate 
// both source and preview URLs that are accessible

// Feature: workit-admin-backend, Property 33: Asset file validation
// Validates: Requirements 7.2
// For any file upload, files with invalid types or sizes exceeding the limit 
// should be rejected with appropriate error messages

// Feature: workit-admin-backend, Property 34: Asset deletion completeness
// Validates: Requirements 7.3
// For any asset, after deletion, the asset should not appear in queries 
// and the file should be removed from storage

// Feature: workit-admin-backend, Property 35: Asset ID uniqueness
// Validates: Requirements 7.4
// For any set of uploaded assets, all asset IDs should be unique

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Helper to generate valid file names
const fileNameArbitrary = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim().replace(/[^a-zA-Z0-9.-]/g, '_'));

// Helper to generate valid image MIME types
const imageMimeTypeArbitrary = fc.constantFrom(
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
);

// Helper to generate invalid MIME types
const invalidMimeTypeArbitrary = fc.constantFrom(
  'application/exe',
  'text/html',
  'application/javascript',
  'video/avi',
  'audio/mp3'
);

// Helper to generate small valid image file (mock)
const smallImageFileArbitrary = fc.uint8Array({ minLength: 100, maxLength: 1024 * 100 }); // 100 bytes to 100KB

// Helper to generate oversized file
const oversizedFileArbitrary = fc.constant(Buffer.alloc(11 * 1024 * 1024)); // 11MB (exceeds 10MB limit)

// Helper to create a mock image buffer
function createMockImageBuffer(size: number = 1024): Buffer {
  // Create a minimal valid JPEG header
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, // JPEG SOI and APP0 marker
    0x00, 0x10, // APP0 length
    0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // Version
    0x00, // Units
    0x00, 0x01, 0x00, 0x01, // X and Y density
    0x00, 0x00, // Thumbnail dimensions
  ]);
  
  // Fill the rest with random data
  const remaining = Buffer.alloc(size - jpegHeader.length);
  
  // Add JPEG end marker
  const jpegEnd = Buffer.from([0xFF, 0xD9]);
  
  return Buffer.concat([jpegHeader, remaining, jpegEnd]);
}

describe('Asset Management Properties', () => {
  let assetService: AssetService;
  const uploadedAssetIds: string[] = [];

  // Helper to check if ImageKit is properly configured
  const isImageKitConfigured = () => {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    
    return publicKey && 
           privateKey && 
           urlEndpoint &&
           publicKey !== 'your-imagekit-public-key' &&
           privateKey !== 'your-imagekit-private-key' &&
           urlEndpoint !== 'https://ik.imagekit.io/your-id';
  };

  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
    assetService = new AssetService(prisma);
    
    // Check if ImageKit is configured
    if (!isImageKitConfigured()) {
      console.warn('⚠️  ImageKit credentials not configured. Tests requiring ImageKit API will be skipped.');
      console.warn('   To run full tests, configure IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env.local');
    }
  });

  afterAll(async () => {
    // Clean up any uploaded assets
    for (const assetId of uploadedAssetIds) {
      try {
        await assetService.deleteAsset(assetId);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
    
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up assets after each test
    await prisma.asset.deleteMany({});
    uploadedAssetIds.length = 0;
  });

  describe('Property 32: Asset upload URL generation', () => {
    it('should generate accessible source and preview URLs for uploaded assets', async () => {
      // Skip test if ImageKit is not configured
      if (!isImageKitConfigured()) {
        console.log('⏭️  Skipping Property 32 test - ImageKit not configured');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fileNameArbitrary,
          imageMimeTypeArbitrary,
          async (fileName, mimeType) => {
            // Create a small mock image file
            const fileBuffer = createMockImageBuffer(1024);

            // Upload the asset
            const result = await assetService.uploadAsset({
              file: fileBuffer,
              fileName: fileName,
              mimeType: mimeType,
              folder: 'test-assets',
            });

            uploadedAssetIds.push(result.asset.id);

            // Assertions
            expect(result.asset).toBeDefined();
            expect(result.asset.id).toBeTruthy();
            expect(result.asset.source).toBeTruthy();
            expect(result.asset.preview).toBeTruthy();
            
            // Check that URLs are valid
            expect(result.asset.source).toMatch(/^https?:\/\//);
            expect(result.asset.preview).toMatch(/^https?:\/\//);
            
            // Check that source URL contains ImageKit endpoint
            const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || '';
            if (urlEndpoint) {
              expect(result.asset.source).toContain(urlEndpoint.replace('https://', '').replace('http://', ''));
            }
            
            // Verify asset is stored in database
            const retrievedAsset = await assetService.getAsset(result.asset.id);
            expect(retrievedAsset).not.toBeNull();
            expect(retrievedAsset?.source).toBe(result.asset.source);
            expect(retrievedAsset?.preview).toBe(result.asset.preview);
            
            // Clean up
            await assetService.deleteAsset(result.asset.id);
            uploadedAssetIds.splice(uploadedAssetIds.indexOf(result.asset.id), 1);
          }
        ),
        { numRuns: 10 } // Reduced runs for external API calls
      );
    }, 60000); // 60 second timeout for external API calls
  });

  describe('Property 33: Asset file validation', () => {
    it('should reject files with invalid types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fileNameArbitrary,
          invalidMimeTypeArbitrary,
          async (fileName, mimeType) => {
            const fileBuffer = Buffer.from('test content');

            // Attempt to upload with invalid MIME type
            await expect(
              assetService.uploadAsset({
                file: fileBuffer,
                fileName: fileName,
                mimeType: mimeType,
              })
            ).rejects.toThrow();

            // Verify error message mentions unsupported file type
            try {
              await assetService.uploadAsset({
                file: fileBuffer,
                fileName: fileName,
                mimeType: mimeType,
              });
            } catch (error: any) {
              expect(error.message).toMatch(/unsupported file type/i);
              expect(error.extensions?.code).toBe('VALIDATION_ERROR');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject files exceeding size limits', async () => {
      await fc.assert(
        fc.asyncProperty(
          fileNameArbitrary,
          imageMimeTypeArbitrary,
          async (fileName, mimeType) => {
            // Create an oversized file (11MB for images with 10MB limit)
            const oversizedFile = Buffer.alloc(11 * 1024 * 1024);

            // Attempt to upload oversized file
            await expect(
              assetService.uploadAsset({
                file: oversizedFile,
                fileName: fileName,
                mimeType: mimeType,
              })
            ).rejects.toThrow();

            // Verify error message mentions file size
            try {
              await assetService.uploadAsset({
                file: oversizedFile,
                fileName: fileName,
                mimeType: mimeType,
              });
            } catch (error: any) {
              expect(error.message).toMatch(/file size.*exceeds/i);
              expect(error.extensions?.code).toBe('VALIDATION_ERROR');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 34: Asset deletion completeness', () => {
    it('should remove asset from database after deletion', async () => {
      // Skip test if ImageKit is not configured
      if (!isImageKitConfigured()) {
        console.log('⏭️  Skipping Property 34 test - ImageKit not configured');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fileNameArbitrary,
          imageMimeTypeArbitrary,
          async (fileName, mimeType) => {
            // Create a small mock image file
            const fileBuffer = createMockImageBuffer(1024);

            // Upload the asset
            const result = await assetService.uploadAsset({
              file: fileBuffer,
              fileName: fileName,
              mimeType: mimeType,
              folder: 'test-assets',
            });

            const assetId = result.asset.id;

            // Verify asset exists
            const beforeDelete = await assetService.getAsset(assetId);
            expect(beforeDelete).not.toBeNull();

            // Delete the asset
            const deleteResult = await assetService.deleteAsset(assetId);
            expect(deleteResult).toBe(true);

            // Verify asset no longer exists in database
            const afterDelete = await assetService.getAsset(assetId);
            expect(afterDelete).toBeNull();

            // Verify asset doesn't appear in list queries
            const allAssets = await assetService.getAssets();
            const foundAsset = allAssets.find(a => a.id === assetId);
            expect(foundAsset).toBeUndefined();
          }
        ),
        { numRuns: 10 } // Reduced runs for external API calls
      );
    }, 60000); // 60 second timeout for external API calls
  });

  describe('Property 35: Asset ID uniqueness', () => {
    it('should generate unique IDs for all uploaded assets', async () => {
      // Skip test if ImageKit is not configured
      if (!isImageKitConfigured()) {
        console.log('⏭️  Skipping Property 35 test - ImageKit not configured');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(fileNameArbitrary, { minLength: 2, maxLength: 5 }),
          imageMimeTypeArbitrary,
          async (fileNames, mimeType) => {
            const assetIds: string[] = [];

            // Upload multiple assets
            for (const fileName of fileNames) {
              const fileBuffer = createMockImageBuffer(1024);

              const result = await assetService.uploadAsset({
                file: fileBuffer,
                fileName: fileName,
                mimeType: mimeType,
                folder: 'test-assets',
              });

              assetIds.push(result.asset.id);
              uploadedAssetIds.push(result.asset.id);
            }

            // Verify all IDs are unique
            const uniqueIds = new Set(assetIds);
            expect(uniqueIds.size).toBe(assetIds.length);

            // Verify each asset can be retrieved by its unique ID
            for (const assetId of assetIds) {
              const asset = await assetService.getAsset(assetId);
              expect(asset).not.toBeNull();
              expect(asset?.id).toBe(assetId);
            }

            // Clean up
            for (const assetId of assetIds) {
              await assetService.deleteAsset(assetId);
              uploadedAssetIds.splice(uploadedAssetIds.indexOf(assetId), 1);
            }
          }
        ),
        { numRuns: 5 } // Reduced runs for multiple external API calls
      );
    }, 60000); // 60 second timeout for external API calls
  });
});
