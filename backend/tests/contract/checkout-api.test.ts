/**
 * Contract tests for the checkout API.
 *
 * These tests verify that the DDD presentation layer adapter produces
 * responses that conform to the same schema as the legacy backend API.
 * They test the response shape, not the business logic (which is covered
 * by integration and equivalence tests).
 *
 * API contract:
 *   POST /checkout/initiate  → { orderId: string, code: string, total: number }
 *   POST /checkout/verify    → { message: string, orderId: string, tracking: {...} }
 *
 * Requirements: 18.4
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceOrderService } from '../../src/application/order-management/services/PlaceOrderService.js';
import { VerifyPaymentService } from '../../src/application/order-management/services/VerifyPaymentService.js';
import { PaymentVerificationService } from '../../src/domain/order-management/services/PaymentVerificationService.js';
import { PricingService } from '../../src/domain/order-management/services/PricingService.js';
import { Cart } from '../../src/domain/order-management/aggregates/Cart.js';
import { Order } from '../../src/domain/order-management/aggregates/Order.js';
import { OrderLine } from '../../src/domain/order-management/entities/OrderLine.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';
import { OrderCode } from '../../src/domain/order-management/value-objects/OrderCode.js';
import { ICartRepository } from '../../src/domain/order-management/repositories/ICartRepository.js';
import { IOrderRepository } from '../../src/domain/order-management/repositories/IOrderRepository.js';
import { IEventBus } from '../../src/application/shared/IEventBus.js';
import { IUnitOfWork } from '../../src/application/shared/IUnitOfWork.js';

// ─── Response schema validators ───────────────────────────────────────────────

/**
 * Validates the shape of a POST /checkout/initiate success response.
 * Must match the legacy backend response schema.
 */
function validateInitiateResponse(response: unknown): void {
  expect(response).toBeDefined();
  expect(typeof response).toBe('object');
  const r = response as Record<string, unknown>;

  // orderId: string (UUID)
  expect(typeof r.orderId).toBe('string');
  expect(r.orderId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );

  // code: string matching ORD-XXXXXX-XXX format
  expect(typeof r.code).toBe('string');
  expect(r.code).toMatch(/^ORD-\d{6}-\d{3}$/);

  // total: number (non-negative)
  expect(typeof r.total).toBe('number');
  expect(r.total).toBeGreaterThanOrEqual(0);
}

/**
 * Validates the shape of a POST /checkout/verify success response.
 * Must match the legacy backend response schema.
 */
function validateVerifyResponse(response: unknown): void {
  expect(response).toBeDefined();
  expect(typeof response).toBe('object');
  const r = response as Record<string, unknown>;

  // message: string
  expect(typeof r.message).toBe('string');
  expect((r.message as string).length).toBeGreaterThan(0);

  // orderId: string
  expect(typeof r.orderId).toBe('string');

  // tracking: object with required fields
  expect(typeof r.tracking).toBe('object');
  const tracking = r.tracking as Record<string, unknown>;
  expect(typeof tracking.orderId).toBe('string');
  expect(typeof tracking.code).toBe('string');
  expect(typeof tracking.total).toBe('number');
  expect(typeof tracking.currencyCode).toBe('string');
  expect(typeof tracking.customerId).toBe('string');
}

// ─── Mock factories ───────────────────────────────────────────────────────────

function makeCart(): Cart {
  const cart = Cart.create({ id: 'cart-1', customerId: 'customer-1' });
  cart.addLine({ id: 'line-1', productId: 'product-1', quantity: 2 });
  return cart;
}

function makeUnitOfWork(): IUnitOfWork {
  return {
    transaction: vi.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
  };
}

