/**
 * Payment Service Refactor Property-Based Tests
 * Feature: fix-paystack-build-errors
 */

import { PrismaClient, OrderState, PaymentState } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { PaymentService } from '@/lib/services/payment.service';
import { OrderService } from '@/lib/services/order.service';
import { CustomerService } from '@/lib/services/customer.service';
import { ProductService } from '@/lib/services/product.service';

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

const priceArbitrary = fc.integer({ min: 100, max: 1000000 }); // In cents

const quantityArbitrary = fc.integer({ min: 1, max: 10 });

describe('Payment Service Refactor Property Tests', () => {
  let paymentService: PaymentService;
  let orderService: OrderService;
  let customerService: CustomerService;
  let productService: ProductService;
  let originalFetch: typeof global.fetch;

  beforeAll(async () => {
    await prisma.$connect();
    paymentService = new PaymentService(prisma);
    orderService = new OrderService(prisma);
    customerService = new CustomerService(prisma);
    productService = new ProductService(prisma);
    originalFetch = global.fetch;
  });

  afterAll(async () => {
    // Restore original fetch
    global.fetch = originalFetch;

    // Clean up all test data before disconnecting
    await prisma.payment.deleteMany({});
    await prisma.orderLine.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Restore original fetch after each test
    global.fetch = originalFetch;

    // Clean up after each test
    try {
      await prisma.payment.deleteMany({});
      await prisma.orderLine.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.address.deleteMany({});
      await prisma.customer.deleteMany({});
      await prisma.productVariant.deleteMany({});
      await prisma.product.deleteMany({});
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  /**
   * Property 1: HTTP requests use fetch with correct authentication
   * Feature: fix-paystack-build-errors, Property 1: HTTP requests use fetch with correct authentication
   * Validates: Requirements 2.1, 5.1, 5.2, 5.3
   * 
   * For any HTTP request made to Paystack's API, the system should use the native fetch API 
   * and include an Authorization header with the Bearer token and Content-Type set to application/json.
   */
  describe('Property 1: HTTP requests use fetch with correct authentication', () => {
    it(
      'should use fetch with correct headers for all Paystack API calls',
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

              // Mock fetch to capture the request
              let capturedUrl: string | undefined;
              let capturedOptions: RequestInit | undefined;

              global.fetch = jest.fn(async (url: string | URL | Request, options?: RequestInit) => {
                capturedUrl = url.toString();
                capturedOptions = options;

                // Return a mock successful response
                return {
                  ok: true,
                  status: 200,
                  json: async () => ({
                    status: true,
                    message: 'Authorization URL created',
                    data: {
                      authorization_url: 'https://checkout.paystack.com/test123',
                      access_code: 'test_access_code',
                      reference: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    },
                  }),
                } as Response;
              }) as jest.Mock;

              // Initialize payment
              await paymentService.initializePayment({
                orderId: order.id,
                email: uniqueEmail,
                amount: order.total,
              });

              // Verify fetch was called
              expect(global.fetch).toHaveBeenCalled();

              // Verify URL is correct
              expect(capturedUrl).toBe('https://api.paystack.co/transaction/initialize');

              // Verify method is POST
              expect(capturedOptions?.method).toBe('POST');

              // Verify Authorization header is present with Bearer token
              const headers = capturedOptions?.headers as Record<string, string>;
              expect(headers).toBeDefined();
              expect(headers['Authorization']).toBeDefined();
              expect(headers['Authorization']).toContain('Bearer');
              expect(headers['Authorization']).toContain(process.env.PAYSTACK_SECRET_KEY);

              // Verify Content-Type is application/json
              expect(headers['Content-Type']).toBe('application/json');

              // Verify body is present and properly formatted
              expect(capturedOptions?.body).toBeDefined();
              const body = JSON.parse(capturedOptions?.body as string);
              expect(body.email).toBe(uniqueEmail);
              expect(body.amount).toBe(order.total);
              expect(body.currency).toBe('KES');
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 2: Successful initialization creates complete payment records
   * Feature: fix-paystack-build-errors, Property 2: Successful initialization creates complete payment records
   * Validates: Requirements 2.2, 2.4, 2.5
   * 
   * For any valid order and successful Paystack response, initializing a payment should create 
   * a payment record with state PENDING, update the order to PAYMENT_PENDING, and return the 
   * authorization URL, access code, and reference.
   */
  describe('Property 2: Successful initialization creates complete payment records', () => {
    it(
      'should create complete payment records on successful initialization',
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
            fc.record({
              authUrl: fc.webUrl(),
              accessCode: fc.stringMatching(/^[a-z0-9]{10,20}$/),
              reference: fc.stringMatching(/^[a-z0-9]{10,20}$/),
            }),
            async (uuid, email, password, firstName, lastName, lineItem, paystackResponse) => {
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

              // Mock fetch to return successful response
              global.fetch = jest.fn(async () => {
                return {
                  ok: true,
                  status: 200,
                  json: async () => ({
                    status: true,
                    message: 'Authorization URL created',
                    data: {
                      authorization_url: paystackResponse.authUrl,
                      access_code: paystackResponse.accessCode,
                      reference: paystackResponse.reference,
                    },
                  }),
                } as Response;
              }) as jest.Mock;

              // Initialize payment
              const result = await paymentService.initializePayment({
                orderId: order.id,
                email: uniqueEmail,
                amount: order.total,
              });

              // Verify return value contains all three fields
              expect(result.authorizationUrl).toBe(paystackResponse.authUrl);
              expect(result.accessCode).toBe(paystackResponse.accessCode);
              expect(result.reference).toBe(paystackResponse.reference);

              // Verify payment record was created with PENDING state
              const payment = await prisma.payment.findUnique({
                where: { paystackRef: paystackResponse.reference },
              });

              expect(payment).not.toBeNull();
              expect(payment?.orderId).toBe(order.id);
              expect(payment?.amount).toBe(order.total);
              expect(payment?.state).toBe(PaymentState.PENDING);
              expect(payment?.method).toBe('paystack');
              expect(payment?.paystackRef).toBe(paystackResponse.reference);

              // Verify order was updated to PAYMENT_PENDING
              const updatedOrder = await prisma.order.findUnique({
                where: { id: order.id },
              });

              expect(updatedOrder?.state).toBe(OrderState.PAYMENT_PENDING);
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 3: HTTP failures throw appropriate errors
   * Feature: fix-paystack-build-errors, Property 3: HTTP failures throw appropriate errors
   * Validates: Requirements 2.3, 5.4
   * 
   * For any failed HTTP request to Paystack or error response from Paystack, the system 
   * should throw an externalServiceError with a descriptive message.
   */
  describe('Property 3: HTTP failures throw appropriate errors', () => {
    it(
      'should throw appropriate errors on HTTP failures',
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
            fc.record({
              statusCode: fc.constantFrom(400, 401, 403, 404, 500, 502, 503),
              errorMessage: fc.string({ minLength: 5, maxLength: 100 }),
            }),
            async (uuid, email, password, firstName, lastName, lineItem, errorResponse) => {
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

              // Mock fetch to return error response
              global.fetch = jest.fn(async () => {
                return {
                  ok: false,
                  status: errorResponse.statusCode,
                  statusText: 'Error',
                  json: async () => ({
                    status: false,
                    message: errorResponse.errorMessage,
                  }),
                } as Response;
              }) as jest.Mock;

              // Initialize payment should throw an error
              await expect(
                paymentService.initializePayment({
                  orderId: order.id,
                  email: uniqueEmail,
                  amount: order.total,
                })
              ).rejects.toThrow();

              // Verify the error is an externalServiceError
              try {
                await paymentService.initializePayment({
                  orderId: order.id,
                  email: uniqueEmail,
                  amount: order.total,
                });
              } catch (error: any) {
                expect(error.extensions?.code).toBe('EXTERNAL_SERVICE_ERROR');
                expect(error.message).toContain('Paystack');
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      60000 // 60 second timeout
    );
  });
});
