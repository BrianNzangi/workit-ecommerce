/**
 * Equivalence tests for the checkout flow.
 *
 * These tests verify that the DDD implementation (PlaceOrderService +
 * VerifyPaymentService) produces the same business outcomes as the legacy
 * Transaction Script implementation for the same inputs.
 *
 * We test the core business logic (pricing, state transitions, event raising)
 * rather than HTTP responses, since both implementations share the same
 * database schema and API contract.
 *
 * Requirements: 20.6
 */
import { describe, it, expect, vi } from 'vitest';
import { PlaceOrderService } from '../../src/application/order-management/services/PlaceOrderService.js';
import { VerifyPaymentService } from '../../src/application/order-management/services/VerifyPaymentService.js';
import { PaymentVerificationService } from '../../src/domain/order-management/services/PaymentVerificationService.js';
import { PricingService } from '../../src/domain/order-management/services/PricingService.js';
import { Cart } from '../../src/domain/order-management/aggregates/Cart.js';
import { Order } from '../../src/domain/order-management/aggregates/Order.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';
import { OrderCode } from '../../src/domain/order-management/value-objects/OrderCode.js';
import { OrderLine } from '../../src/domain/order-management/entities/OrderLine.js';
import { ICartRepository } from '../../src/domain/order-management/repositories/ICartRepository.js';
import { IOrderRepository } from '../../src/domain/order-management/repositories/IOrderRepository.js';
import { IEventBus } from '../../src/application/shared/IEventBus.js';
import { IUnitOfWork } from '../../src/application/shared/IUnitOfWork.js';
import { OrderPlaced } from '../../src/domain/order-management/events/OrderPlaced.js';
import { PaymentSettled } from '../../src/domain/order-management/events/PaymentSettled.js';

// ─── Shared test data (mirrors what the legacy implementation would use) ──────

const PRODUCT_PRICE = 1500;   // KES 1500 per unit
const PRODUCT_QTY = 2;        // 2 units
const SHIPPING_COST = 200;    // KES 200 shipping
const EXPECTED_SUBTOTAL = PRODUCT_PRICE * PRODUCT_QTY; // 3000
const EXPECTED_TOTAL = EXPECTED_SUBTOTAL + SHIPPING_COST; // 3200

// ─── Mock factories ───────────────────────────────────────────────────────────

function makeCart(): Cart {
  const cart = Cart.create({ id: 'cart-1', customerId: 'customer-1' });
  cart.addLine({ id: 'line-1', productId: 'product-1', quantity: PRODUCT_QTY });
  return cart;
}

function makeOrderRepository(): { repo: IOrderRepository; savedOrders: Order[] } {
  const savedOrders: Order[] = [];
  const repo: IOrderRepository = {
    findById: vi.fn().mockImplementation(async (id: string) =>
      savedOrders.find((o) => o.id === id) ?? null,
    ),
    findByCode: vi.fn().mockResolvedValue(null),
    findByCustomerId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockImplementation(async (order: Order) => {
      const idx = savedOrders.findIndex((o) => o.id === order.id);
      if (idx >= 0) savedOrders[idx] = order;
      else savedOrders.push(order);
    }),
  };
  return { repo, savedOrders };
}

function makeEventBus(): { bus: IEventBus; publishedEvents: unknown[] } {
  const publishedEvents: unknown[] = [];
  const bus: IEventBus = {
    publish: vi.fn().mockImplementation(async (events: unknown[]) => {
      publishedEvents.push(...events);
    }),
    subscribe: vi.fn(),
  };
  return { bus, publishedEvents };
}

