import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { ProductService } from '@/lib/services/product.service';

// Feature: workit-admin-backend, Property 1: Product creation persistence
// Validates: Requirements 1.1
// For any valid product data (name, slug, description, enabled status), 
// creating a product and then querying it by ID should return the same data

// Feature: workit-admin-backend, Property 4: Product update persistence with timestamp
// Validates: Requirements 1.4
// For any product and valid update data, updating the product should persist all changes 
// and the updatedAt timestamp should be greater than the original timestamp

// Feature: workit-admin-backend, Property 6: Soft delete isolation
// Validates: Requirements 1.6
// For any product that has been deleted, customer queries should not return that product, 
// but admin queries with includeDeleted flag should return it

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Helper to generate valid product names
const productNameArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

// Helper to generate valid product data
const createProductInputArbitrary = fc.record({
  name: productNameArbitrary,
  description: fc.option(fc.string({ maxLength: 5000 }), { nil: null }),
  enabled: fc.boolean(),
});

// Helper to generate update data
const updateProductInputArbitrary = fc.record({
  name: fc.option(productNameArbitrary, { nil: undefined }),
  description: fc.option(fc.option(fc.string({ maxLength: 5000 }), { nil: null }), { nil: undefined }),
  enabled: fc.option(fc.boolean(), { nil: undefined }),
});

// Helper to generate valid SKU
const skuArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-'));

// Helper to generate valid variant data
const createVariantInputArbitrary = (productId: string) => fc.record({
  productId: fc.constant(productId),
  name: productNameArbitrary,
  sku: skuArbitrary,
  price: fc.integer({ min: 1, max: 1000000 }), // Price in cents (must be positive)
  stockOnHand: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
  enabled: fc.option(fc.boolean(), { nil: undefined }),
});

// Helper to generate update variant data
const updateVariantInputArbitrary = fc.record({
  name: fc.option(productNameArbitrary, { nil: undefined }),
  sku: fc.option(skuArbitrary, { nil: undefined }),
  price: fc.option(fc.integer({ min: 1, max: 1000000 }), { nil: undefined }), // Price must be positive
  stockOnHand: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
  enabled: fc.option(fc.boolean(), { nil: undefined }),
});

