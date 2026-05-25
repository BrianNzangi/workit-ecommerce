import { describe, it, expect } from 'vitest';
import { Order, OrderState } from '../../../../src/domain/order-management/aggregates/Order.js';
import { OrderLine } from '../../../../src/domain/order-management/entities/OrderLine.js';
import { Payment } from '../../../../src/domain/order-management/entities/Payment.js';
import { Money } from '../../../../src/domain/order-management/value-objects/Money.js';
import { OrderCode } from '../../../../src/domain/order-management/value-objects/OrderCode.js';
import { OrderPlaced } from '../../../../src/domain/order-management/events/OrderPlaced.js';
import { OrderStateChanged } from '../../../../src/domain/order-management/events/OrderStateChanged.js';
import { PaymentSettled } from '../../../../src/domain/order-management/events/PaymentSettled.js';
import { InvalidStateTransitionError } from '../../../../src/domain/order-management/errors/InvalidStateTransitionError.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeOrderLine(id = 'line-1', orderId = 'order-1'): OrderLine {
  return OrderLine.create({
    id,
    orderId,
    productId: 'product-1',
    productName: 'Test Product',
    quantity: 2,
    unitPrice: Money.create(500, 'KES'),
  });
}

function makeOrder(overrides: Partial<Parameters<typeof Order.create>[0]> = {}): Order {
  const defaults = {
    id: 'order-1',
    code: OrderCode.create('ORD-123456-789'),
    customerId: 'customer-1',
    lines: [makeOrderLine()],
    subTotal: Money.create(1000, 'KES'),
    shipping: Money.create(200, 'KES'),
    tax: Money.create(0, 'KES'),
    discount: Money.create(0, 'KES'),
    total: Money.create(1200, 'KES'),
    shippingAddressId: 'addr-1',
    billingAddressId: 'addr-2',
  };
  return Order.create({ ...defaults, ...overrides });
}

