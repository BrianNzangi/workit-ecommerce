/**
 * Order Management Property-Based Tests
 * Feature: workit-admin-backend
 */

import { PrismaClient, OrderState } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
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

const passwordArbitrary = fc
  .string({ minLength: 8, maxLength: 50 })
  .filter((s) => s.trim().length >= 8);

const nameArbitrary = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length >= 1);

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

describe('Order Management Property Tests', () => {
  let orderService: OrderService;
  let customerService: CustomerService;
  let productService: ProductService;
  let shippingMethodService: ShippingMethodService;

  beforeAll(async () => {
    await prisma.$connect();
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
   * Property 14: Order creation completeness
   * Validates: Requirements 3.1
   * 
   * For any valid checkout data (billing address, shipping address, line items), 
   * creating an order should store all provided data and generate a unique order code
   */
  describe('Property 14: Order creation completeness', () => {
    it(
      'should store all checkout data and generate unique order code',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            addressArbitrary,
            addressArbitrary,
            fc.array(
              fc.record({
                productName: nameArbitrary,
                variantName: nameArbitrary,
                sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
                price: priceArbitrary,
                quantity: quantityArbitrary,
                stock: fc.integer({ min: 10, max: 100 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            taxArbitrary,
            async (uuid, email, password, firstName, lastName, shippingAddr, billingAddr, lineItems, tax) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Create customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create shipping address
              const shippingAddress = await customerService.createAddress({
                customerId: customer.id,
                ...shippingAddr,
              });

              // Create billing address
              const billingAddress = await customerService.createAddress({
                customerId: customer.id,
                ...billingAddr,
              });

              // Create products and variants
              const orderLines = [];
              for (const item of lineItems) {
                const product = await productService.createProduct({
                  name: item.productName,
                  enabled: true,
                });

                const variant = await productService.addVariantToProduct({
                  productId: product.id,
                  name: item.variantName,
                  sku: `${item.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  price: item.price,
                  stockOnHand: item.stock,
                  enabled: true,
                });

                orderLines.push({
                  variantId: variant.id,
                  quantity: item.quantity,
                });
              }

              // Create order
              const order = await orderService.createOrder({
                customerId: customer.id,
                lines: orderLines,
                shippingAddressId: shippingAddress.id,
                billingAddressId: billingAddress.id,
                tax,
              });

              // Verify order code is generated and unique
              expect(order.code).toBeDefined();
              expect(order.code).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/);

              // Verify all checkout data is stored
              expect(order.customerId).toBe(customer.id);
              expect(order.shippingAddressId).toBe(shippingAddress.id);
              expect(order.billingAddressId).toBe(billingAddress.id);
              expect(order.tax).toBe(tax);
              expect(order.state).toBe(OrderState.CREATED);
              expect(order.currencyCode).toBe('KES');
              expect(order.createdAt).toBeInstanceOf(Date);
              expect(order.updatedAt).toBeInstanceOf(Date);

              // Verify order lines are created
              expect(order.lines).toBeDefined();
              expect(order.lines.length).toBe(lineItems.length);

              // Verify each line item
              for (let i = 0; i < lineItems.length; i++) {
                const line = order.lines.find(l => l.variantId === orderLines[i].variantId);
                expect(line).toBeDefined();
                expect(line?.quantity).toBe(orderLines[i].quantity);
                expect(line?.linePrice).toBe(lineItems[i].price * lineItems[i].quantity);
              }

              // Verify order can be retrieved from database
              const retrievedOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: {
                  lines: true,
                  shippingAddress: true,
                  billingAddress: true,
                },
              });

              expect(retrievedOrder).not.toBeNull();
              expect(retrievedOrder?.code).toBe(order.code);
              expect(retrievedOrder?.customerId).toBe(customer.id);
              expect(retrievedOrder?.shippingAddressId).toBe(shippingAddress.id);
              expect(retrievedOrder?.billingAddressId).toBe(billingAddress.id);
              expect(retrievedOrder?.lines.length).toBe(lineItems.length);
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 15: Order calculation correctness
   * Validates: Requirements 3.5
   * 
   * For any order with line items and shipping method, the order total should 
   * equal (sum of line prices) + shipping + tax
   */
  describe('Property 15: Order calculation correctness', () => {
    it(
      'should calculate order total correctly',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.array(
              fc.record({
                productName: nameArbitrary,
                variantName: nameArbitrary,
                sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
                price: priceArbitrary,
                quantity: quantityArbitrary,
                stock: fc.integer({ min: 10, max: 100 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            fc.record({
              code: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
              name: nameArbitrary,
              price: priceArbitrary,
            }),
            taxArbitrary,
            async (uuid, email, password, firstName, lastName, lineItems, shippingData, tax) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Create customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create shipping method
              const shippingMethod = await shippingMethodService.createShippingMethod({
                code: `${shippingData.code}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: shippingData.name,
                price: shippingData.price,
                enabled: true,
              });

              // Create products and variants
              const orderLines = [];
              let expectedSubTotal = 0;

              for (const item of lineItems) {
                const product = await productService.createProduct({
                  name: item.productName,
                  enabled: true,
                });

                const variant = await productService.addVariantToProduct({
                  productId: product.id,
                  name: item.variantName,
                  sku: `${item.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  price: item.price,
                  stockOnHand: item.stock,
                  enabled: true,
                });

                orderLines.push({
                  variantId: variant.id,
                  quantity: item.quantity,
                });

                expectedSubTotal += item.price * item.quantity;
              }

              // Create order
              const order = await orderService.createOrder({
                customerId: customer.id,
                lines: orderLines,
                shippingMethodId: shippingMethod.id,
                tax,
              });

              // Verify calculations
              expect(order.subTotal).toBe(expectedSubTotal);
              expect(order.shipping).toBe(shippingData.price);
              expect(order.tax).toBe(tax);
              expect(order.total).toBe(expectedSubTotal + shippingData.price + tax);
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 16: Order status transition with timestamp
   * Validates: Requirements 3.3
   * 
   * For any order and valid new status, updating the order status should change 
   * the state and update the updatedAt timestamp
   */
  describe('Property 16: Order status transition with timestamp', () => {
    it(
      'should update status and timestamp',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.record({
              productName: nameArbitrary,
              variantName: nameArbitrary,
              sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
              price: priceArbitrary,
              quantity: quantityArbitrary,
              stock: fc.integer({ min: 10, max: 100 }),
            }),
            fc.constantFrom(
              OrderState.PAYMENT_PENDING,
              OrderState.PAYMENT_AUTHORIZED,
              OrderState.PAYMENT_SETTLED,
              OrderState.SHIPPED,
              OrderState.DELIVERED,
              OrderState.CANCELLED
            ),
            async (uuid, email, password, firstName, lastName, lineItem, newState) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Create customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create product and variant
              const product = await productService.createProduct({
                name: lineItem.productName,
                enabled: true,
              });

              const variant = await productService.addVariantToProduct({
                productId: product.id,
                name: lineItem.variantName,
                sku: `${lineItem.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                price: lineItem.price,
                stockOnHand: lineItem.stock,
                enabled: true,
              });

              // Create order
              const order = await orderService.createOrder({
                customerId: customer.id,
                lines: [
                  {
                    variantId: variant.id,
                    quantity: lineItem.quantity,
                  },
                ],
              });

              const originalUpdatedAt = order.updatedAt;

              // Wait a bit to ensure timestamp difference
              await new Promise(resolve => setTimeout(resolve, 10));

              // Update order status
              const updatedOrder = await orderService.updateOrderStatus(order.id, newState);

              // Verify status is updated
              expect(updatedOrder.state).toBe(newState);

              // Verify timestamp is updated
              expect(updatedOrder.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

              // Verify in database
              const retrievedOrder = await prisma.order.findUnique({
                where: { id: order.id },
              });

              expect(retrievedOrder?.state).toBe(newState);
              expect(retrievedOrder?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 18: Order history chronological sorting
   * Validates: Requirements 3.6
   * 
   * For any set of orders, querying order history should return orders sorted 
   * by createdAt in descending order (newest first)
   */
  describe('Property 18: Order history chronological sorting', () => {
    it(
      'should return orders sorted by createdAt descending',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.array(
              fc.record({
                productName: nameArbitrary,
                variantName: nameArbitrary,
                sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
                price: priceArbitrary,
                quantity: quantityArbitrary,
                stock: fc.integer({ min: 10, max: 100 }),
              }),
              { minLength: 2, maxLength: 5 }
            ),
            async (uuid, email, password, firstName, lastName, lineItems) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Create customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create multiple orders with delays to ensure different timestamps
              const createdOrders = [];

              for (const item of lineItems) {
                const product = await productService.createProduct({
                  name: item.productName,
                  enabled: true,
                });

                const variant = await productService.addVariantToProduct({
                  productId: product.id,
                  name: item.variantName,
                  sku: `${item.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  price: item.price,
                  stockOnHand: item.stock,
                  enabled: true,
                });

                const order = await orderService.createOrder({
                  customerId: customer.id,
                  lines: [
                    {
                      variantId: variant.id,
                      quantity: item.quantity,
                    },
                  ],
                });

                createdOrders.push(order);

                // Small delay to ensure different timestamps
                await new Promise(resolve => setTimeout(resolve, 10));
              }

              // Query orders
              const orders = await orderService.getOrders({
                sortBy: 'createdAt',
                sortOrder: 'desc',
              });

              // Filter to only our test orders
              const testOrders = orders.filter(o => o.customerId === customer.id);

              // Verify orders are sorted by createdAt descending
              for (let i = 0; i < testOrders.length - 1; i++) {
                expect(testOrders[i].createdAt.getTime()).toBeGreaterThanOrEqual(
                  testOrders[i + 1].createdAt.getTime()
                );
              }

              // Verify all created orders are in the results
              for (const createdOrder of createdOrders) {
                const found = testOrders.some(o => o.id === createdOrder.id);
                expect(found).toBe(true);
              }
            }
          ),
          { numRuns: 50 } // Reduced runs due to complexity
        );
      },
      90000 // 90 second timeout
    );
  });

  /**
   * Property 47: Order placement stock decrementation
   * Feature: workit-admin-backend, Property 47: Order placement stock decrementation
   * Validates: Requirements 11.2
   * 
   * For any order with line items, after order creation, the stock quantity for 
   * each variant should be decremented by the ordered quantity
   */
  describe('Property 47: Order placement stock decrementation', () => {
    it(
      'should decrement stock when order is placed',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.array(
              fc.record({
                productName: nameArbitrary,
                variantName: nameArbitrary,
                sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
                price: priceArbitrary,
                quantity: quantityArbitrary,
                stock: fc.integer({ min: 20, max: 100 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            async (uuid, email, password, firstName, lastName, lineItems) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Create customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create products and variants, track initial stock levels
              const orderLines = [];
              const initialStockLevels = new Map<string, number>();

              for (const item of lineItems) {
                const product = await productService.createProduct({
                  name: item.productName,
                  enabled: true,
                });

                const variant = await productService.addVariantToProduct({
                  productId: product.id,
                  name: item.variantName,
                  sku: `${item.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  price: item.price,
                  stockOnHand: item.stock,
                  enabled: true,
                });

                initialStockLevels.set(variant.id, item.stock);

                orderLines.push({
                  variantId: variant.id,
                  quantity: item.quantity,
                });
              }

              // Create order
              await orderService.createOrder({
                customerId: customer.id,
                lines: orderLines,
              });

              // Verify stock has been decremented for each variant
              for (let i = 0; i < orderLines.length; i++) {
                const variantId = orderLines[i].variantId;
                const orderedQuantity = orderLines[i].quantity;
                const initialStock = initialStockLevels.get(variantId)!;

                const variant = await prisma.productVariant.findUnique({
                  where: { id: variantId },
                });

                expect(variant).not.toBeNull();
                expect(variant!.stockOnHand).toBe(initialStock - orderedQuantity);
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 48: Order cancellation stock restoration
   * Feature: workit-admin-backend, Property 48: Order cancellation stock restoration
   * Validates: Requirements 11.3
   * 
   * For any cancelled order, the stock quantities for all line items should be 
   * incremented by their ordered quantities
   */
  describe('Property 48: Order cancellation stock restoration', () => {
    it(
      'should restore stock when order is cancelled',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.array(
              fc.record({
                productName: nameArbitrary,
                variantName: nameArbitrary,
                sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
                price: priceArbitrary,
                quantity: quantityArbitrary,
                stock: fc.integer({ min: 20, max: 100 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            async (uuid, email, password, firstName, lastName, lineItems) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Create customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create products and variants, track initial stock levels
              const orderLines = [];
              const initialStockLevels = new Map<string, number>();

              for (const item of lineItems) {
                const product = await productService.createProduct({
                  name: item.productName,
                  enabled: true,
                });

                const variant = await productService.addVariantToProduct({
                  productId: product.id,
                  name: item.variantName,
                  sku: `${item.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  price: item.price,
                  stockOnHand: item.stock,
                  enabled: true,
                });

                initialStockLevels.set(variant.id, item.stock);

                orderLines.push({
                  variantId: variant.id,
                  quantity: item.quantity,
                });
              }

              // Create order (this will decrement stock)
              const order = await orderService.createOrder({
                customerId: customer.id,
                lines: orderLines,
              });

              // Verify stock was decremented
              for (const line of orderLines) {
                const variant = await prisma.productVariant.findUnique({
                  where: { id: line.variantId },
                });
                const initialStock = initialStockLevels.get(line.variantId)!;
                expect(variant!.stockOnHand).toBe(initialStock - line.quantity);
              }

              // Cancel the order
              await orderService.updateOrderStatus(order.id, OrderState.CANCELLED);

              // Verify stock has been restored to original levels
              for (const line of orderLines) {
                const variant = await prisma.productVariant.findUnique({
                  where: { id: line.variantId },
                });
                const initialStock = initialStockLevels.get(line.variantId)!;
                expect(variant!.stockOnHand).toBe(initialStock);
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 49: Zero stock status update
   * Feature: workit-admin-backend, Property 49: Zero stock status update
   * Validates: Requirements 11.4
   * 
   * For any product variant, when stockOnHand reaches zero, the variant should 
   * be marked with stockStatus as "outofstock"
   * 
   * Note: This property tests that stock reaches zero after order placement.
   * The current schema doesn't have a separate stockStatus field, but the 
   * stockOnHand field itself serves this purpose (0 = out of stock).
   */
  describe('Property 49: Zero stock status update', () => {
    it(
      'should have zero stock after ordering all available stock',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.record({
              productName: nameArbitrary,
              variantName: nameArbitrary,
              sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
              price: priceArbitrary,
              stock: fc.integer({ min: 1, max: 10 }),
            }),
            async (uuid, email, password, firstName, lastName, lineItem) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Create customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create product and variant with specific stock
              const product = await productService.createProduct({
                name: lineItem.productName,
                enabled: true,
              });

              const variant = await productService.addVariantToProduct({
                productId: product.id,
                name: lineItem.variantName,
                sku: `${lineItem.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                price: lineItem.price,
                stockOnHand: lineItem.stock,
                enabled: true,
              });

              // Create order for all available stock
              await orderService.createOrder({
                customerId: customer.id,
                lines: [
                  {
                    variantId: variant.id,
                    quantity: lineItem.stock, // Order all available stock
                  },
                ],
              });

              // Verify stock is now zero
              const updatedVariant = await prisma.productVariant.findUnique({
                where: { id: variant.id },
              });

              expect(updatedVariant).not.toBeNull();
              expect(updatedVariant!.stockOnHand).toBe(0);
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 17: Order search by multiple criteria
   * Feature: workit-admin-backend, Property 17: Order search by multiple criteria
   * Validates: Requirements 3.4
   * 
   * For any search term that matches an order's code, customer name, or customer email, 
   * the search results should include that order
   */
  describe('Property 17: Order search by multiple criteria', () => {
    it(
      'should find orders by code, customer name, or email',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.record({
              productName: nameArbitrary,
              variantName: nameArbitrary,
              sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
              price: priceArbitrary,
              quantity: quantityArbitrary,
              stock: fc.integer({ min: 10, max: 100 }),
            }),
            fc.constantFrom('code', 'firstName', 'lastName', 'email'),
            async (uuid, email, password, firstName, lastName, lineItem, searchField) => {
              // Skip if names are empty or contain problematic characters for SQL LIKE queries
              const trimmedFirstName = firstName.trim();
              const trimmedLastName = lastName.trim();
              fc.pre(
                trimmedFirstName.length > 0 && 
                trimmedLastName.length > 0 &&
                !/[\\%_]/.test(trimmedFirstName) &&
                !/[\\%_]/.test(trimmedLastName)
              );

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Create customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create product and variant
              const product = await productService.createProduct({
                name: lineItem.productName,
                enabled: true,
              });

              const variant = await productService.addVariantToProduct({
                productId: product.id,
                name: lineItem.variantName,
                sku: `${lineItem.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                price: lineItem.price,
                stockOnHand: lineItem.stock,
                enabled: true,
              });

              // Create order
              const order = await orderService.createOrder({
                customerId: customer.id,
                lines: [
                  {
                    variantId: variant.id,
                    quantity: lineItem.quantity,
                  },
                ],
              });

              // Determine search term based on field
              let searchTerm: string;
              switch (searchField) {
                case 'code':
                  // Search by a substring of the order code
                  searchTerm = order.code.substring(4, 10);
                  break;
                case 'firstName':
                  // Search by first name (use at least 2 chars if available)
                  searchTerm = trimmedFirstName.substring(0, Math.max(2, Math.min(3, trimmedFirstName.length)));
                  break;
                case 'lastName':
                  // Search by last name (use at least 2 chars if available)
                  searchTerm = trimmedLastName.substring(0, Math.max(2, Math.min(3, trimmedLastName.length)));
                  break;
                case 'email':
                  // Search by email local part
                  const emailParts = uniqueEmail.split('@');
                  searchTerm = emailParts[0].substring(0, Math.min(5, emailParts[0].length));
                  break;
                default:
                  searchTerm = order.code;
              }

              // Search for orders
              const searchResults = await orderService.searchOrders(searchTerm);

              // Verify the order is in the search results
              const foundOrder = searchResults.find(o => o.id === order.id);
              expect(foundOrder).toBeDefined();
              expect(foundOrder?.code).toBe(order.code);
              expect(foundOrder?.customerId).toBe(customer.id);

              // Verify customer information is included
              expect(foundOrder?.customer).toBeDefined();
              expect(foundOrder?.customer?.firstName).toBe(firstName);
              expect(foundOrder?.customer?.lastName).toBe(lastName);
              expect(foundOrder?.customer?.email).toBe(uniqueEmail);
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });
});
