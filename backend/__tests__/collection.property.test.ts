import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { CollectionService } from '@/lib/services/collection.service';
import { ProductService } from '@/lib/services/product.service';

// Feature: workit-admin-backend, Property 8: Level 1 collection parent nullability
// Validates: Requirements 2.1
// For any Level 1 collection created without a parent, querying the collection should return parentId as null

// Feature: workit-admin-backend, Property 9: Level 2 collection parent reference
// Validates: Requirements 2.2
// For any Level 2 collection created with a parent, querying the collection should return the correct parentId

// Feature: workit-admin-backend, Property 10: Collection hierarchy preservation
// Validates: Requirements 2.5, 2.7
// For any set of nested collections, querying the parent collection should return all child collections in the children array

// Feature: workit-admin-backend, Property 11: Collection sort order persistence
// Validates: Requirements 2.6
// For any collection with updated sort order, querying the collection should return the new sort order value

// Feature: workit-admin-backend, Property 7: Product-collection association bidirectionality
// Validates: Requirements 1.7
// For any product and collection, after assigning the product to the collection, 
// querying the collection's products should include the product, and querying the 
// product's collections should include the collection

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Helper to generate valid collection names
const collectionNameArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

// Helper to generate valid Level 1 collection data (no parent)
const createLevel1CollectionInputArbitrary = fc.record({
  name: collectionNameArbitrary,
  description: fc.option(fc.string({ maxLength: 5000 }), { nil: null }),
  enabled: fc.boolean(),
  sortOrder: fc.integer({ min: 0, max: 1000 }),
});

// Helper to generate valid Level 2 collection data (with parent)
const createLevel2CollectionInputArbitrary = (parentId: string) => fc.record({
  name: collectionNameArbitrary,
  description: fc.option(fc.string({ maxLength: 5000 }), { nil: null }),
  parentId: fc.constant(parentId),
  enabled: fc.boolean(),
  sortOrder: fc.integer({ min: 0, max: 1000 }),
});

// Helper to generate update collection data
const updateCollectionInputArbitrary = fc.record({
  name: fc.option(collectionNameArbitrary, { nil: undefined }),
  description: fc.option(fc.option(fc.string({ maxLength: 5000 }), { nil: null }), { nil: undefined }),
  enabled: fc.option(fc.boolean(), { nil: undefined }),
  sortOrder: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
});

// Helper to generate valid product names
const productNameArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

// Helper to generate valid product data
const createProductInputArbitrary = fc.record({
  name: productNameArbitrary,
  description: fc.option(fc.string({ maxLength: 5000 }), { nil: null }),
  enabled: fc.boolean(),
});

