/**
 * Integration tests for VerifyPaymentService.
 *
 * Uses mock implementations of all infrastructure dependencies to test
 * the orchestration logic without requiring a live database or Paystack.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyPaymentService } from '../../src/application/order-management/services/VerifyPaymentService.js';
import { PaymentVerificationService, IPaystackClient } from '../../src/domain/order-management/services/PaymentVerificationService.js';
import { Order } from '../../src/domain/order-management/aggregates/Order.js';
import { OrderLine } from '../../src/domain/order-management/entities/OrderLine.js';
import { Cart } from '../../src/domain/order-management/aggregates/Cart.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';
import { OrderCode } from '../../src/domain/order-management/value-objects/OrderCode.js';
import { IOrderRepository } from '../../src/domain/order-management/repositories/IOrderRepository.js';
import { ICartRepository } from '../../src/domain/order-management/repositories/ICartRepository.js';
import { IEventBus } from '../../src/application/shared/IEventBus.js';
import { IUnitOfWork } from '../../src/application/shared/IUnitOfWork.js';
import { PaymentSettled } from '../../src/domain/order-management/events/PaymentSettled.js';
import { PaymentVerificationError } from '../../src/domain/order-management/errors/PaymentVerificationError.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeOrder(state: Order['state'] = 'CREATED', total = 1200): Order {
  const line = OrderLine.create({
    id: 'line-1',
    orderId: 'order-1',
    productId: 'product-1',
    productName: 'Test Product',
    quantity: 1,
    unitPrice: Money.create(total, 'KES'),
  });

  const order = Order.create({
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

  // If we need a non-CREATED state, reconstitute
  if (state !== 'CREATED') {
    return Order.reconstitute({
      id: 'order-1',
      code: OrderCode.create('ORD-123456-789'),
      customerId: 'customer-1',
      state,
      lines: [line],
      subTotal: Money.create(total, 'KES'),
      shipping: Money.create(0, 'KES'),
      tax: Money.create(0, 'KES'),
      discount: Money.create(0, 'KES'),
      total: Money.create(total, 'KES'),
      currencyCode: 'KES',
      shippingAddressId: 'addr-1',
      billingAddressId: 'addr-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return order;
}

function makePaystackClient(total = 1200): IPaystackClient {
  return {
    verifyTransaction: vi.fn().mockResolvedValue({
      status: 'success',
      amount: total * 100, // Paystack returns minor units
      currency: 'KES',
      reference: 'ref-abc123',
      id: 'txn-123',
    }),
  };
}

function makeOrderRepository(order: Order | null = makeOrder()): IOrderRepository {
  return {
    findById: vi.fn().mockResolvedValue(order),
    findByCode: vi.fn().mockResolvedValue(null),
    findByCustomerId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeCartRepository(cart: Cart | null = null): ICartRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByCustomerId: vi.fn().mockResolvedValue(cart),
    findByGuestId: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

function makeEventBus(): IEventBus {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(),
  };
}

function makeUnitOfWork(): IUnitOfWork {
  return {
    transaction: vi.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
  };
}

function makeService(overrides: {
  orderRepo?: IOrderRepository;
  cartRepo?: ICartRepository;
  paystackClient?: IPaystackClient;
  eventBus?: IEventBus;
  unitOfWork?: IUnitOfWork;
} = {}): {
  service: VerifyPaymentService;
  orderRepo: IOrderRepository;
  cartRepo: ICartRepository;
  paystackClient: IPaystackClient;
  eventBus: IEventBus;
  unitOfWork: IUnitOfWork;
} {
  const orderRepo = overrides.orderRepo ?? makeOrderRepository();
  const cartRepo = overrides.cartRepo ?? makeCartRepository();
  const paystackClient = overrides.paystackClient ?? makePaystackClient();
  const eventBus = overrides.eventBus ?? makeEventBus();
  const unitOfWork = overrides.unitOfWork ?? makeUnitOfWork();

  const paymentVerificationService = new PaymentVerificationService(paystackClient);

  const service = new VerifyPaymentService(
    orderRepo,
    cartRepo,
    paymentVerificationService,
    eventBus,
    unitOfWork,
  );

  return { service, orderRepo, cartRepo, paystackClient, eventBus, unitOfWork };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('VerifyPaymentService', () => {
  // ─── Successful payment verification ──────────────────────────────────────

  describe('successful payment verification', () => {
    it('should return orderId, message, and tracking info', async () => {
      const { service } = makeService();

      const result = await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(result.orderId).toBe('order-1');
      expect(result.message).toBe('Order verified');
      expect(result.tracking.orderId).toBe('order-1');
      expect(result.tracking.code).toBe('ORD-123456-789');
      expect(result.tracking.total).toBe(1200);
      expect(result.tracking.currencyCode).toBe('KES');
      expect(result.tracking.customerId).toBe('customer-1');
    });

    it('should save the updated order with PAYMENT_SETTLED state', async () => {
      const { service, orderRepo } = makeService();

      await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(orderRepo.save).toHaveBeenCalledOnce();
      const savedOrder = (orderRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0] as Order;
      expect(savedOrder.state).toBe('PAYMENT_SETTLED');
    });

    it('should publish PaymentSettled domain event', async () => {
      const { service, eventBus } = makeService();

      await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(eventBus.publish).toHaveBeenCalledOnce();
      const publishedEvents = (eventBus.publish as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const paymentSettledEvent = publishedEvents.find(
        (e: unknown) => e instanceof PaymentSettled,
      );
      expect(paymentSettledEvent).toBeDefined();
      expect((paymentSettledEvent as PaymentSettled).orderId).toBe('order-1');
    });

    it('should delete the customer cart after successful verification', async () => {
      const cart = Cart.create({ id: 'cart-1', customerId: 'customer-1' });
      const cartRepo = makeCartRepository(cart);
      const { service } = makeService({ cartRepo });

      await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(cartRepo.delete).toHaveBeenCalledWith('cart-1');
    });

    it('should not throw when no cart exists for the customer', async () => {
      const cartRepo = makeCartRepository(null);
      const { service } = makeService({ cartRepo });

      await expect(
        service.execute({
          orderId: 'order-1',
          paymentReference: 'ref-abc123',
        }),
      ).resolves.toBeDefined();
    });
  });

  // ─── Idempotency ───────────────────────────────────────────────────────────

  describe('idempotency', () => {
    it('should return "already verified" when order is already PAYMENT_SETTLED', async () => {
      const settledOrder = makeOrder('PAYMENT_SETTLED');
      const orderRepo = makeOrderRepository(settledOrder);
      const { service } = makeService({ orderRepo });

      const result = await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(result.message).toBe('Order already verified');
    });

    it('should not call Paystack when order is already settled', async () => {
      const settledOrder = makeOrder('PAYMENT_SETTLED');
      const orderRepo = makeOrderRepository(settledOrder);
      const paystackClient = makePaystackClient();
      const { service } = makeService({ orderRepo, paystackClient });

      await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(paystackClient.verifyTransaction).not.toHaveBeenCalled();
    });

    it('should not save the order again when already settled', async () => {
      const settledOrder = makeOrder('PAYMENT_SETTLED');
      const orderRepo = makeOrderRepository(settledOrder);
      const { service } = makeService({ orderRepo });

      await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(orderRepo.save).not.toHaveBeenCalled();
    });
  });

  // ─── Order not found ───────────────────────────────────────────────────────

  describe('order not found', () => {
    it('should throw when order does not exist', async () => {
      const orderRepo = makeOrderRepository(null);
      const { service } = makeService({ orderRepo });

      await expect(
        service.execute({
          orderId: 'nonexistent',
          paymentReference: 'ref-abc123',
        }),
      ).rejects.toThrow('Order not found');
    });
  });

  // ─── Authorization ─────────────────────────────────────────────────────────

  describe('authorization', () => {
    it('should allow verification when userId matches order customerId', async () => {
      const { service } = makeService();

      await expect(
        service.execute({
          orderId: 'order-1',
          paymentReference: 'ref-abc123',
          userId: 'customer-1',
        }),
      ).resolves.toBeDefined();
    });

    it('should throw when userId does not match order customerId', async () => {
      const { service } = makeService();

      await expect(
        service.execute({
          orderId: 'order-1',
          paymentReference: 'ref-abc123',
          userId: 'different-customer',
        }),
      ).rejects.toThrow('Not authorized');
    });

    it('should skip authorization check when userId is not provided', async () => {
      const { service } = makeService();

      await expect(
        service.execute({
          orderId: 'order-1',
          paymentReference: 'ref-abc123',
        }),
      ).resolves.toBeDefined();
    });
  });

  // ─── Payment amount validation ─────────────────────────────────────────────

  describe('payment amount validation', () => {
    it('should throw PaymentVerificationError when Paystack amount does not match order total', async () => {
      const paystackClient = makePaystackClient(999); // wrong amount
      const { service } = makeService({ paystackClient });

      await expect(
        service.execute({
          orderId: 'order-1',
          paymentReference: 'ref-abc123',
        }),
      ).rejects.toThrow(PaymentVerificationError);
    });

    it('should throw PaymentVerificationError when Paystack status is not success', async () => {
      const paystackClient: IPaystackClient = {
        verifyTransaction: vi.fn().mockResolvedValue({
          status: 'failed',
          amount: 120000,
          currency: 'KES',
          reference: 'ref-abc123',
        }),
      };
      const { service } = makeService({ paystackClient });

      await expect(
        service.execute({
          orderId: 'order-1',
          paymentReference: 'ref-abc123',
        }),
      ).rejects.toThrow(PaymentVerificationError);
    });

    it('should throw PaymentVerificationError when Paystack API call fails', async () => {
      const paystackClient: IPaystackClient = {
        verifyTransaction: vi.fn().mockRejectedValue(new Error('Network error')),
      };
      const { service } = makeService({ paystackClient });

      await expect(
        service.execute({
          orderId: 'order-1',
          paymentReference: 'ref-abc123',
        }),
      ).rejects.toThrow(PaymentVerificationError);
    });
  });

  // ─── Transaction management ────────────────────────────────────────────────

  describe('transaction management', () => {
    it('should execute all operations inside a transaction', async () => {
      const { service, unitOfWork } = makeService();

      await service.execute({
        orderId: 'order-1',
        paymentReference: 'ref-abc123',
      });

      expect(unitOfWork.transaction).toHaveBeenCalledOnce();
    });
  });
});
