/**
 * Analytics Property-Based Tests
 * Feature: workit-admin-backend
 */

import { PrismaClient, OrderState } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { OrderService } from '@/lib/services/order.service';
import { CustomerService } from '@/lib/services/customer.service';
import { ProductService } from '@/lib/services/product.service';
import { ShippingMethodService } from '@/lib/services/shipping-method.service';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Arbitraries for generating test data
const emailArbitrary = fc
  .tuple(
    fc.stringMatching(/^[a-z0-9]+$/),
    fc.stringMatching(/^[a-z0-9]+$/),
    fc.constantFrom('com', 'org', 'net', 'io')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const passwordArbitrary = fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8);

const nameArbitrary = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

const phoneArbitrary = fc
  .tuple(
    fc.constantFrom('+254', '+1', '+44'),
    fc.stringMatching(/^[0-9]{9,10}$/)
  )
  .map(([code, number]) => `${code}${number}`);

const addressArbitrary = fc.record({
  fullName: nameArbitrary,
  streetLine1: fc.string({ minLength: 5, maxLength: 100 }),
  streetLine2: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
  city: fc.string({ minLength: 2, maxLength: 50 }),
  province: fc.string({ minLength: 2, maxLength: 50 }),
  postalCode: fc.stringMatching(/^[0-9]{5}$/),
  country: fc.constantFrom('KE', 'US', 'GB'),
  phoneNumber: phoneArbitrary,
});

const priceArbitrary = fc.integer({ min: 100, max: 1000000 }); // In cents

const quantityArbitrary = fc.integer({ min: 1, max: 10 });

const taxArbitrary = fc.integer({ min: 0, max: 10000 }); // In cents

const stockThresholdArbitrary = fc.integer({ min: 1, max: 50 });