describe('Collection Management Properties', () => {
  let collectionService: CollectionService;
  let productService: ProductService;

  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
    collectionService = new CollectionService(prisma);
    productService = new ProductService(prisma);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up product-collection associations, products, and collections after each test
    await prisma.productCollection.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.collection.deleteMany({
      where: {
        parentId: { not: null },
      },
    });
    await prisma.collection.deleteMany({
      where: {
        parentId: null,
      },
    });
  });

  describe('Property 8: Level 1 collection parent nullability', () => {
    it('should create Level 1 collections with parentId as null', async () => {
      await fc.assert(
        fc.asyncProperty(createLevel1CollectionInputArbitrary, async (collectionData) => {
          // Create a Level 1 collection (no parent)
          const createdCollection = await collectionService.createCollection(collectionData);

          // Query the collection by ID
          const retrievedCollection = await collectionService.getCollection(createdCollection.id);

          // Assertions
          expect(retrievedCollection).not.toBeNull();
          expect(retrievedCollection?.id).toBe(createdCollection.id);
          expect(retrievedCollection?.name).toBe(collectionData.name.trim());
          expect(retrievedCollection?.slug).toBeTruthy();
          expect(retrievedCollection?.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/); // URL-safe slug
          expect(retrievedCollection?.description).toBe(collectionData.description?.trim() || null);
          expect(retrievedCollection?.parentId).toBeNull(); // Key assertion: parentId should be null
          expect(retrievedCollection?.enabled).toBe(collectionData.enabled ?? true);
          expect(retrievedCollection?.sortOrder).toBe(collectionData.sortOrder ?? 0);
          expect(retrievedCollection?.createdAt).toBeInstanceOf(Date);
          expect(retrievedCollection?.updatedAt).toBeInstanceOf(Date);

          // Clean up this specific collection
          await prisma.collection.delete({
            where: { id: createdCollection.id },
          });
        }),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });
  });

  describe('Property 9: Level 2 collection parent reference', () => {
    it('should create Level 2 collections with correct parentId', async () => {
      await fc.assert(
        fc.asyncProperty(
          createLevel1CollectionInputArbitrary,
          async (parentData) => {
            // Create a Level 1 collection (parent)
            const parentCollection = await collectionService.createCollection(parentData);

            // Generate Level 2 collection data
            const childData = await fc.sample(createLevel2CollectionInputArbitrary(parentCollection.id), 1)[0];

            // Create a Level 2 collection (child)
            const childCollection = await collectionService.createCollection(childData);

            // Query the child collection by ID
            const retrievedChild = await collectionService.getCollection(childCollection.id);

            // Assertions
            expect(retrievedChild).not.toBeNull();
            expect(retrievedChild?.id).toBe(childCollection.id);
            expect(retrievedChild?.name).toBe(childData.name.trim());
            expect(retrievedChild?.slug).toBeTruthy();
            expect(retrievedChild?.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/); // URL-safe slug
            expect(retrievedChild?.description).toBe(childData.description?.trim() || null);
            expect(retrievedChild?.parentId).toBe(parentCollection.id); // Key assertion: parentId should match parent
            expect(retrievedChild?.enabled).toBe(childData.enabled ?? true);
            expect(retrievedChild?.sortOrder).toBe(childData.sortOrder ?? 0);
            expect(retrievedChild?.createdAt).toBeInstanceOf(Date);
            expect(retrievedChild?.updatedAt).toBeInstanceOf(Date);

            // Verify the parent relationship is correctly loaded
            expect(retrievedChild?.parent).not.toBeNull();
            expect(retrievedChild?.parent?.id).toBe(parentCollection.id);
            expect(retrievedChild?.parent?.name).toBe(parentData.name.trim());

            // Clean up (child first, then parent)
            await prisma.collection.delete({
              where: { id: childCollection.id },
            });
            await prisma.collection.delete({
              where: { id: parentCollection.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Collection hierarchy preservation', () => {
    it('should preserve parent-child relationships in collection hierarchy', async () => {
      await fc.assert(
        fc.asyncProperty(
          createLevel1CollectionInputArbitrary,
          fc.array(collectionNameArbitrary, { minLength: 1, maxLength: 5 }),
          async (parentData, childNames) => {
            // Create a Level 1 collection (parent)
            const parentCollection = await collectionService.createCollection(parentData);

            // Create multiple Level 2 collections (children)
            const childCollections = [];
            for (let i = 0; i < childNames.length; i++) {
              const childData = {
                name: childNames[i],
                parentId: parentCollection.id,
                sortOrder: i,
              };
              const child = await collectionService.createCollection(childData);
              childCollections.push(child);
            }

            // Query the parent collection with children
            const retrievedParent = await collectionService.getCollection(parentCollection.id, true);

            // Assertions - verify hierarchy preservation
            expect(retrievedParent).not.toBeNull();
            expect(retrievedParent?.id).toBe(parentCollection.id);
            expect(retrievedParent?.parentId).toBeNull(); // Parent should have no parent
            
            // Key assertion: children array should contain all child collections
            expect(retrievedParent?.children).toBeDefined();
            expect(retrievedParent?.children).toHaveLength(childNames.length);

            // Verify each child is in the children array
            for (const childCollection of childCollections) {
              const foundChild = retrievedParent?.children.find(c => c.id === childCollection.id);
              expect(foundChild).toBeDefined();
              expect(foundChild?.parentId).toBe(parentCollection.id);
              expect(foundChild?.name).toBe(childCollection.name);
            }

            // Verify children are sorted by sortOrder
            const sortOrders = retrievedParent?.children.map(c => c.sortOrder) || [];
            const sortedOrders = [...sortOrders].sort((a, b) => a - b);
            expect(sortOrders).toEqual(sortedOrders);

            // Query each child and verify it has the correct parent reference
            for (const childCollection of childCollections) {
              const retrievedChild = await collectionService.getCollection(childCollection.id, false);
              expect(retrievedChild).not.toBeNull();
              expect(retrievedChild?.parentId).toBe(parentCollection.id);
              expect(retrievedChild?.parent).not.toBeNull();
              expect(retrievedChild?.parent?.id).toBe(parentCollection.id);
            }

            // Clean up (children first, then parent)
            for (const child of childCollections) {
              await prisma.collection.delete({
                where: { id: child.id },
              });
            }
            await prisma.collection.delete({
              where: { id: parentCollection.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for 100 iterations
  });

  describe('Property 11: Collection sort order persistence', () => {
    it('should persist sort order updates correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          createLevel1CollectionInputArbitrary,
          fc.integer({ min: 0, max: 1000 }),
          async (collectionData, newSortOrder) => {
            // Create a collection with initial sort order
            const createdCollection = await collectionService.createCollection(collectionData);
            const originalSortOrder = createdCollection.sortOrder;

            // Update the sort order
            const updatedCollection = await collectionService.updateCollectionSortOrder(
              createdCollection.id,
              newSortOrder
            );

            // Verify the update was applied
            expect(updatedCollection.sortOrder).toBe(newSortOrder);

            // Query the collection to verify persistence
            const retrievedCollection = await collectionService.getCollection(createdCollection.id);

            // Key assertion: sort order should be persisted
            expect(retrievedCollection).not.toBeNull();
            expect(retrievedCollection?.sortOrder).toBe(newSortOrder);

            // Verify other fields remain unchanged
            expect(retrievedCollection?.id).toBe(createdCollection.id);
            expect(retrievedCollection?.name).toBe(createdCollection.name);
            expect(retrievedCollection?.slug).toBe(createdCollection.slug);
            expect(retrievedCollection?.description).toBe(createdCollection.description);
            expect(retrievedCollection?.parentId).toBe(createdCollection.parentId);
            expect(retrievedCollection?.enabled).toBe(createdCollection.enabled);

            // Clean up
            await prisma.collection.delete({
              where: { id: createdCollection.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for 100 iterations
  });

  describe('Property 7: Product-collection association bidirectionality', () => {
    it('should maintain bidirectional product-collection associations', async () => {
      await fc.assert(
        fc.asyncProperty(
          createProductInputArbitrary,
          createLevel1CollectionInputArbitrary,
          fc.integer({ min: 0, max: 100 }),
          async (productData, collectionData, sortOrder) => {
            // Add unique identifiers to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const uniqueProductData = {
              ...productData,
              name: `${productData.name}-${uniqueId}`,
            };
            const uniqueCollectionData = {
              ...collectionData,
              name: `${collectionData.name}-${uniqueId}`,
            };

            // Create a product
            const createdProduct = await productService.createProduct(uniqueProductData);

            // Create a collection
            const createdCollection = await collectionService.createCollection(uniqueCollectionData);

            // Assign the product to the collection
            const productCollection = await collectionService.assignProductToCollection(
              createdProduct.id,
              createdCollection.id,
              sortOrder
            );

            // Verify the association was created
            expect(productCollection).not.toBeNull();
            expect(productCollection.productId).toBe(createdProduct.id);
            expect(productCollection.collectionId).toBe(createdCollection.id);
            expect(productCollection.sortOrder).toBe(sortOrder);

            // Query the collection and verify the product is included
            const collectionWithProducts = await prisma.collection.findUnique({
              where: { id: createdCollection.id },
              include: {
                products: {
                  include: {
                    product: true,
                  },
                },
              },
            });

            // Key assertion: collection's products should include the product
            expect(collectionWithProducts).not.toBeNull();
            expect(collectionWithProducts?.products).toHaveLength(1);
            expect(collectionWithProducts?.products[0].productId).toBe(createdProduct.id);
            expect(collectionWithProducts?.products[0].sortOrder).toBe(sortOrder);
            expect(collectionWithProducts?.products[0].product.id).toBe(createdProduct.id);
            expect(collectionWithProducts?.products[0].product.name).toBe(uniqueProductData.name.trim());

            // Query the product and verify the collection is included
            const productWithCollections = await prisma.product.findUnique({
              where: { id: createdProduct.id },
              include: {
                collections: {
                  include: {
                    collection: true,
                  },
                },
              },
            });

            // Key assertion: product's collections should include the collection
            expect(productWithCollections).not.toBeNull();
            expect(productWithCollections?.collections).toHaveLength(1);
            expect(productWithCollections?.collections[0].collectionId).toBe(createdCollection.id);
            expect(productWithCollections?.collections[0].sortOrder).toBe(sortOrder);
            expect(productWithCollections?.collections[0].collection.id).toBe(createdCollection.id);
            expect(productWithCollections?.collections[0].collection.name).toBe(uniqueCollectionData.name.trim());

            // Clean up
            await prisma.productCollection.delete({
              where: {
                productId_collectionId: {
                  productId: createdProduct.id,
                  collectionId: createdCollection.id,
                },
              },
            });
            await prisma.product.delete({
              where: { id: createdProduct.id },
            });
            await prisma.collection.delete({
              where: { id: createdCollection.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for 100 iterations
  });
});
