import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { ProductService } from '@/lib/services/product.service';

// Feature: workit-admin-backend, Property 5: Product search completeness
// Validates: Requirements 1.5
// For any search term that matches a product's name, SKU, or description, 
// the search results should include that product

// Feature: workit-admin-backend, Property 42: Product search result completeness
// Validates: Requirements 10.2
// For any product search results, each result should include productName, price, image, and slug fields

// Feature: workit-admin-backend, Property 43: Search pagination
// Validates: Requirements 10.3
// For any search query with pagination parameters (take, skip), 
// the results should respect the pagination limits and return the correct page of results

// Feature: workit-admin-backend, Property 44: Search enabled and stock filtering
// Validates: Requirements 10.4
// For any product search, results should only include products where enabled is true 
// and stockOnHand is greater than zero

// Feature: workit-admin-backend, Property 45: Search variant grouping
// Validates: Requirements 10.5
// For any search results containing multiple variants of the same product, 
// the results should be grouped by parent product

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

// Helper to generate valid SKU
const skuArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-'));

// Helper to generate valid variant data
const createVariantInputArbitrary = (productId: string) => fc.record({
  productId: fc.constant(productId),
  name: productNameArbitrary,
  sku: skuArbitrary,
  price: fc.integer({ min: 1, max: 1000000 }), // Price in cents, must be > 0
  stockOnHand: fc.integer({ min: 0, max: 10000 }),
  enabled: fc.boolean(),
});