describe('Analytics Property Tests', () => {
  let analyticsService: AnalyticsService;
  let orderService: OrderService;
  let customerService: CustomerService;
  let productService: ProductService;
  let shippingMethodService: ShippingMethodService;

  beforeAll(async () => {
    await prisma.$connect();
    analyticsService = new AnalyticsService(prisma);
    orderService = new OrderService(prisma);
    customerService = new CustomerService(prisma);
    productService = new ProductService(prisma);
    shippingMethodService = new ShippingMethodService(prisma);
  });

  afterAll(async () => {
    // Clean up all test data before disconnecting
    await prisma.orderLine.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.shippingMethod.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await prisma.orderLine.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.address.deleteMany({});
      await prisma.customer.deleteMany({});
      await prisma.productVariant.deleteMany({});
      await prisma.product.deleteMany({});
      await prisma.shippingMethod.deleteMany({});
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  /**
   * Feature: workit-admin-backend, Property 62: Revenue calculation accuracy
   * Validates: Requirements 15.1
   * 
   * For any time period, the dashboard revenue should equal the sum of all order totals 
   * where order state is PAYMENT_SETTLED and createdAt is within the period
   */
  test('Property 62: Revenue calculation accuracy', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: emailArbitrary,
            password: passwordArbitrary,
            firstName: nameArbitrary,
            lastName: nameArbitrary,
            productName: nameArbitrary,
            skuBase: fc.stringMatching(/^[A-Z0-9]{6,8}$/),
            price: priceArbitrary,
            quantity: quantityArbitrary,
            tax: taxArbitrary,
            state: fc.constantFrom(
              OrderState.PAYMENT_SETTLED,
              OrderState.PAYMENT_PENDING,
              OrderState.CREATED,
              OrderState.CANCELLED
            ),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (orderData) => {
          // Create orders with different states
          const createdOrders = [];
          
          for (let i = 0; i < orderData.length; i++) {
            const data = orderData[i];
            const uniqueSku = `${data.skuBase}-${Date.now()}-${i}`;
            
            // Create customer
            const customer = await customerService.registerCustomer({
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
            });

            // Create product and variant
            const product = await productService.createProduct({
              name: data.productName,
              enabled: true,
            });

            const variant = await productService.addVariantToProduct({
              productId: product.id,
              name: `${data.productName} Variant`,
              sku: uniqueSku,
              price: data.price,
              stockOnHand: 100,
              enabled: true,
            });

            // Create order
            const order = await orderService.createOrder({
              customerId: customer.id,
              lines: [
                {
                  variantId: variant.id,
                  quantity: data.quantity,
                },
              ],
              tax: data.tax,
            });

            // Update order state
            const updatedOrder = await orderService.updateOrderStatus(order.id, data.state);
            createdOrders.push(updatedOrder);
          }

          // Define time period that includes all orders
          const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
          const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

          // Get dashboard stats
          const stats = await analyticsService.getDashboardStats(startDate, endDate);

          // Calculate expected revenue (only PAYMENT_SETTLED orders)
          const expectedRevenue = createdOrders
            .filter((order) => order.state === OrderState.PAYMENT_SETTLED)
            .reduce((sum, order) => sum + order.total, 0);

          // Verify revenue calculation
          expect(stats.totalRevenue).toBe(expectedRevenue);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Feature: workit-admin-backend, Property 63: Order count accuracy
   * Validates: Requirements 15.2
   * 
   * For any time period, the dashboard order count should equal the number of orders 
   * where createdAt is within the period
   */
  test('Property 63: Order count accuracy', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: emailArbitrary,
            password: passwordArbitrary,
            firstName: nameArbitrary,
            lastName: nameArbitrary,
            productName: nameArbitrary,
            skuBase: fc.stringMatching(/^[A-Z0-9]{6,8}$/),
            price: priceArbitrary,
            quantity: quantityArbitrary,
            tax: taxArbitrary,
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (orderData) => {
          // Create orders
          const createdOrders = [];
          
          for (let i = 0; i < orderData.length; i++) {
            const data = orderData[i];
            const uniqueSku = `${data.skuBase}-${Date.now()}-${i}`;
            
            // Create customer
            const customer = await customerService.registerCustomer({
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
            });

            // Create product and variant
            const product = await productService.createProduct({
              name: data.productName,
              enabled: true,
            });

            const variant = await productService.addVariantToProduct({
              productId: product.id,
              name: `${data.productName} Variant`,
              sku: uniqueSku,
              price: data.price,
              stockOnHand: 100,
              enabled: true,
            });

            // Create order
            const order = await orderService.createOrder({
              customerId: customer.id,
              lines: [
                {
                  variantId: variant.id,
                  quantity: data.quantity,
                },
              ],
              tax: data.tax,
            });

            createdOrders.push(order);
          }

          // Define time period that includes all orders
          const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
          const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

          // Get dashboard stats
          const stats = await analyticsService.getDashboardStats(startDate, endDate);

          // Verify order count
          expect(stats.orderCount).toBe(createdOrders.length);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Feature: workit-admin-backend, Property 64: Low stock alert threshold
   * Validates: Requirements 15.4
   * 
   * For any set of product variants, low stock alerts should include all variants 
   * where stockOnHand is below the configured threshold
   */
  test('Property 64: Low stock alert threshold', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            productName: nameArbitrary,
            skuBase: fc.stringMatching(/^[A-Z0-9]{6,8}$/),
            price: priceArbitrary,
            stockOnHand: fc.integer({ min: 0, max: 100 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        stockThresholdArbitrary,
        async (variantData, threshold) => {
          // Create products and variants with different stock levels
          const createdVariants = [];
          
          for (let i = 0; i < variantData.length; i++) {
            const data = variantData[i];
            const uniqueSku = `${data.skuBase}-${Date.now()}-${i}`;
            
            // Create product
            const product = await productService.createProduct({
              name: data.productName,
              enabled: true,
            });

            // Create variant with specific stock level
            const variant = await productService.addVariantToProduct({
              productId: product.id,
              name: `${data.productName} Variant`,
              sku: uniqueSku,
              price: data.price,
              stockOnHand: data.stockOnHand,
              enabled: true,
            });

            createdVariants.push(variant);
          }

          // Get low stock alerts
          const alerts = await analyticsService.getLowStockAlerts(threshold);

          // Calculate expected low stock variants
          const expectedLowStock = createdVariants.filter(
            (v) => v.stockOnHand <= threshold
          );

          // Verify all low stock variants are in alerts
          expect(alerts.length).toBe(expectedLowStock.length);

          // Verify each alert has stock below or equal to threshold
          for (const alert of alerts) {
            expect(alert.stockOnHand).toBeLessThanOrEqual(threshold);
          }

          // Verify all expected variants are present
          const alertIds = new Set(alerts.map((a) => a.id));
          for (const variant of expectedLowStock) {
            expect(alertIds.has(variant.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Feature: workit-admin-backend, Property 65: Top-selling products calculation
   * Validates: Requirements 15.5
   * 
   * For any time period, top-selling products should be ordered by total quantity sold 
   * (sum of order line quantities) in descending order
   */
  test('Property 65: Top-selling products calculation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: emailArbitrary,
            password: passwordArbitrary,
            firstName: nameArbitrary,
            lastName: nameArbitrary,
            productName: nameArbitrary,
            skuBase: fc.stringMatching(/^[A-Z0-9]{6,8}$/),
            price: priceArbitrary,
            quantity: quantityArbitrary,
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (orderData) => {
          // Track expected quantities per product
          const productQuantities = new Map<string, { name: string; quantity: number }>();
          
          for (let i = 0; i < orderData.length; i++) {
            const data = orderData[i];
            const uniqueSku = `${data.skuBase}-${Date.now()}-${i}`;
            
            // Create customer
            const customer = await customerService.registerCustomer({
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
            });

            // Create product and variant
            const product = await productService.createProduct({
              name: data.productName,
              enabled: true,
            });

            const variant = await productService.addVariantToProduct({
              productId: product.id,
              name: `${data.productName} Variant`,
              sku: uniqueSku,
              price: data.price,
              stockOnHand: 100,
              enabled: true,
            });

            // Create order
            await orderService.createOrder({
              customerId: customer.id,
              lines: [
                {
                  variantId: variant.id,
                  quantity: data.quantity,
                },
              ],
            });

            // Track quantities
            if (!productQuantities.has(product.id)) {
              productQuantities.set(product.id, {
                name: product.name,
                quantity: 0,
              });
            }
            const current = productQuantities.get(product.id)!;
            current.quantity += data.quantity;
          }

          // Define time period that includes all orders
          const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
          const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

          // Get top-selling products
          const topProducts = await analyticsService.getTopSellingProducts(
            startDate,
            endDate,
            10
          );

          // Verify products are sorted by quantity in descending order
          for (let i = 0; i < topProducts.length - 1; i++) {
            expect(topProducts[i].totalQuantitySold).toBeGreaterThanOrEqual(
              topProducts[i + 1].totalQuantitySold
            );
          }

          // Verify quantities match expected
          for (const topProduct of topProducts) {
            const expected = productQuantities.get(topProduct.productId);
            if (expected) {
              expect(topProduct.totalQuantitySold).toBe(expected.quantity);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
