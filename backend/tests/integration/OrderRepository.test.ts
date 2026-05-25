/**
 * Integration tests for OrderRepository and CartRepository.
 *
 * These tests verify the mapping and repository logic using mock database
 * objects, without requiring a live database connection. This approach
 * validates the aggregate reconstruction (toDomain) and persistence
 * (toOrderPersistence, toOrderLinesPersistence, toPaymentPersistence) logic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderMapper, OrderWithRelations } from '../../src/infrastructure/persistence/mappers/OrderMapper.js';
import { CartMapper, CartWithLines } from '../../src/infrastructure/persistence/mappers/CartMapper.js';
import { Order } from '../../src/domain/order-management/aggregates/Order.js';
import { Cart } from '../../src/domain/order-management/aggregates/Cart.js';
import { OrderLine } from '../../src/domain/order-management/entities/OrderLine.js';
import { Payment } from '../../src/domain/order-management/entities/Payment.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';
import { OrderCode } from '../../src/domain/order-management/value-objects/OrderCode.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const now = new Date('2024-01-15T10:00:00Z');

const rawOrder: OrderWithRelations = {
  id: 'order-1',
  code: 'ORD-123456-789',
  customerId: 'customer-1',
  state: 'CREATED',
  subTotal: 2000,
  shipping: 200,
  tax: 0,
  total: 2200,
  currencyCode: 'KES',
  shippingAddressId: 'addr-1',
  billingAddressId: 'addr-2',
  shippingMethodId: null,
  createdAt: now,
  updatedAt: now,
  lines: [
    {
      id: 'line-1',
      orderId: 'order-1',
      productId: 'product-1',
      quantity: 2,
      linePrice: 1000,
      product: { name: 'Test Product' },
    },
  ],
  payment: null,
};

const rawOrderWithPayment: OrderWithRelations = {
  ...rawOrder,
  state: 'PAYMENT_SETTLED',
  payment: {
    id: 'payment-1',
    orderId: 'order-1',
    amount: 2200,
    method: 'paystack',
    state: 'SETTLED',
    transactionId: 'txn-123',
    paystackRef: 'ref-abc',
    metadata: { channel: 'card' },
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  },
};

const rawCart: CartWithLines = {
  id: 'cart-1',
  customerId: 'customer-1',
  guestId: null,
  createdAt: now,
  updatedAt: now,
  lines: [
    {
      id: 'cart-line-1',
      cartId: 'cart-1',
      productId: 'product-1',
      variantId: null,
      quantity: 3,
      createdAt: now,
      updatedAt: now,
    },
  ],
};

// ─── OrderMapper Tests ────────────────────────────────────────────────────────

describe('OrderMapper', () => {
  let mapper: OrderMapper;

  beforeEach(() => {
    mapper = new OrderMapper();
  });

  describe('toDomain', () => {
    it('should reconstruct an Order aggregate from raw DB records', () => {
      const order = mapper.toDomain(rawOrder);

      expect(order).toBeInstanceOf(Order);
      expect(order.id).toBe('order-1');
      expect(order.code.value).toBe('ORD-123456-789');
      expect(order.customerId).toBe('customer-1');
      expect(order.state).toBe('CREATED');
      expect(order.total.amount).toBe(2200);
      expect(order.total.currency).toBe('KES');
      expect(order.currencyCode).toBe('KES');
    });

    it('should reconstruct order lines with correct data', () => {
      const order = mapper.toDomain(rawOrder);

      expect(order.lines).toHaveLength(1);
      const line = order.lines[0];
      expect(line.id).toBe('line-1');
      expect(line.productId).toBe('product-1');
      expect(line.productName).toBe('Test Product');
      expect(line.quantity).toBe(2);
      expect(line.unitPrice.amount).toBe(1000);
      expect(line.totalPrice.amount).toBe(2000);
    });

    it('should reconstruct an order without a payment', () => {
      const order = mapper.toDomain(rawOrder);
      expect(order.payment).toBeUndefined();
    });

    it('should reconstruct an order with a payment', () => {
      const order = mapper.toDomain(rawOrderWithPayment);

      expect(order.payment).toBeDefined();
      const payment = order.payment!;
      expect(payment.id).toBe('payment-1');
      expect(payment.amount.amount).toBe(2200);
      expect(payment.method).toBe('paystack');
      expect(payment.state).toBe('SETTLED');
      expect(payment.paystackRef).toBe('ref-abc');
    });

    it('should not raise domain events when reconstituting', () => {
      const order = mapper.toDomain(rawOrder);
      expect(order.domainEvents).toHaveLength(0);
    });

    it('should handle missing product name gracefully', () => {
      const rawWithNoProductName: OrderWithRelations = {
        ...rawOrder,
        lines: [{ ...rawOrder.lines[0], product: null }],
      };
      const order = mapper.toDomain(rawWithNoProductName);
      expect(order.lines[0].productName).toBe('');
    });

    it('should compute discount from the difference between components and total', () => {
      // subTotal(2000) + shipping(200) + tax(0) - total(1900) = discount(300)
      const rawWithDiscount: OrderWithRelations = {
        ...rawOrder,
        total: 1900,
      };
      const order = mapper.toDomain(rawWithDiscount);
      expect(order.discount.amount).toBe(300);
    });
  });

  describe('toOrderPersistence', () => {
    it('should convert an Order aggregate to a persistence DTO', () => {
      const order = mapper.toDomain(rawOrder);
      const dto = mapper.toOrderPersistence(order);

      expect(dto.id).toBe('order-1');
      expect(dto.code).toBe('ORD-123456-789');
      expect(dto.customerId).toBe('customer-1');
      expect(dto.state).toBe('CREATED');
      expect(dto.subTotal).toBe(2000);
      expect(dto.shipping).toBe(200);
      expect(dto.tax).toBe(0);
      expect(dto.total).toBe(2200);
      expect(dto.currencyCode).toBe('KES');
      expect(dto.shippingAddressId).toBe('addr-1');
      expect(dto.billingAddressId).toBe('addr-2');
      expect(dto.shippingMethodId).toBeNull();
    });
  });

  describe('toOrderLinesPersistence', () => {
    it('should convert order lines to persistence DTOs', () => {
      const order = mapper.toDomain(rawOrder);
      const dtos = mapper.toOrderLinesPersistence(order);

      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('line-1');
      expect(dtos[0].orderId).toBe('order-1');
      expect(dtos[0].productId).toBe('product-1');
      expect(dtos[0].quantity).toBe(2);
      expect(dtos[0].linePrice).toBe(1000);
    });
  });

  describe('toPaymentPersistence', () => {
    it('should return null when order has no payment', () => {
      const order = mapper.toDomain(rawOrder);
      const dto = mapper.toPaymentPersistence(order);
      expect(dto).toBeNull();
    });

    it('should convert payment to persistence DTO', () => {
      const order = mapper.toDomain(rawOrderWithPayment);
      const dto = mapper.toPaymentPersistence(order);

      expect(dto).not.toBeNull();
      expect(dto!.id).toBe('payment-1');
      expect(dto!.orderId).toBe('order-1');
      expect(dto!.amount).toBe(2200);
      expect(dto!.method).toBe('paystack');
      expect(dto!.state).toBe('SETTLED');
      expect(dto!.paystackRef).toBe('ref-abc');
    });
  });

  describe('round-trip mapping', () => {
    it('should produce the same aggregate after toDomain → toPersistence → toDomain', () => {
      const original = mapper.toDomain(rawOrder);
      const persistenceDto = mapper.toOrderPersistence(original);
      const linesDtos = mapper.toOrderLinesPersistence(original);

      // Reconstruct a raw record from the persistence DTOs
      const reconstructedRaw: OrderWithRelations = {
        ...persistenceDto,
        lines: linesDtos.map((l) => ({
          ...l,
          product: { name: 'Test Product' },
        })),
        payment: null,
      };

      const reconstructed = mapper.toDomain(reconstructedRaw);

      expect(reconstructed.id).toBe(original.id);
      expect(reconstructed.code.value).toBe(original.code.value);
      expect(reconstructed.state).toBe(original.state);
      expect(reconstructed.total.amount).toBe(original.total.amount);
      expect(reconstructed.lines).toHaveLength(original.lines.length);
    });
  });
});

// ─── CartMapper Tests ─────────────────────────────────────────────────────────

describe('CartMapper', () => {
  let mapper: CartMapper;

  beforeEach(() => {
    mapper = new CartMapper();
  });

  describe('toDomain', () => {
    it('should reconstruct a Cart aggregate from raw DB records', () => {
      const cart = mapper.toDomain(rawCart);

      expect(cart).toBeInstanceOf(Cart);
      expect(cart.id).toBe('cart-1');
      expect(cart.customerId).toBe('customer-1');
      expect(cart.guestId).toBeUndefined();
    });

    it('should reconstruct cart lines with correct data', () => {
      const cart = mapper.toDomain(rawCart);

      expect(cart.lines).toHaveLength(1);
      const line = cart.lines[0];
      expect(line.id).toBe('cart-line-1');
      expect(line.productId).toBe('product-1');
      expect(line.quantity).toBe(3);
      expect(line.variantId).toBeUndefined();
    });

    it('should reconstruct a guest cart', () => {
      const guestRaw: CartWithLines = {
        ...rawCart,
        customerId: null,
        guestId: 'guest-abc',
      };
      const cart = mapper.toDomain(guestRaw);
      expect(cart.customerId).toBeUndefined();
      expect(cart.guestId).toBe('guest-abc');
    });

    it('should reconstruct a cart with variant lines', () => {
      const rawWithVariant: CartWithLines = {
        ...rawCart,
        lines: [{ ...rawCart.lines[0], variantId: 'variant-1' }],
      };
      const cart = mapper.toDomain(rawWithVariant);
      expect(cart.lines[0].variantId).toBe('variant-1');
    });

    it('should reconstruct an empty cart', () => {
      const emptyRaw: CartWithLines = { ...rawCart, lines: [] };
      const cart = mapper.toDomain(emptyRaw);
      expect(cart.isEmpty()).toBe(true);
    });
  });

  describe('toCartPersistence', () => {
    it('should convert a Cart aggregate to a persistence DTO', () => {
      const cart = mapper.toDomain(rawCart);
      const dto = mapper.toCartPersistence(cart);

      expect(dto.id).toBe('cart-1');
      expect(dto.customerId).toBe('customer-1');
      expect(dto.guestId).toBeNull();
    });

    it('should set guestId and null customerId for guest carts', () => {
      const guestRaw: CartWithLines = {
        ...rawCart,
        customerId: null,
        guestId: 'guest-abc',
      };
      const cart = mapper.toDomain(guestRaw);
      const dto = mapper.toCartPersistence(cart);

      expect(dto.customerId).toBeNull();
      expect(dto.guestId).toBe('guest-abc');
    });
  });

  describe('toCartLinesPersistence', () => {
    it('should convert cart lines to persistence DTOs', () => {
      const cart = mapper.toDomain(rawCart);
      const dtos = mapper.toCartLinesPersistence(cart);

      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('cart-line-1');
      expect(dtos[0].cartId).toBe('cart-1');
      expect(dtos[0].productId).toBe('product-1');
      expect(dtos[0].quantity).toBe(3);
      expect(dtos[0].variantId).toBeNull();
    });

    it('should return empty array for a cart with no lines', () => {
      const emptyRaw: CartWithLines = { ...rawCart, lines: [] };
      const cart = mapper.toDomain(emptyRaw);
      const dtos = mapper.toCartLinesPersistence(cart);
      expect(dtos).toHaveLength(0);
    });
  });

  describe('round-trip mapping', () => {
    it('should produce the same aggregate after toDomain → toPersistence → toDomain', () => {
      const original = mapper.toDomain(rawCart);
      const cartDto = mapper.toCartPersistence(original);
      const linesDtos = mapper.toCartLinesPersistence(original);

      const reconstructedRaw: CartWithLines = {
        ...cartDto,
        lines: linesDtos,
      };

      const reconstructed = mapper.toDomain(reconstructedRaw);

      expect(reconstructed.id).toBe(original.id);
      expect(reconstructed.customerId).toBe(original.customerId);
      expect(reconstructed.lines).toHaveLength(original.lines.length);
      expect(reconstructed.lines[0].quantity).toBe(original.lines[0].quantity);
    });
  });
});
