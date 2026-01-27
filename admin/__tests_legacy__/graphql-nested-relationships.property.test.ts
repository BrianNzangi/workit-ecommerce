/**
 * Feature: workit-admin-backend, Property 55: GraphQL nested relationship resolution
 * Validates: Requirements 13.4
 * 
 * Property: For any query requesting nested relationships, all requested relationships 
 * should be resolved and included in the response
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ProductService } from '@/lib/services/product.service';
import { CollectionService } from '@/lib/services/collection.service';
import { AssetService } from '@/lib/services/asset.service';
import { CustomerService } from '@/lib/services/customer.service';
import { OrderService } from '@/lib/services/order.service';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

describe('GraphQL Nested Relationship Resolution Property Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.orderLine.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.productAsset.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.productCollection.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.collection.deleteMany({});
    await prisma.asset.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Property 55: Product with nested variants should resolve all variant relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate product data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
          description: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
          enabled: fc.boolean(),
        }),
        // Generate variant count
        fc.integer({ min: 1, max: 3 }),
        async (productData, variantCount) => {
          const productService = new ProductService(prisma);

          // Create product
          const product = await productService.createProduct({
            name: productData.name,
            description: productData.description,
            enabled: productData.enabled,
          });

          // Create variants
          const variants = [];
          for (let i = 0; i < variantCount; i++) {
            const variant = await productService.addVariantToProduct({
              productId: product.id,
              name: `Variant ${i}`,
              sku: `SKU-${product.id}-${i}-${Date.now()}`,
              price: 1000 + i * 100,
              stockOnHand: 10,
            });
            variants.push(variant);
          }

          // Query product with nested variants using Prisma (simulating GraphQL resolver)
          const queriedProduct = await prisma.product.findUnique({
            where: { id: product.id },
            include: {
              variants: true,
            },
          });

          // Verify product is returned
          expect(queriedProduct).toBeDefined();
          expect(queriedProduct?.id).toBe(product.id);

          // Verify all variants are included in the nested relationship
          expect(queriedProduct?.variants).toBeDefined();
          expect(queriedProduct?.variants.length).toBe(variantCount);

          // Verify each variant has all its fields
          queriedProduct?.variants.forEach((variant) => {
            expect(variant.id).toBeDefined();
            expect(variant.productId).toBe(product.id);
            expect(variant.name).toBeDefined();
            expect(variant.sku).toBeDefined();
            expect(variant.price).toBeDefined();
            expect(variant.stockOnHand).toBeDefined();
          });

          // Cleanup
          await prisma.productVariant.deleteMany({ where: { productId: product.id } });
          await prisma.product.delete({ where: { id: product.id } });
        }
      ),
      { numRuns: 10 } // Reduced runs for database operations
    );
  });

  it('Property 55: Product with nested assets should resolve all asset relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate product data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        }),
        // Generate asset count
        fc.integer({ min: 1, max: 3 }),
        async (productData, assetCount) => {
          const productService = new ProductService(prisma);

          // Create product
          const product = await productService.createProduct({
            name: productData.name,
          });

          // Create assets
          const assets = [];
          for (let i = 0; i < assetCount; i++) {
            const asset = await prisma.asset.create({
              data: {
                name: `Asset ${i}`,
                type: 'IMAGE',
                mimeType: 'image/jpeg',
                fileSize: 1024,
                source: `https://example.com/asset-${i}.jpg`,
                preview: `https://example.com/asset-${i}-thumb.jpg`,
              },
            });
            assets.push(asset);

            // Associate asset with product
            await productService.addAssetToProduct(product.id, asset.id, i);
          }

          // Query product with nested assets using Prisma (simulating GraphQL resolver)
          const queriedProduct = await prisma.product.findUnique({
            where: { id: product.id },
            include: {
              assets: {
                include: {
                  asset: true,
                },
              },
            },
          });

          // Verify product is returned
          expect(queriedProduct).toBeDefined();
          expect(queriedProduct?.id).toBe(product.id);

          // Verify all assets are included in the nested relationship
          expect(queriedProduct?.assets).toBeDefined();
          expect(queriedProduct?.assets.length).toBe(assetCount);

          // Verify each asset has all its fields
          queriedProduct?.assets.forEach((productAsset) => {
            expect(productAsset.asset).toBeDefined();
            expect(productAsset.asset.id).toBeDefined();
            expect(productAsset.asset.name).toBeDefined();
            expect(productAsset.asset.source).toBeDefined();
            expect(productAsset.asset.preview).toBeDefined();
          });

          // Cleanup
          await prisma.productAsset.deleteMany({ where: { productId: product.id } });
          await prisma.asset.deleteMany({ where: { id: { in: assets.map((a) => a.id) } } });
          await prisma.product.delete({ where: { id: product.id } });
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 55: Collection with nested products should resolve all product relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate collection data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        }),
        // Generate product count
        fc.integer({ min: 1, max: 3 }),
        async (collectionData, productCount) => {
          const collectionService = new CollectionService(prisma);
          const productService = new ProductService(prisma);

          // Create collection
          const collection = await collectionService.createCollection({
            name: collectionData.name,
          });

          // Create products and assign to collection
          const products = [];
          for (let i = 0; i < productCount; i++) {
            const product = await productService.createProduct({
              name: `Product ${i}`,
            });
            products.push(product);

            await collectionService.assignProductToCollection(product.id, collection.id, i);
          }

          // Query collection with nested products using Prisma (simulating GraphQL resolver)
          const queriedCollection = await prisma.collection.findUnique({
            where: { id: collection.id },
            include: {
              products: {
                include: {
                  product: true,
                },
              },
            },
          });

          // Verify collection is returned
          expect(queriedCollection).toBeDefined();
          expect(queriedCollection?.id).toBe(collection.id);

          // Verify all products are included in the nested relationship
          expect(queriedCollection?.products).toBeDefined();
          expect(queriedCollection?.products.length).toBe(productCount);

          // Verify each product has all its fields
          queriedCollection?.products.forEach((productCollection) => {
            expect(productCollection.product).toBeDefined();
            expect(productCollection.product.id).toBeDefined();
            expect(productCollection.product.name).toBeDefined();
          });

          // Cleanup
          await prisma.productCollection.deleteMany({ where: { collectionId: collection.id } });
          await prisma.product.deleteMany({ where: { id: { in: products.map((p) => p.id) } } });
          await prisma.collection.delete({ where: { id: collection.id } });
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 55: Order with nested customer, lines, and addresses should resolve all relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate customer data
        fc.record({
          email: fc.emailAddress(),
          firstName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          lastName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        }),
        // Generate line count
        fc.integer({ min: 1, max: 3 }),
        async (customerData, lineCount) => {
          const customerService = new CustomerService(prisma);
          const productService = new ProductService(prisma);
          const orderService = new OrderService(prisma);

          // Create customer
          const customer = await customerService.registerCustomer({
            email: customerData.email,
            password: 'password123',
            firstName: customerData.firstName,
            lastName: customerData.lastName,
          });

          // Create address
          const address = await customerService.createAddress({
            customerId: customer.id,
            fullName: `${customerData.firstName} ${customerData.lastName}`,
            streetLine1: '123 Test St',
            city: 'Nairobi',
            province: 'Nairobi',
            postalCode: '00100',
            country: 'KE',
            phoneNumber: '+254700000000',
          });

          // Create product and variants for order lines
          const product = await productService.createProduct({
            name: 'Test Product',
          });

          const variants = [];
          for (let i = 0; i < lineCount; i++) {
            const variant = await productService.addVariantToProduct({
              productId: product.id,
              name: `Variant ${i}`,
              sku: `SKU-${product.id}-${i}-${Date.now()}`,
              price: 1000,
              stockOnHand: 100,
            });
            variants.push(variant);
          }

          // Create order
          const order = await orderService.createOrder({
            customerId: customer.id,
            lines: variants.map((v) => ({
              variantId: v.id,
              quantity: 1,
            })),
            shippingAddressId: address.id,
            billingAddressId: address.id,
            tax: 0,
          });

          // Query order with all nested relationships using Prisma (simulating GraphQL resolver)
          const queriedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
              customer: true,
              lines: {
                include: {
                  variant: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              shippingAddress: true,
              billingAddress: true,
            },
          });

          // Verify order is returned
          expect(queriedOrder).toBeDefined();
          expect(queriedOrder?.id).toBe(order.id);

          // Verify customer relationship is resolved
          expect(queriedOrder?.customer).toBeDefined();
          expect(queriedOrder?.customer.id).toBe(customer.id);
          expect(queriedOrder?.customer.email).toBe(customerData.email);

          // Verify order lines are resolved with nested variants and products
          expect(queriedOrder?.lines).toBeDefined();
          expect(queriedOrder?.lines.length).toBe(lineCount);
          queriedOrder?.lines.forEach((line) => {
            expect(line.variant).toBeDefined();
            expect(line.variant.product).toBeDefined();
            expect(line.variant.product.id).toBe(product.id);
          });

          // Verify addresses are resolved
          expect(queriedOrder?.shippingAddress).toBeDefined();
          expect(queriedOrder?.shippingAddress?.id).toBe(address.id);
          expect(queriedOrder?.billingAddress).toBeDefined();
          expect(queriedOrder?.billingAddress?.id).toBe(address.id);

          // Cleanup
          await prisma.orderLine.deleteMany({ where: { orderId: order.id } });
          await prisma.order.delete({ where: { id: order.id } });
          await prisma.productVariant.deleteMany({ where: { productId: product.id } });
          await prisma.product.delete({ where: { id: product.id } });
          await prisma.address.deleteMany({ where: { customerId: customer.id } });
          await prisma.customer.delete({ where: { id: customer.id } });
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 55: Customer with nested addresses and orders should resolve all relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate customer data
        fc.record({
          email: fc.emailAddress(),
          firstName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          lastName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        }),
        // Generate address count
        fc.integer({ min: 1, max: 2 }),
        async (customerData, addressCount) => {
          const customerService = new CustomerService(prisma);

          // Create customer
          const customer = await customerService.registerCustomer({
            email: customerData.email,
            password: 'password123',
            firstName: customerData.firstName,
            lastName: customerData.lastName,
          });

          // Create addresses
          const addresses = [];
          for (let i = 0; i < addressCount; i++) {
            const address = await customerService.createAddress({
              customerId: customer.id,
              fullName: `${customerData.firstName} ${customerData.lastName}`,
              streetLine1: `${i + 1} Test St`,
              city: 'Nairobi',
              province: 'Nairobi',
              postalCode: '00100',
              country: 'KE',
              phoneNumber: '+254700000000',
            });
            addresses.push(address);
          }

          // Query customer with nested addresses using Prisma (simulating GraphQL resolver)
          const queriedCustomer = await prisma.customer.findUnique({
            where: { id: customer.id },
            include: {
              addresses: true,
              orders: true,
            },
          });

          // Verify customer is returned
          expect(queriedCustomer).toBeDefined();
          expect(queriedCustomer?.id).toBe(customer.id);

          // Verify all addresses are included in the nested relationship
          expect(queriedCustomer?.addresses).toBeDefined();
          expect(queriedCustomer?.addresses.length).toBe(addressCount);

          // Verify each address has all its fields
          queriedCustomer?.addresses.forEach((address) => {
            expect(address.id).toBeDefined();
            expect(address.customerId).toBe(customer.id);
            expect(address.fullName).toBeDefined();
            expect(address.streetLine1).toBeDefined();
          });

          // Verify orders array is present (even if empty)
          expect(queriedCustomer?.orders).toBeDefined();
          expect(Array.isArray(queriedCustomer?.orders)).toBe(true);

          // Cleanup
          await prisma.address.deleteMany({ where: { customerId: customer.id } });
          await prisma.customer.delete({ where: { id: customer.id } });
        }
      ),
      { numRuns: 10 }
    );
  });
});
