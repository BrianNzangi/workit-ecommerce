import { PrismaClient, BannerPosition } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { BannerService } from '@/lib/services/banner.service';
import { AssetService } from '@/lib/services/asset.service';

// Feature: workit-admin-backend, Property 40: Banner creation with images
// Validates: Requirements 9.1
// For any valid banner data (title, position, desktop image, mobile image), creating a banner should store all fields including both image references

// Feature: workit-admin-backend, Property 41: Banner position and enabled filtering
// Validates: Requirements 9.5
// For any set of banners with different positions and enabled status, querying banners for a specific position should return only enabled banners for that position, sorted by sortOrder ascending

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Helper to generate valid banner titles
const bannerTitleArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

// Helper to generate banner positions
const bannerPositionArbitrary = fc.constantFrom(
  BannerPosition.HERO,
  BannerPosition.DEALS,
  BannerPosition.DEALS_HORIZONTAL,
  BannerPosition.MIDDLE,
  BannerPosition.BOTTOM,
  BannerPosition.COLLECTION_TOP
);

// Helper to create a test asset
async function createTestAsset(name: string): Promise<string> {
  const asset = await prisma.asset.create({
    data: {
      name,
      type: 'IMAGE',
      mimeType: 'image/jpeg',
      fileSize: 1024,
      source: `https://example.com/${name}.jpg`,
      preview: `https://example.com/${name}-preview.jpg`,
      width: 1920,
      height: 1080,
    },
  });
  return asset.id;
}

describe('Banner Management Properties', () => {
  let bannerService: BannerService;

  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
    bannerService = new BannerService(prisma);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up banners and assets after each test
    await prisma.banner.deleteMany({});
    await prisma.asset.deleteMany({});
  });

  describe('Property 40: Banner creation with images', () => {
    it('should persist all banner fields including both image references when creating a banner', async () => {
      await fc.assert(
        fc.asyncProperty(
          bannerTitleArbitrary,
          bannerPositionArbitrary,
          fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: null }),
          fc.boolean(),
          fc.integer({ min: 0, max: 100 }),
          async (title, position, link, enabled, sortOrder) => {
            // Add unique identifier to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const uniqueTitle = `${title}-${uniqueId}`;

            // Create test assets for desktop and mobile images
            const desktopImageId = await createTestAsset(`desktop-${uniqueId}`);
            const mobileImageId = await createTestAsset(`mobile-${uniqueId}`);

            // Create a banner with both images
            const createdBanner = await bannerService.createBanner({
              title: uniqueTitle,
              position,
              link,
              enabled,
              sortOrder,
              imageId: desktopImageId,
              mobileImageId: mobileImageId,
            });

            // Query the banner by ID
            const retrievedBanner = await bannerService.getBanner(createdBanner.id);

            // Key assertion: all fields should be persisted correctly
            expect(retrievedBanner).not.toBeNull();
            
            // Title is trimmed by the service (correct behavior)
            expect(retrievedBanner?.title).toBe(uniqueTitle.trim());
            expect(retrievedBanner?.position).toBe(position);
            
            // Link: empty strings are stored as null (correct behavior)
            const expectedLink = link && link.trim().length > 0 ? link.trim() : null;
            expect(retrievedBanner?.link).toBe(expectedLink);
            
            expect(retrievedBanner?.enabled).toBe(enabled);
            expect(retrievedBanner?.sortOrder).toBe(sortOrder);

            // Verify slug was generated
            expect(retrievedBanner?.slug).toBeDefined();
            expect(retrievedBanner?.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);

            // Key assertion: both image references should be stored
            expect(retrievedBanner?.imageId).toBe(desktopImageId);
            expect(retrievedBanner?.mobileImageId).toBe(mobileImageId);

            // Verify images are included in the query result
            expect((retrievedBanner as any)?.image).toBeDefined();
            expect((retrievedBanner as any)?.image?.id).toBe(desktopImageId);
            expect((retrievedBanner as any)?.mobileImage).toBeDefined();
            expect((retrievedBanner as any)?.mobileImage?.id).toBe(mobileImageId);

            // Clean up
            await prisma.banner.delete({
              where: { id: createdBanner.id },
            });
            await prisma.asset.delete({
              where: { id: desktopImageId },
            });
            await prisma.asset.delete({
              where: { id: mobileImageId },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for 100 iterations
  });

  describe('Property 41: Banner position and enabled filtering', () => {
    it('should return only enabled banners for a specific position sorted by sortOrder ascending', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              title: bannerTitleArbitrary,
              position: bannerPositionArbitrary,
              enabled: fc.boolean(),
              sortOrder: fc.integer({ min: 0, max: 100 }),
            }),
            { minLength: 5, maxLength: 15 }
          ),
          async (bannersData) => {
            // Add unique identifiers to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // Create banners with mixed positions and enabled status
            const createdBanners: Array<{ id: string; position: BannerPosition; enabled: boolean; sortOrder: number }> = [];
            for (let i = 0; i < bannersData.length; i++) {
              const bannerData = bannersData[i];
              const uniqueBannerData = {
                title: `${bannerData.title}-${uniqueId}-${i}`,
                position: bannerData.position,
                enabled: bannerData.enabled,
                sortOrder: bannerData.sortOrder,
              };

              // Create banner
              const banner = await bannerService.createBanner(uniqueBannerData);

              createdBanners.push({
                id: banner.id,
                position: banner.position,
                enabled: banner.enabled,
                sortOrder: banner.sortOrder,
              });
            }

            // Pick a random position to test
            const testPosition = bannersData[0].position;

            // Query banners for the specific position with enabled filter
            const filteredBanners = await bannerService.getBanners({
              position: testPosition,
              enabled: true,
            });

            // Key assertion: only enabled banners for the specified position should be returned
            expect(filteredBanners).toBeDefined();

            // All returned banners should have the correct position and be enabled
            for (const banner of filteredBanners) {
              expect(banner.position).toBe(testPosition);
              expect(banner.enabled).toBe(true);
            }

            // Count expected banners (enabled + matching position)
            const expectedBanners = createdBanners.filter(
              b => b.position === testPosition && b.enabled
            );

            // Filter to only include banners from this test run
            const testFilteredBanners = filteredBanners.filter(b =>
              createdBanners.some(created => created.id === b.id)
            );

            expect(testFilteredBanners).toHaveLength(expectedBanners.length);

            // Key assertion: banners should be sorted by sortOrder in ascending order
            if (testFilteredBanners.length > 1) {
              for (let i = 0; i < testFilteredBanners.length - 1; i++) {
                const currentSortOrder = testFilteredBanners[i].sortOrder;
                const nextSortOrder = testFilteredBanners[i + 1].sortOrder;
                expect(currentSortOrder).toBeLessThanOrEqual(nextSortOrder);
              }
            }

            // Query banners for the specific position without enabled filter
            const allPositionBanners = await bannerService.getBanners({
              position: testPosition,
            });

            // Should include both enabled and disabled banners for the position
            const testAllPositionBanners = allPositionBanners.filter(b =>
              createdBanners.some(created => created.id === b.id)
            );

            const expectedAllPositionBanners = createdBanners.filter(
              b => b.position === testPosition
            );

            expect(testAllPositionBanners).toHaveLength(expectedAllPositionBanners.length);

            // All should have the correct position
            for (const banner of testAllPositionBanners) {
              expect(banner.position).toBe(testPosition);
            }

            // Clean up
            for (const banner of createdBanners) {
              await prisma.banner.delete({
                where: { id: banner.id },
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for 100 iterations
  });
});