function makeEventBus(): IEventBus {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(),
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Checkout API contract', () => {
  // ─── POST /checkout/initiate ───────────────────────────────────────────────

  describe('POST /checkout/initiate', () => {
    it('should return a response conforming to the initiate contract schema', async () => {
      const savedOrders: Order[] = [];
      const orderRepo: IOrderRepository = {
        findById: vi.fn().mockResolvedValue(null),
        findByCode: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue([]),
        save: vi.fn().mockImplementation(async (o: Order) => savedOrders.push(o)),
      };

      const cartRepo: ICartRepository = {
        findById: vi.fn().mockResolvedValue(makeCart()),
        findByCustomerId: vi.fn().mockResolvedValue(makeCart()),
        findByGuestId: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
        delete: vi.fn(),
      };

      const productProvider = {
        getProductsByIds: vi.fn().mockResolvedValue(
          new Map([
            [
              'product-1',
              { id: 'product-1', name: 'Test Product', price: 1500, stockOnHand: 10, enabled: true },
            ],
          ]),
        ),
        reserveStock: vi.fn().mockResolvedValue(undefined),
      };

      const campaignProvider = {
        findByCouponCode: vi.fn().mockResolvedValue(null),
        recordRedemption: vi.fn(),
        getCustomerUsageCount: vi.fn().mockResolvedValue(0),
      };

      const service = new PlaceOrderService(
        cartRepo,
        orderRepo,
        productProvider,
        campaignProvider,
        new PricingService(),
        makeEventBus(),
        makeUnitOfWork(),
      );

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        currencyCode: 'KES',
      });

      // The presentation layer would return { orderId, code, total }
      const response = {
        orderId: result.orderId,
        code: result.code,
        total: result.total,
      };

      validateInitiateResponse(response);
    });

    it('should return orderId as a valid UUID', async () => {
      const orderRepo: IOrderRepository = {
        findById: vi.fn().mockResolvedValue(null),
        findByCode: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
      };

      const cartRepo: ICartRepository = {
        findById: vi.fn().mockResolvedValue(makeCart()),
        findByCustomerId: vi.fn().mockResolvedValue(makeCart()),
        findByGuestId: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
        delete: vi.fn(),
      };

      const productProvider = {
        getProductsByIds: vi.fn().mockResolvedValue(
          new Map([
            [
              'product-1',
              { id: 'product-1', name: 'Test Product', price: 1000, stockOnHand: 5, enabled: true },
            ],
          ]),
        ),
        reserveStock: vi.fn().mockResolvedValue(undefined),
      };

      const service = new PlaceOrderService(
        cartRepo,
        orderRepo,
        productProvider,
        { findByCouponCode: vi.fn().mockResolvedValue(null), recordRedemption: vi.fn(), getCustomerUsageCount: vi.fn().mockResolvedValue(0) },
        new PricingService(),
        makeEventBus(),
        makeUnitOfWork(),
      );

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        currencyCode: 'KES',
      });

      // UUID v4 format
      expect(result.orderId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should return total as a non-negative number', async () => {
      const orderRepo: IOrderRepository = {
        findById: vi.fn().mockResolvedValue(null),
        findByCode: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
      };

      const cartRepo: ICartRepository = {
        findById: vi.fn().mockResolvedValue(makeCart()),
        findByCustomerId: vi.fn().mockResolvedValue(makeCart()),
        findByGuestId: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
        delete: vi.fn(),
      };

      const productProvider = {
        getProductsByIds: vi.fn().mockResolvedValue(
          new Map([
            [
              'product-1',
              { id: 'product-1', name: 'Test Product', price: 500, stockOnHand: 5, enabled: true },
            ],
          ]),
        ),
        reserveStock: vi.fn().mockResolvedValue(undefined),
      };

      const service = new PlaceOrderService(
        cartRepo,
        orderRepo,
        productProvider,
        { findByCouponCode: vi.fn().mockResolvedValue(null), recordRedemption: vi.fn(), getCustomerUsageCount: vi.fn().mockResolvedValue(0) },
        new PricingService(),
        makeEventBus(),
        makeUnitOfWork(),
      );

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        currencyCode: 'KES',
      });

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(result.total)).toBe(true);
    });
  });

  // ─── POST /checkout/verify ─────────────────────────────────────────────────

  describe('POST /checkout/verify', () => {
    function makeOrderForVerify(total = 3200): Order {
      const line = OrderLine.create({
        id: 'line-1',
        orderId: 'order-1',
        productId: 'product-1',
        productName: 'Test Product',
        quantity: 1,
        unitPrice: Money.create(total, 'KES'),
      });

      return Order.create({
        id: 'order-1',
        code: OrderCode.create('ORD-123456-789'),
        customerId: 'customer-1',
        lines: [line],
        subTotal: Money.create(total, 'KES'),
        shipping: Money.create(0, 'KES'),
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
        total: Money.create(total, 'KES'),
        shippingAddressId: 'addr-1',
        billingAddressId: 'addr-2',
      });
    }

    it('should return a response conforming to the verify contract schema', async () => {
      const order = makeOrderForVerify(3200);
      const orderRepo: IOrderRepository = {
        findById: vi.fn().mockResolvedValue(order),
        findByCode: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
      };

      const cartRepo: ICartRepository = {
        findById: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue(null),
        findByGuestId: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
        delete: vi.fn(),
      };

      const paystackClient = {
        verifyTransaction: vi.fn().mockResolvedValue({
          status: 'success',
          amount: 3200 * 100,
          currency: 'KES',
          reference: 'ref-abc123',
          id: 'txn-123',
        }),
      };

      const service = new VerifyPaymentService(
        orderRepo,
        cartRepo,
        new PaymentVerificationService(paystackClient),
        makeEventBus(),
        makeUnitOfWork(),
      );

      const result = await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      // The presentation layer would return { message, orderId, tracking }
      const response = {
        message: result.message,
        orderId: result.orderId,
        tracking: result.tracking,
      };

      validateVerifyResponse(response);
    });

    it('should return message "Order verified" on success', async () => {
      const order = makeOrderForVerify(1000);
      const orderRepo: IOrderRepository = {
        findById: vi.fn().mockResolvedValue(order),
        findByCode: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
      };

      const cartRepo: ICartRepository = {
        findById: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue(null),
        findByGuestId: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
        delete: vi.fn(),
      };

      const paystackClient = {
        verifyTransaction: vi.fn().mockResolvedValue({
          status: 'success',
          amount: 1000 * 100,
          currency: 'KES',
          reference: 'ref-abc123',
          id: 'txn-123',
        }),
      };

      const service = new VerifyPaymentService(
        orderRepo,
        cartRepo,
        new PaymentVerificationService(paystackClient),
        makeEventBus(),
        makeUnitOfWork(),
      );

      const result = await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(result.message).toBe('Order verified');
    });

    it('should return message "Order already verified" for idempotent calls', async () => {
      const settledOrder = Order.reconstitute({
        id: 'order-1',
        code: OrderCode.create('ORD-123456-789'),
        customerId: 'customer-1',
        state: 'PAYMENT_SETTLED',
        lines: [
          OrderLine.create({
            id: 'line-1',
            orderId: 'order-1',
            productId: 'product-1',
            productName: 'Test Product',
            quantity: 1,
            unitPrice: Money.create(1000, 'KES'),
          }),
        ],
        subTotal: Money.create(1000, 'KES'),
        shipping: Money.create(0, 'KES'),
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
        total: Money.create(1000, 'KES'),
        currencyCode: 'KES',
        shippingAddressId: 'addr-1',
        billingAddressId: 'addr-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const orderRepo: IOrderRepository = {
        findById: vi.fn().mockResolvedValue(settledOrder),
        findByCode: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
      };

      const cartRepo: ICartRepository = {
        findById: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue(null),
        findByGuestId: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
        delete: vi.fn(),
      };

      const service = new VerifyPaymentService(
        orderRepo,
        cartRepo,
        new PaymentVerificationService({ verifyTransaction: vi.fn() }),
        makeEventBus(),
        makeUnitOfWork(),
      );

      const result = await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(result.message).toBe('Order already verified');
      validateVerifyResponse({
        message: result.message,
        orderId: result.orderId,
        tracking: result.tracking,
      });
    });

    it('should include tracking.code in ORD-XXXXXX-XXX format', async () => {
      const order = makeOrderForVerify(500);
      const orderRepo: IOrderRepository = {
        findById: vi.fn().mockResolvedValue(order),
        findByCode: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
      };

      const cartRepo: ICartRepository = {
        findById: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue(null),
        findByGuestId: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
        delete: vi.fn(),
      };

      const paystackClient = {
        verifyTransaction: vi.fn().mockResolvedValue({
          status: 'success',
          amount: 500 * 100,
          currency: 'KES',
          reference: 'ref-abc123',
          id: 'txn-123',
        }),
      };

      const service = new VerifyPaymentService(
        orderRepo,
        cartRepo,
        new PaymentVerificationService(paystackClient),
        makeEventBus(),
        makeUnitOfWork(),
      );

      const result = await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(result.tracking.code).toMatch(/^ORD-\d{6}-\d{3}$/);
    });
  });
});
