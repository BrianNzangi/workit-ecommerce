/**
 * Integration tests for PlaceOrderService.
 *
 * Uses mock implementations of all infrastructure dependencies to test
 * the orchestration logic without requiring a live database or Paystack.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceOrderService, IProductInfoProvider, ICampaignProvider } from '../../src/application/order-management/services/PlaceOrderService.js';
import { PricingService } from '../../src/domain/order-management/services/PricingService.js';
import { Cart } from '../../src/domain/order-management/aggregates/Cart.js';
import { Order } from '../../src/domain/order-management/aggregates/Order.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';
import { ICartRepository } from '../../src/domain/order-management/repositories/ICartRepository.js';
import { IOrderRepository } from '../../src/domain/order-management/repositories/IOrderRepository.js';
import { IEventBus } from '../../src/application/shared/IEventBus.js';
import { IUnitOfWork } from '../../src/application/shared/IUnitOfWork.js';
import { OrderPlaced } from '../../src/domain/order-management/events/OrderPlaced.js';

// ─── Mock Factories ───────────────────────────────────────────────────────────

function makeCart(customerId = 'customer-1'): Cart {
  const cart = Cart.create({ id: 'cart-1', customerId });
  cart.addLine({ id: 'line-1', productId: 'product-1', quantity: 2 });
  return cart;
}

function makeCartRepository(cart: Cart | null = makeCart()): ICartRepository {
  return {
    findById: vi.fn().mockResolvedValue(cart),
    findByCustomerId: vi.fn().mockResolvedValue(cart),
    findByGuestId: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

function makeOrderRepository(): IOrderRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByCode: vi.fn().mockResolvedValue(null),
    findByCustomerId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeProductInfoProvider(stockOnHand = 10): IProductInfoProvider {
  return {
    getProductsByIds: vi.fn().mockResolvedValue(
      new Map([
        [
          'product-1',
          {
            id: 'product-1',
            name: 'Test Product',
            price: 1000,
            stockOnHand,
            enabled: true,
          },
        ],
      ]),
    ),
    reserveStock: vi.fn().mockResolvedValue(undefined),
  };
}

function makeCampaignProvider(): ICampaignProvider {
  return {
    findByCouponCode: vi.fn().mockResolvedValue(null),
    recordRedemption: vi.fn().mockResolvedValue(undefined),
    getCustomerUsageCount: vi.fn().mockResolvedValue(0),
  };
}

function makeEventBus(): IEventBus {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(),
  };
}

/** A UnitOfWork that simply executes the callback (no real transaction). */
function makeUnitOfWork(): IUnitOfWork {
  return {
    transaction: vi.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
  };
}

