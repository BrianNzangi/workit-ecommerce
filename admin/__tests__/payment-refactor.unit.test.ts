/**
 * Payment Service Refactor Unit Tests
 * Feature: fix-paystack-build-errors
 */

import { PrismaClient, OrderState, PaymentState } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
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

describe('Payment Service Refactor Unit Tests', () => {
  let paymentService: PaymentService;
  let orderService: OrderService;
  let customerService: CustomerService;
  let productService: ProductService;
  let originalFetch: typeof global.fetch;
  let originalEnv: string | undefined;

  beforeAll(async () => {
    await prisma.$connect();
    orderService = new OrderService(prisma);
    customerService = new CustomerService(prisma);
    productService = new ProductService(prisma);
    originalFetch = global.fetch;
    originalEnv = process.env.PAYSTACK_SECRET_KEY;
  });

  afterAll(async () => {
    // Restore original fetch and env
    global.fetch = originalFetch;
    if (originalEnv) {
      process.env.PAYSTACK_SECRET_KEY = originalEnv;
    }

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
    if (originalEnv) {
      process.env.PAYSTACK_SECRET_KEY = originalEnv;
    }

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
   * Test missing secret key throws error on instantiation
   * Validates: Requirements 5.5
   */
  describe('Missing secret key', () => {
    it('should throw error when PAYSTACK_SECRET_KEY is not set', () => {
      // Remove the secret key
      delete process.env.PAYSTACK_SECRET_KEY;

      // Attempt to instantiate PaymentService
      expect(() => {
        new PaymentService(prisma);
      }).toThrow('PAYSTACK_SECRET_KEY environment variable is not set');

      // Restore the secret key
      if (originalEnv) {
        process.env.PAYSTACK_SECRET_KEY = originalEnv;
      }
    });
  });

  /**
   * Test successful payment initialization with mocked fetch
   * Validates: Requirements 2.1
   */
  describe('Successful payment initialization', () => {
    it('should initialize payment successfully with mocked fetch', async () => {
      paymentService = new PaymentService(prisma);

      // Create test data
      const customer = await customerService.registerCustomer({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      const product = await productService.createProduct({
        name: 'Test Product',
        enabled: true,
      });

      const variant = await productService.addVariantToProduct({
        productId: product.id,
        name: 'Test Variant',
        sku: `SKU-${Date.now()}`,
        price: 10000,
        stockOnHand: 100,
        enabled: true,
      });

      const order = await orderService.createOrder({
        customerId: customer.id,
        lines: [
          {
            variantId: variant.id,
            quantity: 2,
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
              authorization_url: 'https://checkout.paystack.com/test123',
              access_code: 'test_access_code',
              reference: `ref_${Date.now()}`,
            },
          }),
        } as Response;
      }) as jest.Mock;

      // Initialize payment
      const result = await paymentService.initializePayment({
        orderId: order.id,
        email: customer.email,
        amount: order.total,
      });

      // Verify result
      expect(result).toBeDefined();
      expect(result.authorizationUrl).toBe('https://checkout.paystack.com/test123');
      expect(result.accessCode).toBe('test_access_code');
      expect(result.reference).toContain('ref_');

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();

      // Verify payment record was created
      const payment = await prisma.payment.findUnique({
        where: { paystackRef: result.reference },
      });

      expect(payment).not.toBeNull();
      expect(payment?.state).toBe(PaymentState.PENDING);

      // Verify order was updated
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });

      expect(updatedOrder?.state).toBe(OrderState.PAYMENT_PENDING);
    });
  });

  /**
   * Test failed payment initialization with mocked fetch
   * Validates: Requirements 2.3
   */
  describe('Failed payment initialization', () => {
    it('should throw error when fetch returns error response', async () => {
      paymentService = new PaymentService(prisma);

      // Create test data
      const customer = await customerService.registerCustomer({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      const product = await productService.createProduct({
        name: 'Test Product',
        enabled: true,
      });

      const variant = await productService.addVariantToProduct({
        productId: product.id,
        name: 'Test Variant',
        sku: `SKU-${Date.now()}`,
        price: 10000,
        stockOnHand: 100,
        enabled: true,
      });

      const order = await orderService.createOrder({
        customerId: customer.id,
        lines: [
          {
            variantId: variant.id,
            quantity: 2,
          },
        ],
      });

      // Mock fetch to return error response
      global.fetch = jest.fn(async () => {
        return {
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({
            status: false,
            message: 'Invalid request',
          }),
        } as Response;
      }) as jest.Mock;

      // Initialize payment should throw
      await expect(
        paymentService.initializePayment({
          orderId: order.id,
          email: customer.email,
          amount: order.total,
        })
      ).rejects.toThrow();

      // Verify the error is an externalServiceError
      try {
        await paymentService.initializePayment({
          orderId: order.id,
          email: customer.email,
          amount: order.total,
        });
      } catch (error: any) {
        expect(error.extensions?.code).toBe('EXTERNAL_SERVICE_ERROR');
        expect(error.message).toContain('Paystack');
      }
    });
  });
});