describe('Product Management Properties', () => {
  let productService: ProductService;

  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
    productService = new ProductService(prisma);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up products and variants after each test
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
  });

  describe('Property 1: Product creation persistence', () => {
    it('should persist and retrieve product data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(createProductInputArbitrary, async (productData) => {
          // Create the product using the service
          const createdProduct = await productService.createProduct(productData);

          // Query the product by ID using the service
          const retrievedProduct = await productService.getProduct(createdProduct.id);

          // Assertions
          expect(retrievedProduct).not.toBeNull();
          expect(retrievedProduct?.name).toBe(productData.name.trim());
          expect(retrievedProduct?.slug).toBeTruthy();
          expect(retrievedProduct?.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/); // URL-safe slug
          expect(retrievedProduct?.description).toBe(productData.description?.trim() || null);
          expect(retrievedProduct?.enabled).toBe(productData.enabled ?? true);
          expect(retrievedProduct?.deletedAt).toBeNull();
          expect(retrievedProduct?.createdAt).toBeInstanceOf(Date);
          expect(retrievedProduct?.updatedAt).toBeInstanceOf(Date);

          // Clean up this specific product
          await prisma.product.delete({
            where: { id: createdProduct.id },
          });
        }),
        { numRuns: 100 } // Run 100 iterations as specified in the design
      );
    });
  });

  describe('Property 4: Product update persistence with timestamp', () => {
    it('should persist updates and update timestamp correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          createProductInputArbitrary,
          updateProductInputArbitrary,
          async (initialData, updateData) => {
            // Skip if update data is empty
            if (
              updateData.name === undefined &&
              updateData.description === undefined &&
              updateData.enabled === undefined
            ) {
              return true;
            }

            // Create initial product
            const createdProduct = await productService.createProduct(initialData);
            const originalUpdatedAt = createdProduct.updatedAt;

            // Wait a tiny bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));

            // Update the product
            const updatedProduct = await productService.updateProduct(
              createdProduct.id,
              updateData
            );

            // Query the product to verify persistence
            const retrievedProduct = await productService.getProduct(createdProduct.id);

            // Assertions
            expect(retrievedProduct).not.toBeNull();
            
            // Check that specified fields were updated
            if (updateData.name !== undefined) {
              expect(retrievedProduct?.name).toBe(updateData.name.trim());
            } else {
              expect(retrievedProduct?.name).toBe(initialData.name.trim());
            }

            if (updateData.description !== undefined) {
              expect(retrievedProduct?.description).toBe(updateData.description?.trim() || null);
            } else {
              expect(retrievedProduct?.description).toBe(initialData.description?.trim() || null);
            }

            if (updateData.enabled !== undefined) {
              expect(retrievedProduct?.enabled).toBe(updateData.enabled);
            } else {
              expect(retrievedProduct?.enabled).toBe(initialData.enabled ?? true);
            }

            // Check that updatedAt timestamp was updated
            expect(retrievedProduct?.updatedAt.getTime()).toBeGreaterThan(
              originalUpdatedAt.getTime()
            );

            // Clean up
            await prisma.product.delete({
              where: { id: createdProduct.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Soft delete isolation', () => {
    it('should hide deleted products from customer queries but show in admin queries', async () => {
      await fc.assert(
        fc.asyncProperty(createProductInputArbitrary, async (productData) => {
          // Create a product
          const createdProduct = await productService.createProduct(productData);

          // Verify product is visible without includeDeleted flag (customer query)
          const beforeDelete = await productService.getProduct(createdProduct.id, false);
          expect(beforeDelete).not.toBeNull();

          // Soft delete the product
          await productService.deleteProduct(createdProduct.id);

          // Verify product is NOT visible without includeDeleted flag (customer query)
          const afterDeleteCustomer = await productService.getProduct(createdProduct.id, false);
          expect(afterDeleteCustomer).toBeNull();

          // Verify product IS visible with includeDeleted flag (admin query)
          const afterDeleteAdmin = await productService.getProduct(createdProduct.id, true);
          expect(afterDeleteAdmin).not.toBeNull();
          expect(afterDeleteAdmin?.id).toBe(createdProduct.id);
          expect(afterDeleteAdmin?.deletedAt).not.toBeNull();
          expect(afterDeleteAdmin?.deletedAt).toBeInstanceOf(Date);

          // Clean up
          await prisma.product.delete({
            where: { id: createdProduct.id },
          });
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: workit-admin-backend, Property 2: Variant storage completeness
  // Validates: Requirements 1.2
  // For any valid variant data (SKU, price, stock, options), adding a variant to a product 
  // and then querying the product should include the variant with all fields intact
  describe('Property 2: Variant storage completeness', () => {
    it('should persist and retrieve variant data with all fields intact', async () => {
      await fc.assert(
        fc.asyncProperty(
          createProductInputArbitrary,
          async (productData) => {
            // Create a product first
            const createdProduct = await productService.createProduct(productData);

            // Generate variant data for this product
            const variantData = await fc.sample(createVariantInputArbitrary(createdProduct.id), 1)[0];

            // Add variant to the product
            const createdVariant = await productService.addVariantToProduct(variantData);

            // Query the variant directly
            const retrievedVariant = await productService.getVariant(createdVariant.id);

            // Assertions - verify all fields are intact
            expect(retrievedVariant).not.toBeNull();
            expect(retrievedVariant?.id).toBe(createdVariant.id);
            expect(retrievedVariant?.productId).toBe(createdProduct.id);
            expect(retrievedVariant?.name).toBe(variantData.name.trim());
            expect(retrievedVariant?.sku).toBe(variantData.sku.trim());
            expect(retrievedVariant?.price).toBe(variantData.price);
            expect(retrievedVariant?.stockOnHand).toBe(variantData.stockOnHand ?? 0);
            expect(retrievedVariant?.enabled).toBe(variantData.enabled ?? true);
            expect(retrievedVariant?.createdAt).toBeInstanceOf(Date);
            expect(retrievedVariant?.updatedAt).toBeInstanceOf(Date);

            // Query the product and verify variant is included
            const productWithVariants = await prisma.product.findUnique({
              where: { id: createdProduct.id },
              include: { variants: true },
            });

            expect(productWithVariants?.variants).toHaveLength(1);
            expect(productWithVariants?.variants[0].id).toBe(createdVariant.id);
            expect(productWithVariants?.variants[0].sku).toBe(variantData.sku.trim());

            // Clean up
            await prisma.productVariant.delete({
              where: { id: createdVariant.id },
            });
            await prisma.product.delete({
              where: { id: createdProduct.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: workit-admin-backend, Property 46: Stock quantity update persistence
  // Validates: Requirements 11.1
  // For any product variant and new stock quantity, updating the stock should persist the new value
  describe('Property 46: Stock quantity update persistence', () => {
    it('should persist stock quantity updates correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          createProductInputArbitrary,
          fc.integer({ min: 0, max: 10000 }),
          async (productData, newStockQuantity) => {
            // Create a product first
            const createdProduct = await productService.createProduct(productData);

            // Generate and create a variant
            const variantData = await fc.sample(createVariantInputArbitrary(createdProduct.id), 1)[0];
            const createdVariant = await productService.addVariantToProduct(variantData);

            const originalStock = createdVariant.stockOnHand;

            // Update the stock quantity
            const updatedVariant = await productService.updateVariantStock(
              createdVariant.id,
              newStockQuantity
            );

            // Verify the update was applied
            expect(updatedVariant.stockOnHand).toBe(newStockQuantity);

            // Query the variant to verify persistence
            const retrievedVariant = await productService.getVariant(createdVariant.id);

            // Assertions
            expect(retrievedVariant).not.toBeNull();
            expect(retrievedVariant?.stockOnHand).toBe(newStockQuantity);
            
            // Verify other fields remain unchanged
            expect(retrievedVariant?.id).toBe(createdVariant.id);
            expect(retrievedVariant?.name).toBe(createdVariant.name);
            expect(retrievedVariant?.sku).toBe(createdVariant.sku);
            expect(retrievedVariant?.price).toBe(createdVariant.price);
            expect(retrievedVariant?.enabled).toBe(createdVariant.enabled);

            // Clean up
            await prisma.productVariant.delete({
              where: { id: createdVariant.id },
            });
            await prisma.product.delete({
              where: { id: createdProduct.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: workit-admin-backend, Property 3: Product-asset association integrity
  // Validates: Requirements 1.3
  // For any product and asset, after associating the asset with the product, 
  // querying the product should include the asset in its assets list
  describe('Property 3: Product-asset association integrity', () => {
    it('should maintain bidirectional product-asset associations', async () => {
      await fc.assert(
        fc.asyncProperty(
          createProductInputArbitrary,
          fc.record({
            sortOrder: fc.integer({ min: 0, max: 100 }),
            featured: fc.boolean(),
          }),
          async (productData, assetOptions) => {
            // Create a product
            const createdProduct = await productService.createProduct(productData);

            // Create a mock asset (we'll create it directly in the database for testing)
            const createdAsset = await prisma.asset.create({
              data: {
                name: `test-asset-${Date.now()}.jpg`,
                type: 'IMAGE',
                mimeType: 'image/jpeg',
                fileSize: 1024,
                source: `https://example.com/test-${Date.now()}.jpg`,
                preview: `https://example.com/test-${Date.now()}-thumb.jpg`,
                width: 800,
                height: 600,
              },
            });

            // Associate the asset with the product
            const productAsset = await productService.addAssetToProduct(
              createdProduct.id,
              createdAsset.id,
              assetOptions.sortOrder,
              assetOptions.featured
            );

            // Verify the association was created
            expect(productAsset).not.toBeNull();
            expect(productAsset.productId).toBe(createdProduct.id);
            expect(productAsset.assetId).toBe(createdAsset.id);
            expect(productAsset.sortOrder).toBe(assetOptions.sortOrder);
            expect(productAsset.featured).toBe(assetOptions.featured);

            // Query the product and verify the asset is included
            const productWithAssets = await prisma.product.findUnique({
              where: { id: createdProduct.id },
              include: {
                assets: {
                  include: {
                    asset: true,
                  },
                },
              },
            });

            // Assertions - verify bidirectional association
            expect(productWithAssets).not.toBeNull();
            expect(productWithAssets?.assets).toHaveLength(1);
            expect(productWithAssets?.assets[0].assetId).toBe(createdAsset.id);
            expect(productWithAssets?.assets[0].sortOrder).toBe(assetOptions.sortOrder);
            expect(productWithAssets?.assets[0].featured).toBe(assetOptions.featured);
            expect(productWithAssets?.assets[0].asset.id).toBe(createdAsset.id);
            expect(productWithAssets?.assets[0].asset.name).toBe(createdAsset.name);

            // Query the asset and verify the product association exists
            const assetWithProducts = await prisma.asset.findUnique({
              where: { id: createdAsset.id },
              include: {
                products: true,
              },
            });

            expect(assetWithProducts).not.toBeNull();
            expect(assetWithProducts?.products).toHaveLength(1);
            expect(assetWithProducts?.products[0].productId).toBe(createdProduct.id);

            // Clean up
            await prisma.productAsset.delete({
              where: {
                productId_assetId: {
                  productId: createdProduct.id,
                  assetId: createdAsset.id,
                },
              },
            });
            await prisma.asset.delete({
              where: { id: createdAsset.id },
            });
            await prisma.product.delete({
              where: { id: createdProduct.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for 100 iterations
  });
});