function makeService(overrides: {
  cartRepo?: ICartRepository;
  orderRepo?: IOrderRepository;
  productProvider?: IProductInfoProvider;
  campaignProvider?: ICampaignProvider;
  eventBus?: IEventBus;
  unitOfWork?: IUnitOfWork;
} = {}): {
  service: PlaceOrderService;
  cartRepo: ICartRepository;
  orderRepo: IOrderRepository;
  productProvider: IProductInfoProvider;
  campaignProvider: ICampaignProvider;
  eventBus: IEventBus;
  unitOfWork: IUnitOfWork;
} {
  const cartRepo = overrides.cartRepo ?? makeCartRepository();
  const orderRepo = overrides.orderRepo ?? makeOrderRepository();
  const productProvider = overrides.productProvider ?? makeProductInfoProvider();
  const campaignProvider = overrides.campaignProvider ?? makeCampaignProvider();
  const eventBus = overrides.eventBus ?? makeEventBus();
  const unitOfWork = overrides.unitOfWork ?? makeUnitOfWork();

  const service = new PlaceOrderService(
    cartRepo,
    orderRepo,
    productProvider,
    campaignProvider,
    new PricingService(),
    eventBus,
    unitOfWork,
  );

  return { service, cartRepo, orderRepo, productProvider, campaignProvider, eventBus, unitOfWork };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PlaceOrderService', () => {
  // ─── Successful order creation ─────────────────────────────────────────────

  describe('successful order creation', () => {
    it('should create an order and return orderId, code, total, currencyCode', async () => {
      const { service } = makeService();

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
      });

      expect(result.orderId).toBeDefined();
      expect(result.code).toMatch(/^ORD-\d{6}-\d{3}$/);
      expect(result.total).toBe(2000); // 2 × 1000, no shipping
      expect(result.currencyCode).toBe('KES');
    });

    it('should save the order to the repository', async () => {
      const { service, orderRepo } = makeService();

      await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
      });

      expect(orderRepo.save).toHaveBeenCalledOnce();
      const savedOrder = (orderRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0] as Order;
      expect(savedOrder).toBeInstanceOf(Order);
      expect(savedOrder.customerId).toBe('customer-1');
    });

    it('should reserve stock for each cart line', async () => {
      const { service, productProvider } = makeService();

      await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
      });

      expect(productProvider.reserveStock).toHaveBeenCalledWith('product-1', 2);
    });

    it('should publish domain events after order creation', async () => {
      const { service, eventBus } = makeService();

      await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
      });

      expect(eventBus.publish).toHaveBeenCalledOnce();
      const publishedEvents = (eventBus.publish as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(publishedEvents).toHaveLength(1);
      expect(publishedEvents[0]).toBeInstanceOf(OrderPlaced);
    });

    it('should include shipping cost in the total', async () => {
      const { service } = makeService();

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        shippingCost: 200,
      });

      expect(result.total).toBe(2200); // 2000 + 200
    });

    it('should use the provided currency code', async () => {
      const { service } = makeService();

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        currencyCode: 'USD',
      });

      expect(result.currencyCode).toBe('USD');
    });

    it('should load cart by cartId when provided', async () => {
      const { service, cartRepo } = makeService();

      await service.execute({
        customerId: 'customer-1',
        cartId: 'cart-1',
        shippingAddressId: 'addr-1',
      });

      expect(cartRepo.findById).toHaveBeenCalledWith('cart-1');
      expect(cartRepo.findByCustomerId).not.toHaveBeenCalled();
    });

    it('should load cart by customerId when cartId is not provided', async () => {
      const { service, cartRepo } = makeService();

      await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
      });

      expect(cartRepo.findByCustomerId).toHaveBeenCalledWith('customer-1');
    });
  });

  // ─── Campaign discount ─────────────────────────────────────────────────────

  describe('campaign discount', () => {
    it('should apply a percentage discount when a valid coupon code is provided', async () => {
      const campaignProvider = makeCampaignProvider();
      (campaignProvider.findByCouponCode as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'campaign-1',
        discountType: 'PERCENTAGE',
        discountValue: 10,
      });

      const { service } = makeService({ campaignProvider });

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        couponCode: 'SAVE10',
      });

      expect(result.total).toBe(1800); // 2000 - 10% = 1800
    });

    it('should record campaign redemption after successful order', async () => {
      const campaignProvider = makeCampaignProvider();
      (campaignProvider.findByCouponCode as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'campaign-1',
        discountType: 'FIXED_AMOUNT',
        discountValue: 200,
      });

      const { service } = makeService({ campaignProvider });

      const result = await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
        couponCode: 'FLAT200',
      });

      expect(campaignProvider.recordRedemption).toHaveBeenCalledWith(
        'campaign-1',
        'customer-1',
        result.orderId,
      );
    });

    it('should throw when coupon code is invalid', async () => {
      const campaignProvider = makeCampaignProvider();
      (campaignProvider.findByCouponCode as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { service } = makeService({ campaignProvider });

      await expect(
        service.execute({
          customerId: 'customer-1',
          shippingAddressId: 'addr-1',
          couponCode: 'INVALID',
        }),
      ).rejects.toThrow('Invalid coupon code');
    });

    it('should throw when order does not meet minimum purchase amount', async () => {
      const campaignProvider = makeCampaignProvider();
      (campaignProvider.findByCouponCode as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'campaign-1',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minPurchaseAmount: 5000, // subtotal is 2000, below minimum
      });

      const { service } = makeService({ campaignProvider });

      await expect(
        service.execute({
          customerId: 'customer-1',
          shippingAddressId: 'addr-1',
          couponCode: 'SAVE10',
        }),
      ).rejects.toThrow('Minimum order value');
    });
  });

  // ─── Stock validation ──────────────────────────────────────────────────────

  describe('stock validation', () => {
    it('should throw when product has insufficient stock', async () => {
      const productProvider = makeProductInfoProvider(1); // only 1 in stock, cart has 2
      const { service } = makeService({ productProvider });

      await expect(
        service.execute({
          customerId: 'customer-1',
          shippingAddressId: 'addr-1',
        }),
      ).rejects.toThrow('Insufficient stock');
    });

    it('should throw when product is not found', async () => {
      const productProvider = makeProductInfoProvider();
      (productProvider.getProductsByIds as ReturnType<typeof vi.fn>).mockResolvedValue(new Map());

      const { service } = makeService({ productProvider });

      await expect(
        service.execute({
          customerId: 'customer-1',
          shippingAddressId: 'addr-1',
        }),
      ).rejects.toThrow('Product not found');
    });

    it('should throw when product is disabled', async () => {
      const productProvider = makeProductInfoProvider();
      (productProvider.getProductsByIds as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Map([
          [
            'product-1',
            {
              id: 'product-1',
              name: 'Disabled Product',
              price: 1000,
              stockOnHand: 10,
              enabled: false,
            },
          ],
        ]),
      );

      const { service } = makeService({ productProvider });

      await expect(
        service.execute({
          customerId: 'customer-1',
          shippingAddressId: 'addr-1',
        }),
      ).rejects.toThrow('no longer available');
    });
  });

  // ─── Empty cart ────────────────────────────────────────────────────────────

  describe('empty cart', () => {
    it('should throw when cart is not found', async () => {
      const cartRepo = makeCartRepository(null);
      const { service } = makeService({ cartRepo });

      await expect(
        service.execute({
          customerId: 'customer-1',
          shippingAddressId: 'addr-1',
        }),
      ).rejects.toThrow('Cart is empty or not found');
    });

    it('should throw when cart is empty', async () => {
      const emptyCart = Cart.create({ id: 'cart-1', customerId: 'customer-1' });
      const cartRepo = makeCartRepository(emptyCart);
      const { service } = makeService({ cartRepo });

      await expect(
        service.execute({
          customerId: 'customer-1',
          shippingAddressId: 'addr-1',
        }),
      ).rejects.toThrow('Cart is empty or not found');
    });
  });

  // ─── Transaction management ────────────────────────────────────────────────

  describe('transaction management', () => {
    it('should execute all operations inside a transaction', async () => {
      const { service, unitOfWork } = makeService();

      await service.execute({
        customerId: 'customer-1',
        shippingAddressId: 'addr-1',
      });

      expect(unitOfWork.transaction).toHaveBeenCalledOnce();
    });

    it('should propagate errors from within the transaction', async () => {
      const cartRepo = makeCartRepository(null);
      const { service } = makeService({ cartRepo });

      await expect(
        service.execute({
          customerId: 'customer-1',
          shippingAddressId: 'addr-1',
        }),
      ).rejects.toThrow();
    });
  });
});
