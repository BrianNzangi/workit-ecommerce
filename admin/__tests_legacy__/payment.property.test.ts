/**
 * Payment Integration Property-Based Tests
 * Feature: workit-admin-backend
 */

import { PrismaClient, OrderState, PaymentState } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { PaymentService } from '@/lib/services/payment.service';
import { OrderService } from '@/lib/services/order.service';
import { CustomerService } from '@/lib/services/customer.service';
import { ProductService } from '@/lib/services/product.service';
import crypto from 'crypto';

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

describe('Payment Integration Property Tests', () => {
  let paymentService: PaymentService;
  let orderService: OrderService;
  let customerService: CustomerService;
  let productService: ProductService;

  beforeAll(async () => {
    await prisma.$connect();
    paymentService = new PaymentService(prisma);
    orderService = new OrderService(prisma);
    customerService = new CustomerService(prisma);
    productService = new ProductService(prisma);
  });

  afterAll(async () => {
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
   * Property 27: Paystack initialization request
   * Feature: workit-admin-backend, Property 27: Paystack initialization request
   * Validates: Requirements 6.1
   * 
   * For any checkout with valid order data, initiating payment should create a 
   * Paystack initialization request with correct amount and email
   */
  describe('Property 27: Paystack initialization request', () => {
    it(
      'should create Paystack initialization request with correct data',
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

              // Initialize payment
              const paymentInit = await paymentService.initializePayment({
                orderId: order.id,
                email: uniqueEmail,
                amount: order.total,
              });

              // Verify payment initialization response
              expect(paymentInit).toBeDefined();
              expect(paymentInit.authorizationUrl).toBeDefined();
              expect(paymentInit.authorizationUrl).toContain('paystack');
              expect(paymentInit.accessCode).toBeDefined();
              expect(paymentInit.reference).toBeDefined();

              // Verify payment record was created
              const payment = await prisma.payment.findUnique({
                where: { paystackRef: paymentInit.reference },
              });

              expect(payment).not.toBeNull();
              expect(payment?.orderId).toBe(order.id);
              expect(payment?.amount).toBe(order.total);
              expect(payment?.state).toBe(PaymentState.PENDING);
              expect(payment?.method).toBe('paystack');

              // Verify order status was updated to PAYMENT_PENDING
              const updatedOrder = await prisma.order.findUnique({
                where: { id: order.id },
              });

              expect(updatedOrder?.state).toBe(OrderState.PAYMENT_PENDING);
            }
          ),
          { numRuns: 20 } // Reduced runs due to external API calls
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 28: Payment reference storage
   * Feature: workit-admin-backend, Property 28: Payment reference storage
   * Validates: Requirements 6.2
   * 
   * For any Paystack payment response with a reference, the system should store 
   * the reference associated with the order
   */
  describe('Property 28: Payment reference storage', () => {
    it(
      'should store payment reference with order',
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

              // Initialize payment
              const paymentInit = await paymentService.initializePayment({
                orderId: order.id,
                email: uniqueEmail,
                amount: order.total,
              });

              // Verify payment reference is stored and can be retrieved
              const payment = await paymentService.getPaymentByReference(paymentInit.reference);

              expect(payment).not.toBeNull();
              expect(payment?.paystackRef).toBe(paymentInit.reference);
              expect(payment?.orderId).toBe(order.id);

              // Verify payment can also be retrieved by order ID
              const paymentByOrder = await paymentService.getPaymentByOrderId(order.id);

              expect(paymentByOrder).not.toBeNull();
              expect(paymentByOrder?.paystackRef).toBe(paymentInit.reference);
              expect(paymentByOrder?.orderId).toBe(order.id);
            }
          ),
          { numRuns: 20 } // Reduced runs due to external API calls
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 29: Webhook signature verification
   * Feature: workit-admin-backend, Property 29: Webhook signature verification
   * Validates: Requirements 6.3
   * 
   * For any webhook payload, webhooks with valid Paystack signatures should be 
   * processed and webhooks with invalid signatures should be rejected
   */
  describe('Property 29: Webhook signature verification', () => {
    it(
      'should verify webhook signatures correctly',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.record({
              event: fc.constantFrom('charge.success', 'charge.failed'),
              reference: fc.stringMatching(/^[a-z0-9]{10,20}$/),
              status: fc.constantFrom('success', 'failed'),
              amount: priceArbitrary,
              email: emailArbitrary,
            }),
            async (webhookData) => {
              const payload = JSON.stringify({
                event: webhookData.event,
                data: {
                  reference: webhookData.reference,
                  status: webhookData.status,
                  amount: webhookData.amount,
                  customer: {
                    email: webhookData.email,
                  },
                },
              });

              // Generate valid signature
              const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
              const validSignature = crypto
                .createHmac('sha512', secretKey)
                .update(payload)
                .digest('hex');

              // Generate invalid signature
              const invalidSignature = crypto
                .createHmac('sha512', 'wrong-secret')
                .update(payload)
                .digest('hex');

              // Verify valid signature
              const isValidSignatureAccepted = paymentService.verifyWebhookSignature(
                payload,
                validSignature
              );
              expect(isValidSignatureAccepted).toBe(true);

              // Verify invalid signature is rejected
              const isInvalidSignatureRejected = !paymentService.verifyWebhookSignature(
                payload,
                invalidSignature
              );
              expect(isInvalidSignatureRejected).toBe(true);

              // Verify empty signature is rejected
              const isEmptySignatureRejected = !paymentService.verifyWebhookSignature(
                payload,
                ''
              );
              expect(isEmptySignatureRejected).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );
  });

  /**
   * Property 30: Payment confirmation order update
   * Feature: workit-admin-backend, Property 30: Payment confirmation order update
   * Validates: Requirements 6.4
   * 
   * For any order with pending payment, when payment is confirmed, the order state 
   * should transition to PAYMENT_SETTLED and payment details should be recorded
   */
  describe('Property 30: Payment confirmation order update', () => {
    it(
      'should update order status on payment confirmation',
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
            fc.stringMatching(/^[a-z0-9]{10,20}$/), // transaction ID
            async (uuid, email, password, firstName, lastName, lineItem, transactionId) => {
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

              // Initialize payment
              const paymentInit = await paymentService.initializePayment({
                orderId: order.id,
                email: uniqueEmail,
                amount: order.total,
              });

              // Verify order is in PAYMENT_PENDING state
              const orderBeforeConfirmation = await prisma.order.findUnique({
                where: { id: order.id },
              });
              expect(orderBeforeConfirmation?.state).toBe(OrderState.PAYMENT_PENDING);

              // Handle payment confirmation
              const updatedPayment = await paymentService.handlePaymentConfirmation(
                paymentInit.reference,
                transactionId
              );

              // Verify payment state is updated
              expect(updatedPayment.state).toBe(PaymentState.SETTLED);
              expect(updatedPayment.transactionId).toBe(transactionId);

              // Verify order state is updated to PAYMENT_SETTLED
              const orderAfterConfirmation = await prisma.order.findUnique({
                where: { id: order.id },
              });
              expect(orderAfterConfirmation?.state).toBe(OrderState.PAYMENT_SETTLED);

              // Verify updatedAt timestamp was updated
              expect(orderAfterConfirmation?.updatedAt.getTime()).toBeGreaterThan(
                orderBeforeConfirmation!.updatedAt.getTime()
              );
            }
          ),
          { numRuns: 20 } // Reduced runs due to external API calls
        );
      },
      60000 // 60 second timeout
    );
  });

  /**
   * Property 31: Payment failure error recording
   * Feature: workit-admin-backend, Property 31: Payment failure error recording
   * Validates: Requirements 6.5
   * 
   * For any payment that fails, the order state should transition to PAYMENT_PENDING 
   * and the error message should be stored in the payment record
   */
  describe('Property 31: Payment failure error recording', () => {
    it(
      'should record error message on payment failure',
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
            fc.string({ minLength: 5, maxLength: 100 }), // error message
            async (uuid, email, password, firstName, lastName, lineItem, errorMessage) => {
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

              // Initialize payment
              const paymentInit = await paymentService.initializePayment({
                orderId: order.id,
                email: uniqueEmail,
                amount: order.total,
              });

              // Verify order is in PAYMENT_PENDING state
              const orderBeforeFailure = await prisma.order.findUnique({
                where: { id: order.id },
              });
              expect(orderBeforeFailure?.state).toBe(OrderState.PAYMENT_PENDING);

              // Handle payment failure
              const updatedPayment = await paymentService.handlePaymentFailure(
                paymentInit.reference,
                errorMessage
              );

              // Verify payment state is updated to DECLINED
              expect(updatedPayment.state).toBe(PaymentState.DECLINED);
              expect(updatedPayment.errorMessage).toBe(errorMessage);

              // Verify order remains in PAYMENT_PENDING state (to allow retry)
              const orderAfterFailure = await prisma.order.findUnique({
                where: { id: order.id },
              });
              expect(orderAfterFailure?.state).toBe(OrderState.PAYMENT_PENDING);

              // Verify updatedAt timestamp was updated
              expect(orderAfterFailure?.updatedAt.getTime()).toBeGreaterThan(
                orderBeforeFailure!.updatedAt.getTime()
              );

              // Verify payment can be retrieved with error message
              const payment = await paymentService.getPaymentByReference(paymentInit.reference);
              expect(payment?.errorMessage).toBe(errorMessage);
            }
          ),
          { numRuns: 20 } // Reduced runs due to external API calls
        );
      },
      60000 // 60 second timeout
    );
  });
});