function makeUnitOfWork(): IUnitOfWork {
  return {
    transaction: vi.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Checkout flow equivalence', () => {
  // ─── Order totals match legacy calculation ─────────────────────────────────

  describe('order totals', () => {
    it('should produce the same subtotal as the legacy implementation', async () => {
      const { repo: orderRepo, savedOrders } = makeOrderRepository();
      const { bus: eventBus } = makeEventBus();
      const unitOfWork = makeUnitOfWork();

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
              {
                id: 'product-1',
                name: 'Test Product',
                price: PRODUCT_PRICE,
                stockOnHand: 10,
                enabled: true,
              },
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
        eventBus,
        unitOfWork,
      );

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        shippingCost: SHIPPING_COST,
        currencyCode: 'KES',
      });

      // Verify the total matches what the legacy implementation would compute:
      // subTotal = price × qty = 1500 × 2 = 3000
      // total = subTotal + shipping = 3000 + 200 = 3200
      expect(result.total).toBe(EXPECTED_TOTAL);
      expect(result.currencyCode).toBe('KES');

      // Verify the saved order has the same values
      const savedOrder = savedOrders[0];
      expect(savedOrder.subTotal.amount).toBe(EXPECTED_SUBTOTAL);
      expect(savedOrder.shipping.amount).toBe(SHIPPING_COST);
      expect(savedOrder.total.amount).toBe(EXPECTED_TOTAL);
    });

    it('should produce the same total with a percentage discount', async () => {
      const { repo: orderRepo } = makeOrderRepository();
      const { bus: eventBus } = makeEventBus();
      const unitOfWork = makeUnitOfWork();

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
              {
                id: 'product-1',
                name: 'Test Product',
                price: PRODUCT_PRICE,
                stockOnHand: 10,
                enabled: true,
              },
            ],
          ]),
        ),
        reserveStock: vi.fn().mockResolvedValue(undefined),
      };

      const campaignProvider = {
        findByCouponCode: vi.fn().mockResolvedValue({
          id: 'campaign-1',
          discountType: 'PERCENTAGE' as const,
          discountValue: 10, // 10% off
        }),
        recordRedemption: vi.fn(),
        getCustomerUsageCount: vi.fn().mockResolvedValue(0),
      };

      const service = new PlaceOrderService(
        cartRepo,
        orderRepo,
        productProvider,
        campaignProvider,
        new PricingService(),
        eventBus,
        unitOfWork,
      );

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        shippingCost: SHIPPING_COST,
        couponCode: 'SAVE10',
        currencyCode: 'KES',
      });

      // Legacy: discount = 10% of 3000 = 300; total = 3000 + 200 - 300 = 2900
      const expectedDiscount = EXPECTED_SUBTOTAL * 0.1; // 300
      const expectedTotal = EXPECTED_SUBTOTAL + SHIPPING_COST - expectedDiscount; // 2900
      expect(result.total).toBe(expectedTotal);
    });
  });

  // ─── Order state matches legacy ────────────────────────────────────────────

  describe('order state', () => {
    it('should create order in CREATED state (same as legacy)', async () => {
      const { repo: orderRepo, savedOrders } = makeOrderRepository();
      const { bus: eventBus } = makeEventBus();
      const unitOfWork = makeUnitOfWork();

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
              { id: 'product-1', name: 'Test Product', price: PRODUCT_PRICE, stockOnHand: 10, enabled: true },
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
        eventBus,
        unitOfWork,
      );

      await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        currencyCode: 'KES',
      });

      expect(savedOrders[0].state).toBe('CREATED');
    });

    it('should transition to PAYMENT_SETTLED after verification (same as legacy)', async () => {
      // Build an order in CREATED state
      const line = OrderLine.create({
        id: 'line-1',
        orderId: 'order-1',
        productId: 'product-1',
        productName: 'Test Product',
        quantity: 1,
        unitPrice: Money.create(EXPECTED_TOTAL, 'KES'),
      });

      const order = Order.create({
        id: 'order-1',
        code: OrderCode.create('ORD-123456-789'),
        customerId: 'customer-1',
        lines: [line],
        subTotal: Money.create(EXPECTED_TOTAL, 'KES'),
        shipping: Money.create(0, 'KES'),
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
        total: Money.create(EXPECTED_TOTAL, 'KES'),
        shippingAddressId: 'addr-1',
        billingAddressId: 'addr-2',
      });

      const savedOrders = [order];
      const orderRepo: IOrderRepository = {
        findById: vi.fn().mockImplementation(async (id: string) =>
          savedOrders.find((o) => o.id === id) ?? null,
        ),
        findByCode: vi.fn().mockResolvedValue(null),
        findByCustomerId: vi.fn().mockResolvedValue([]),
        save: vi.fn().mockImplementation(async (o: Order) => {
          const idx = savedOrders.findIndex((s) => s.id === o.id);
          if (idx >= 0) savedOrders[idx] = o;
        }),
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
          amount: EXPECTED_TOTAL * 100,
          currency: 'KES',
          reference: 'ref-abc123',
          id: 'txn-123',
        }),
      };

      const { bus: eventBus, publishedEvents } = makeEventBus();
      const unitOfWork = makeUnitOfWork();

      const verifyService = new VerifyPaymentService(
        orderRepo,
        cartRepo,
        new PaymentVerificationService(paystackClient),
        eventBus,
        unitOfWork,
      );

      await verifyService.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      // State should be PAYMENT_SETTLED (same as legacy `state: "PAYMENT_SETTLED"`)
      expect(savedOrders[0].state).toBe('PAYMENT_SETTLED');
    });
  });

  // ─── Order line items match ────────────────────────────────────────────────

  describe('order line items', () => {
    it('should create order lines with correct productId, quantity, and unit price', async () => {
      const { repo: orderRepo, savedOrders } = makeOrderRepository();
      const { bus: eventBus } = makeEventBus();
      const unitOfWork = makeUnitOfWork();

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
              { id: 'product-1', name: 'Test Product', price: PRODUCT_PRICE, stockOnHand: 10, enabled: true },
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
        eventBus,
        unitOfWork,
      );

      await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        currencyCode: 'KES',
      });

      const savedOrder = savedOrders[0];
      expect(savedOrder.lines).toHaveLength(1);

      const line = savedOrder.lines[0];
      expect(line.productId).toBe('product-1');
      expect(line.quantity).toBe(PRODUCT_QTY);
      expect(line.unitPrice.amount).toBe(PRODUCT_PRICE);
      expect(line.totalPrice.amount).toBe(EXPECTED_SUBTOTAL);
    });
  });

  // ─── Domain events match expected business events ──────────────────────────

  describe('domain events', () => {
    it('should raise OrderPlaced event with correct data (equivalent to legacy order creation)', async () => {
      const { repo: orderRepo } = makeOrderRepository();
      const { bus: eventBus, publishedEvents } = makeEventBus();
      const unitOfWork = makeUnitOfWork();

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
              { id: 'product-1', name: 'Test Product', price: PRODUCT_PRICE, stockOnHand: 10, enabled: true },
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
        eventBus,
        unitOfWork,
      );

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        shippingCost: SHIPPING_COST,
        currencyCode: 'KES',
      });

      const orderPlacedEvent = publishedEvents.find((e) => e instanceof OrderPlaced) as OrderPlaced;
      expect(orderPlacedEvent).toBeDefined();
      expect(orderPlacedEvent.orderId).toBe(result.orderId);
      expect(orderPlacedEvent.customerId).toBe('customer-1');
      expect(orderPlacedEvent.total).toBe(EXPECTED_TOTAL);
      expect(orderPlacedEvent.currencyCode).toBe('KES');
    });

    it('should raise PaymentSettled event after verification', async () => {
      const line = OrderLine.create({
        id: 'line-1',
        orderId: 'order-1',
        productId: 'product-1',
        productName: 'Test Product',
        quantity: 1,
        unitPrice: Money.create(EXPECTED_TOTAL, 'KES'),
      });

      const order = Order.create({
        id: 'order-1',
        code: OrderCode.create('ORD-123456-789'),
        customerId: 'customer-1',
        lines: [line],
        subTotal: Money.create(EXPECTED_TOTAL, 'KES'),
        shipping: Money.create(0, 'KES'),
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
        total: Money.create(EXPECTED_TOTAL, 'KES'),
        shippingAddressId: 'addr-1',
        billingAddressId: 'addr-2',
      });

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
          amount: EXPECTED_TOTAL * 100,
          currency: 'KES',
          reference: 'ref-abc123',
          id: 'txn-123',
        }),
      };

      const { bus: eventBus, publishedEvents } = makeEventBus();
      const unitOfWork = makeUnitOfWork();

      const verifyService = new VerifyPaymentService(
        orderRepo,
        cartRepo,
        new PaymentVerificationService(paystackClient),
        eventBus,
        unitOfWork,
      );

      await verifyService.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      const paymentSettledEvent = publishedEvents.find(
        (e) => e instanceof PaymentSettled,
      ) as PaymentSettled;
      expect(paymentSettledEvent).toBeDefined();
      expect(paymentSettledEvent.orderId).toBe('order-1');
      expect(paymentSettledEvent.amount).toBe(EXPECTED_TOTAL);
      expect(paymentSettledEvent.currencyCode).toBe('KES');
    });
  });

  // ─── Order code format matches legacy ─────────────────────────────────────

  describe('order code format', () => {
    it('should generate order codes in the same ORD-XXXXXX-XXX format as legacy', async () => {
      const { repo: orderRepo, savedOrders } = makeOrderRepository();
      const { bus: eventBus } = makeEventBus();
      const unitOfWork = makeUnitOfWork();

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
              { id: 'product-1', name: 'Test Product', price: PRODUCT_PRICE, stockOnHand: 10, enabled: true },
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
        eventBus,
        unitOfWork,
      );

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        currencyCode: 'KES',
      });

      // Legacy format: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
      // DDD format: OrderCode.generate() → same pattern
      expect(result.code).toMatch(/^ORD-\d{6}-\d{3}$/);
    });
  });
});