describe('Product Search Properties', () => {
  let productService: ProductService;

  beforeAll(async () => {
    await prisma.$connect();
    productService = new ProductService(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up products and variants after each test
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
  });

  describe('Property 5: Product search completeness', () => {
    it('should return products matching search term in name, SKU, or description', async () => {
      await fc.assert(
        fc.asyncProperty(
          createProductInputArbitrary,
          fc.constantFrom('name', 'description', 'sku'),
          async (productData, searchField) => {
            // Create a product with a unique searchable term
            const uniqueTerm = `SEARCHTEST${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
            
            // Ensure product is enabled and has stock for search to find it
            let productInput = { 
              ...productData,
              enabled: true, // Override to ensure product is enabled
            };
            if (searchField === 'name') {
              productInput.name = `${productData.name} ${uniqueTerm}`;
            } else if (searchField === 'description') {
              productInput.description = `${productData.description || ''} ${uniqueTerm}`;
            }

            const createdProduct = await productService.createProduct(productInput);

            // Create a variant with stock
            const variantData = await fc.sample(createVariantInputArbitrary(createdProduct.id), 1)[0];
            variantData.enabled = true; // Ensure variant is enabled
            variantData.stockOnHand = Math.max(1, variantData.stockOnHand || 1); // Ensure stock > 0
            
            // If searching by SKU, add the unique term to the SKU
            if (searchField === 'sku') {
              variantData.sku = `${uniqueTerm}-${variantData.sku}`;
            }
            
            const createdVariant = await productService.addVariantToProduct(variantData);

            // Search using the unique term (basic search doesn't filter by enabled/stock)
            const searchResults = await productService.searchProducts(uniqueTerm, {
              includeDeleted: false,
            });

            // Assertions - the product should be in the results
            expect(searchResults.length).toBeGreaterThan(0);
            const foundProduct = searchResults.find(p => p.id === createdProduct.id);
            expect(foundProduct).toBeDefined();
            expect(foundProduct?.id).toBe(createdProduct.id);

            // Clean up
            await prisma.productVariant.delete({ where: { id: createdVariant.id } });
            await prisma.product.delete({ where: { id: createdProduct.id } });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 42: Product search result completeness', () => {
    it('should include name, price, image, and slug in search results', async () => {
      await fc.assert(
        fc.asyncProperty(
          createProductInputArbitrary,
          async (productData) => {
            // Create a product with a unique searchable term
            const uniqueTerm = `RESULTTEST${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
            const productInput = {
              ...productData,
              name: `${productData.name} ${uniqueTerm}`,
              enabled: true, // Ensure product is enabled
            };

            const createdProduct = await productService.createProduct(productInput);

            // Create a variant with stock
            const variantData = await fc.sample(createVariantInputArbitrary(createdProduct.id), 1)[0];
            variantData.enabled = true; // Ensure variant is enabled
            variantData.stockOnHand = Math.max(1, variantData.stockOnHand || 1); // Ensure stock > 0
            const createdVariant = await productService.addVariantToProduct(variantData);

            // Search using the unique term
            const searchResults = await productService.searchProductsEnhanced(uniqueTerm);

            // Assertions - results should include all required fields
            expect(searchResults.length).toBeGreaterThan(0);
            const result = searchResults[0];
            
            expect(result).toHaveProperty('name');
            expect(result.name).toBeTruthy();
            expect(typeof result.name).toBe('string');
            
            expect(result).toHaveProperty('price');
            expect(typeof result.price).toBe('number');
            expect(result.price).toBeGreaterThan(0);
            
            expect(result).toHaveProperty('slug');
            expect(result.slug).toBeTruthy();
            expect(typeof result.slug).toBe('string');
            
            expect(result).toHaveProperty('image');
            // Image can be null if no asset is associated

            // Clean up
            await prisma.productVariant.delete({ where: { id: createdVariant.id } });
            await prisma.product.delete({ where: { id: createdProduct.id } });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 43: Search pagination', () => {
    it('should respect pagination parameters and return correct page of results', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Number of products to create
          fc.integer({ min: 1, max: 3 }), // Page size (take)
          async (numProducts, pageSize) => {
            // Create multiple products with the same search term
            const uniqueTerm = `PAGETEST${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
            const createdProducts = [];
            const createdVariants = [];

            for (let i = 0; i < numProducts; i++) {
              const productInput = {
                name: `Product ${i} ${uniqueTerm}`,
                description: `Description ${i}`,
                enabled: true,
              };
              const product = await productService.createProduct(productInput);
              createdProducts.push(product);

              const variantData = {
                productId: product.id,
                name: `Variant ${i}`,
                sku: `SKU-${uniqueTerm}-${i}`,
                price: 1000 + i,
                stockOnHand: 10,
                enabled: true,
              };
              const variant = await productService.addVariantToProduct(variantData);
              createdVariants.push(variant);
            }

            // Test pagination
            const firstPage = await productService.searchProductsEnhanced(uniqueTerm, {
              take: pageSize,
              skip: 0,
            });

            const secondPage = await productService.searchProductsEnhanced(uniqueTerm, {
              take: pageSize,
              skip: pageSize,
            });

            // Assertions
            expect(firstPage.length).toBeLessThanOrEqual(pageSize);
            expect(secondPage.length).toBeLessThanOrEqual(pageSize);

            // First and second page should not have overlapping results
            const firstPageIds = new Set(firstPage.map(r => r.id));
            const secondPageIds = new Set(secondPage.map(r => r.id));
            const intersection = [...firstPageIds].filter(id => secondPageIds.has(id));
            expect(intersection.length).toBe(0);

            // Total results should match number of products created
            const allResults = await productService.searchProductsEnhanced(uniqueTerm, {
              take: 100,
              skip: 0,
            });
            expect(allResults.length).toBe(numProducts);

            // Clean up
            for (const variant of createdVariants) {
              await prisma.productVariant.delete({ where: { id: variant.id } });
            }
            for (const product of createdProducts) {
              await prisma.product.delete({ where: { id: product.id } });
            }
          }
        ),
        { numRuns: 50 } // Reduced runs due to multiple product creation
      );
    }, 60000); // 60 second timeout
  });

  describe('Property 44: Search enabled and stock filtering', () => {
    it('should only return enabled products with stock when filters are applied', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            enabled: fc.boolean(),
            stockOnHand: fc.integer({ min: 0, max: 100 }),
          }),
          async (variantConfig) => {
            // Create a product with specific enabled/stock configuration
            const uniqueTerm = `FILTERTEST${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
            const productInput = {
              name: `Product ${uniqueTerm}`,
              description: 'Test product',
              enabled: variantConfig.enabled,
            };

            const createdProduct = await productService.createProduct(productInput);

            const variantData = {
              productId: createdProduct.id,
              name: 'Test Variant',
              sku: `SKU-${uniqueTerm}`,
              price: 1000,
              stockOnHand: variantConfig.stockOnHand,
              enabled: variantConfig.enabled,
            };
            const createdVariant = await productService.addVariantToProduct(variantData);

            // Search with filters enabled
            const searchResults = await productService.searchProductsEnhanced(uniqueTerm, {
              enabledOnly: true,
              inStockOnly: true,
            });

            // Assertions
            if (variantConfig.enabled && variantConfig.stockOnHand > 0) {
              // Should be in results
              expect(searchResults.length).toBeGreaterThan(0);
              const found = searchResults.find(r => r.productId === createdProduct.id);
              expect(found).toBeDefined();
              expect(found?.stockOnHand).toBeGreaterThan(0);
            } else {
              // Should NOT be in results
              const found = searchResults.find(r => r.productId === createdProduct.id);
              expect(found).toBeUndefined();
            }

            // Search without filters
            const unfiltered = await productService.searchProductsEnhanced(uniqueTerm, {
              enabledOnly: false,
              inStockOnly: false,
            });

            // Should always be in unfiltered results
            expect(unfiltered.length).toBeGreaterThan(0);
            const foundUnfiltered = unfiltered.find(r => r.productId === createdProduct.id);
            expect(foundUnfiltered).toBeDefined();

            // Clean up
            await prisma.productVariant.delete({ where: { id: createdVariant.id } });
            await prisma.product.delete({ where: { id: createdProduct.id } });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 45: Search variant grouping', () => {
    it('should group multiple variants by parent product when grouping is enabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 4 }), // Number of variants per product
          async (numVariants) => {
            // Create a product with multiple variants
            const uniqueTerm = `GROUPTEST${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
            const productInput = {
              name: `Product ${uniqueTerm}`,
              description: 'Test product',
              enabled: true,
            };

            const createdProduct = await productService.createProduct(productInput);
            const createdVariants = [];

            // Create multiple variants with different prices
            for (let i = 0; i < numVariants; i++) {
              const variantData = {
                productId: createdProduct.id,
                name: `Variant ${i}`,
                sku: `SKU-${uniqueTerm}-${i}`,
                price: 1000 + (i * 100), // Different prices
                stockOnHand: 10,
                enabled: true,
              };
              const variant = await productService.addVariantToProduct(variantData);
              createdVariants.push(variant);
            }

            // Search with grouping enabled
            const groupedResults = await productService.searchProductsEnhanced(uniqueTerm, {
              groupByProduct: true,
            });

            // Search with grouping disabled
            const ungroupedResults = await productService.searchProductsEnhanced(uniqueTerm, {
              groupByProduct: false,
            });

            // Assertions
            // Grouped results should have only 1 result (the product)
            const groupedForProduct = groupedResults.filter(r => r.productId === createdProduct.id);
            expect(groupedForProduct.length).toBe(1);
            
            // Should return the lowest-priced variant
            expect(groupedForProduct[0].price).toBe(1000);

            // Ungrouped results should have all variants
            const ungroupedForProduct = ungroupedResults.filter(r => r.productId === createdProduct.id);
            expect(ungroupedForProduct.length).toBe(numVariants);

            // Clean up
            for (const variant of createdVariants) {
              await prisma.productVariant.delete({ where: { id: variant.id } });
            }
            await prisma.product.delete({ where: { id: createdProduct.id } });
          }
        ),
        { numRuns: 50 } // Reduced runs due to multiple variant creation
      );
    }, 60000); // 60 second timeout
  });
});