function makePayment(amount = 1200, currency = 'KES'): Payment {
  return Payment.create({
    id: 'payment-1',
    orderId: 'order-1',
    amount: Money.create(amount, currency),
    method: 'paystack',
    paystackRef: 'ref-abc123',
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Order aggregate', () => {
  // ─── Creation ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create an order in CREATED state', () => {
      const order = makeOrder();
      expect(order.state).toBe('CREATED');
    });

    it('should raise an OrderPlaced domain event on creation', () => {
      const order = makeOrder();
      const events = order.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(OrderPlaced);
      const placed = events[0] as OrderPlaced;
      expect(placed.orderId).toBe('order-1');
      expect(placed.customerId).toBe('customer-1');
      expect(placed.total).toBe(1200);
      expect(placed.currencyCode).toBe('KES');
    });

    it('should throw when created with no line items', () => {
      expect(() => makeOrder({ lines: [] })).toThrow('at least one line item');
    });

    it('should expose all properties correctly', () => {
      const order = makeOrder();
      expect(order.id).toBe('order-1');
      expect(order.customerId).toBe('customer-1');
      expect(order.total.amount).toBe(1200);
      expect(order.lines).toHaveLength(1);
      expect(order.shippingAddressId).toBe('addr-1');
      expect(order.billingAddressId).toBe('addr-2');
    });
  });

  // ─── State Transitions ─────────────────────────────────────────────────────

  describe('transitionTo', () => {
    it('should allow CREATED → PAYMENT_SETTLED', () => {
      const order = makeOrder();
      order.clearEvents();
      order.transitionTo('PAYMENT_SETTLED');
      expect(order.state).toBe('PAYMENT_SETTLED');
    });

    it('should allow CREATED → PAYMENT_PENDING', () => {
      const order = makeOrder();
      order.transitionTo('PAYMENT_PENDING');
      expect(order.state).toBe('PAYMENT_PENDING');
    });

    it('should allow CREATED → CANCELLED', () => {
      const order = makeOrder();
      order.transitionTo('CANCELLED');
      expect(order.state).toBe('CANCELLED');
    });

    it('should allow PAYMENT_SETTLED → SHIPPED', () => {
      const order = makeOrder();
      order.transitionTo('PAYMENT_SETTLED');
      order.transitionTo('SHIPPED');
      expect(order.state).toBe('SHIPPED');
    });

    it('should allow SHIPPED → DELIVERED', () => {
      const order = makeOrder();
      order.transitionTo('PAYMENT_SETTLED');
      order.transitionTo('SHIPPED');
      order.transitionTo('DELIVERED');
      expect(order.state).toBe('DELIVERED');
    });

    it('should raise an OrderStateChanged event on each transition', () => {
      const order = makeOrder();
      order.clearEvents();
      order.transitionTo('PAYMENT_SETTLED');
      const events = order.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(OrderStateChanged);
      const changed = events[0] as OrderStateChanged;
      expect(changed.orderId).toBe('order-1');
      expect(changed.fromState).toBe('CREATED');
      expect(changed.toState).toBe('PAYMENT_SETTLED');
    });

    it('should throw InvalidStateTransitionError for CREATED → FULFILLED (invalid)', () => {
      const order = makeOrder();
      expect(() => order.transitionTo('DELIVERED')).toThrow(InvalidStateTransitionError);
    });

    it('should throw InvalidStateTransitionError for DELIVERED → CREATED (invalid)', () => {
      const order = makeOrder();
      order.transitionTo('PAYMENT_SETTLED');
      order.transitionTo('SHIPPED');
      order.transitionTo('DELIVERED');
      expect(() => order.transitionTo('CREATED' as OrderState)).toThrow(InvalidStateTransitionError);
    });

    it('should throw InvalidStateTransitionError for CANCELLED → any state', () => {
      const order = makeOrder();
      order.transitionTo('CANCELLED');
      expect(() => order.transitionTo('CREATED' as OrderState)).toThrow(InvalidStateTransitionError);
      expect(() => order.transitionTo('PAYMENT_SETTLED')).toThrow(InvalidStateTransitionError);
    });
  });

  // ─── settlePayment ─────────────────────────────────────────────────────────

  describe('settlePayment', () => {
    it('should settle payment and transition to PAYMENT_SETTLED', () => {
      const order = makeOrder();
      order.clearEvents();
      const payment = makePayment(1200, 'KES');
      order.settlePayment(payment);
      expect(order.state).toBe('PAYMENT_SETTLED');
      expect(order.payment).toBe(payment);
    });

    it('should raise OrderStateChanged and PaymentSettled events', () => {
      const order = makeOrder();
      order.clearEvents();
      const payment = makePayment(1200, 'KES');
      order.settlePayment(payment);
      const events = order.domainEvents;
      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(OrderStateChanged);
      expect(events[1]).toBeInstanceOf(PaymentSettled);
      const settled = events[1] as PaymentSettled;
      expect(settled.orderId).toBe('order-1');
      expect(settled.amount).toBe(1200);
      expect(settled.currencyCode).toBe('KES');
    });

    it('should throw when payment amount does not match order total', () => {
      const order = makeOrder();
      const payment = makePayment(999, 'KES'); // wrong amount
      expect(() => order.settlePayment(payment)).toThrow('does not match order total');
    });

    it('should throw when payment currency does not match order currency', () => {
      const order = makeOrder();
      const payment = makePayment(1200, 'USD'); // wrong currency
      expect(() => order.settlePayment(payment)).toThrow('does not match order currency');
    });

    it('should throw when order is already PAYMENT_SETTLED', () => {
      const order = makeOrder();
      const payment = makePayment(1200, 'KES');
      order.settlePayment(payment);
      const payment2 = makePayment(1200, 'KES');
      expect(() => order.settlePayment(payment2)).toThrow(InvalidStateTransitionError);
    });

    it('should throw when order is CANCELLED', () => {
      const order = makeOrder();
      order.transitionTo('CANCELLED');
      const payment = makePayment(1200, 'KES');
      expect(() => order.settlePayment(payment)).toThrow(InvalidStateTransitionError);
    });
  });

  // ─── isCancellable ─────────────────────────────────────────────────────────

  describe('isCancellable', () => {
    it('should be cancellable in CREATED state', () => {
      const order = makeOrder();
      expect(order.isCancellable()).toBe(true);
    });

    it('should be cancellable in PAYMENT_PENDING state', () => {
      const order = makeOrder();
      order.transitionTo('PAYMENT_PENDING');
      expect(order.isCancellable()).toBe(true);
    });

    it('should not be cancellable in PAYMENT_SETTLED state', () => {
      const order = makeOrder();
      order.transitionTo('PAYMENT_SETTLED');
      expect(order.isCancellable()).toBe(false);
    });

    it('should not be cancellable in DELIVERED state', () => {
      const order = makeOrder();
      order.transitionTo('PAYMENT_SETTLED');
      order.transitionTo('SHIPPED');
      order.transitionTo('DELIVERED');
      expect(order.isCancellable()).toBe(false);
    });
  });

  // ─── Domain Events ─────────────────────────────────────────────────────────

  describe('domain events', () => {
    it('should accumulate events across multiple operations', () => {
      const order = makeOrder(); // OrderPlaced
      order.transitionTo('PAYMENT_PENDING'); // OrderStateChanged
      expect(order.domainEvents).toHaveLength(2);
    });

    it('should clear events after clearEvents()', () => {
      const order = makeOrder();
      order.clearEvents();
      expect(order.domainEvents).toHaveLength(0);
    });

    it('should return a readonly array of events', () => {
      const order = makeOrder();
      const events = order.domainEvents;
      expect(() => {
        // @ts-expect-error testing readonly enforcement
        events.push(null);
      }).toThrow();
    });
  });

  // ─── reconstitute ──────────────────────────────────────────────────────────

  describe('reconstitute', () => {
    it('should reconstitute an order without raising domain events', () => {
      const order = Order.reconstitute({
        id: 'order-1',
        code: OrderCode.create('ORD-123456-789'),
        customerId: 'customer-1',
        state: 'PAYMENT_SETTLED',
        lines: [makeOrderLine()],
        subTotal: Money.create(1000, 'KES'),
        shipping: Money.create(200, 'KES'),
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
        total: Money.create(1200, 'KES'),
        currencyCode: 'KES',
        shippingAddressId: 'addr-1',
        billingAddressId: 'addr-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(order.state).toBe('PAYMENT_SETTLED');
      expect(order.domainEvents).toHaveLength(0);
    });
  });
});
