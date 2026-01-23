import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { HomepageCollectionService } from '@/lib/services/homepage-collection.service';
import { ProductService } from '@/lib/services/product.service';

// Feature: workit-admin-backend, Property 12: Homepage collection product ordering
// Validates: Requirements 2.1.2, 2.1.5
// For any homepage collection with products, querying the collection should return products sorted by their sort order values in ascending order

// Feature: workit-admin-backend, Property 13: Homepage collection enabled filtering
// Validates: Requirements 2.1.4
// For any set of homepage collections with mixed enabled status, customer queries should return only collections where enabled is true

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Helper to generate valid homepage collection titles
const homepageCollectionTitleArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

// Helper to generate valid homepage collection data
const createHomepageCollectionInputArbitrary = fc.record({
  title: homepageCollectionTitleArbitrary,
  enabled: fc.boolean(),
  sortOrder: fc.integer({ min: 0, max: 1000 }),
});

// Helper to generate valid product names
const productNameArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

// Helper to generate valid product data
const createProductInputArbitrary = fc.record({
  name: productNameArbitrary,
  description: fc.option(fc.string({ maxLength: 5000 }), { nil: null }),
  enabled: fc.boolean(),
});

describe('Homepage Collection Management Properties', () => {
  let homepageCollectionService: HomepageCollectionService;
  let productService: ProductService;

  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
    homepageCollectionService = new HomepageCollectionService(prisma);
    productService = new ProductService(prisma);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up homepage collection-product associations, products, and homepage collections after each test
    await prisma.homepageCollectionProduct.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.homepageCollection.deleteMany({});
  });

  describe('Property 12: Homepage collection product ordering', () => {
    it('should return products sorted by sortOrder in ascending order', async () => {
      await fc.assert(
        fc.asyncProperty(
          createHomepageCollectionInputArbitrary,
          fc.array(
            fc.record({
              productData: createProductInputArbitrary,
              sortOrder: fc.integer({ min: 0, max: 1000 }),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          async (collectionData, productsWithOrder) => {
            // Add unique identifiers to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const uniqueCollectionData = {
              ...collectionData,
              title: `${collectionData.title}-${uniqueId}`,
            };

            // Create a homepage collection
            const createdCollection = await homepageCollectionService.createHomepageCollection(uniqueCollectionData);

            // Create products and add them to the collection with specific sort orders
            const createdProducts = [];
            for (let i = 0; i < productsWithOrder.length; i++) {
              const { productData, sortOrder } = productsWithOrder[i];
              const uniqueProductData = {
                ...productData,
                name: `${productData.name}-${uniqueId}-${i}`,
              };

              // Create product
              const product = await productService.createProduct(uniqueProductData);
              createdProducts.push({ product, sortOrder });

              // Add product to homepage collection with sort order
              await homepageCollectionService.addProductToHomepageCollection(
                createdCollection.id,
                product.id,
                sortOrder
              );
            }

            // Query the homepage collection
            const retrievedCollection = await homepageCollectionService.getHomepageCollection(createdCollection.id);

            // Key assertion: products should be sorted by sortOrder in ascending order
            expect(retrievedCollection).not.toBeNull();
            expect(retrievedCollection?.products).toBeDefined();
            expect(retrievedCollection?.products).toHaveLength(productsWithOrder.length);

            // Extract sort orders from retrieved products
            const retrievedSortOrders = retrievedCollection?.products.map(p => p.sortOrder) || [];

            // Create expected sorted order
            const expectedSortOrders = [...retrievedSortOrders].sort((a, b) => a - b);

            // Verify products are sorted by sortOrder ascending
            expect(retrievedSortOrders).toEqual(expectedSortOrders);

            // Verify each product is present with correct sort order
            for (const { product, sortOrder } of createdProducts) {
              const foundProduct = retrievedCollection?.products.find(p => p.productId === product.id);
              expect(foundProduct).toBeDefined();
              expect(foundProduct?.sortOrder).toBe(sortOrder);
              expect(foundProduct?.product.id).toBe(product.id);
            }

            // Clean up
            await prisma.homepageCollectionProduct.deleteMany({
              where: { collectionId: createdCollection.id },
            });
            for (const { product } of createdProducts) {
              await prisma.product.delete({
                where: { id: product.id },
              });
            }
            await prisma.homepageCollection.delete({
              where: { id: createdCollection.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for 100 iterations
  });

  describe('Property 13: Homepage collection enabled filtering', () => {
    it('should return only enabled homepage collections when filtering by enabled status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              title: homepageCollectionTitleArbitrary,
              enabled: fc.boolean(),
              sortOrder: fc.integer({ min: 0, max: 1000 }),
            }),
            { minLength: 3, maxLength: 10 }
          ),
          async (collectionsData) => {
            // Add unique identifiers to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // Create homepage collections with mixed enabled status
            const createdCollections = [];
            for (let i = 0; i < collectionsData.length; i++) {
              const collectionData = collectionsData[i];
              const uniqueCollectionData = {
                ...collectionData,
                title: `${collectionData.title}-${uniqueId}-${i}`,
              };

              const collection = await homepageCollectionService.createHomepageCollection(uniqueCollectionData);
              createdCollections.push(collection);
            }

            // Query homepage collections with enabled filter set to true
            const enabledCollections = await homepageCollectionService.getHomepageCollections({ enabled: true });

            // Key assertion: only enabled collections should be returned
            expect(enabledCollections).toBeDefined();
            
            // All returned collections should have enabled = true
            for (const collection of enabledCollections) {
              expect(collection.enabled).toBe(true);
            }

            // Count expected enabled collections
            const expectedEnabledCount = createdCollections.filter(c => c.enabled).length;
            
            // Filter to only include collections from this test run
            const testEnabledCollections = enabledCollections.filter(c => 
              createdCollections.some(created => created.id === c.id)
            );
            
            expect(testEnabledCollections).toHaveLength(expectedEnabledCount);

            // Verify each enabled collection from our test is in the results
            for (const collection of createdCollections) {
              if (collection.enabled) {
                const found = testEnabledCollections.find(c => c.id === collection.id);
                expect(found).toBeDefined();
                expect(found?.enabled).toBe(true);
              }
            }

            // Query homepage collections with enabled filter set to false
            const disabledCollections = await homepageCollectionService.getHomepageCollections({ enabled: false });

            // All returned collections should have enabled = false
            for (const collection of disabledCollections) {
              expect(collection.enabled).toBe(false);
            }

            // Count expected disabled collections
            const expectedDisabledCount = createdCollections.filter(c => !c.enabled).length;
            
            // Filter to only include collections from this test run
            const testDisabledCollections = disabledCollections.filter(c => 
              createdCollections.some(created => created.id === c.id)
            );
            
            expect(testDisabledCollections).toHaveLength(expectedDisabledCount);

            // Verify each disabled collection from our test is in the results
            for (const collection of createdCollections) {
              if (!collection.enabled) {
                const found = testDisabledCollections.find(c => c.id === collection.id);
                expect(found).toBeDefined();
                expect(found?.enabled).toBe(false);
              }
            }

            // Clean up
            for (const collection of createdCollections) {
              await prisma.homepageCollection.delete({
                where: { id: collection.id },
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for 100 iterations
  });
});
