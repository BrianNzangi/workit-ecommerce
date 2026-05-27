import { describe, it, expect } from 'vitest';
import { Cart } from '../../../../src/domain/order-management/aggregates/Cart.js';
import { CartLine } from '../../../../src/domain/order-management/entities/CartLine.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCart(overrides: Partial<Parameters<typeof Cart.create>[0]> = {}): Cart {
  return Cart.create({ id: 'cart-1', customerId: 'customer-1', ...overrides });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Cart aggregate', () => {
  // ─── Creation ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a cart for an authenticated customer', () => {
      const cart = Cart.create({ id: 'cart-1', customerId: 'customer-1' });
      expect(cart.id).toBe('cart-1');
      expect(cart.customerId).toBe('customer-1');
      expect(cart.guestId).toBeUndefined();
    });

    it('should create a cart for a guest session', () => {
      const cart = Cart.create({ id: 'cart-1', guestId: 'guest-abc' });
      expect(cart.guestId).toBe('guest-abc');
      expect(cart.customerId).toBeUndefined();
    });

    it('should start with an empty lines array', () => {
      const cart = makeCart();
      expect(cart.lines).toHaveLength(0);
      expect(cart.isEmpty()).toBe(true);
    });

    it('should throw when neither customerId nor guestId is provided', () => {
      expect(() => Cart.create({ id: 'cart-1' })).toThrow(
        'Cart must belong to either a customer or a guest session',
      );
    });
  });

  // ─── addLine ───────────────────────────────────────────────────────────────

  describe('addLine', () => {
    it('should add a new line item', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 2 });
      expect(cart.lines).toHaveLength(1);
      expect(cart.lines[0].productId).toBe('prod-1');
      expect(cart.lines[0].quantity).toBe(2);
    });

    it('should merge quantities when the same product is added again', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 2 });
      cart.addLine({ id: 'line-2', productId: 'prod-1', quantity: 3 });
      expect(cart.lines).toHaveLength(1);
      expect(cart.lines[0].quantity).toBe(5);
    });

    it('should merge quantities regardless of variant', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 1 });
      cart.addLine({ id: 'line-2', productId: 'prod-1', quantity: 1 });
      expect(cart.lines).toHaveLength(1);
      expect(cart.lines[0].quantity).toBe(2);
    });

    it('should add separate lines for different products', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 1 });
      cart.addLine({ id: 'line-2', productId: 'prod-2', quantity: 1 });
      expect(cart.lines).toHaveLength(2);
    });

    it('should throw for non-positive quantity', () => {
      const cart = makeCart();
      expect(() => cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 0 })).toThrow();
      expect(() => cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: -1 })).toThrow();
    });

    it('should throw for non-integer quantity', () => {
      const cart = makeCart();
      expect(() => cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 1.5 })).toThrow();
    });

    it('should update updatedAt when a line is added', () => {
      const cart = makeCart();
      const before = cart.updatedAt;
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 1 });
      expect(cart.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  // ─── updateLineQuantity ────────────────────────────────────────────────────

  describe('updateLineQuantity', () => {
    it('should update the quantity of an existing line', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 2 });
      cart.updateLineQuantity('line-1', 5);
      expect(cart.lines[0].quantity).toBe(5);
    });

    it('should throw when the line is not found', () => {
      const cart = makeCart();
      expect(() => cart.updateLineQuantity('nonexistent', 3)).toThrow('Cart line not found');
    });

    it('should throw for non-positive quantity', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 2 });
      expect(() => cart.updateLineQuantity('line-1', 0)).toThrow();
    });
  });

  // ─── removeLine ────────────────────────────────────────────────────────────

  describe('removeLine', () => {
    it('should remove an existing line', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 2 });
      cart.removeLine('line-1');
      expect(cart.lines).toHaveLength(0);
      expect(cart.isEmpty()).toBe(true);
    });

    it('should throw when the line is not found', () => {
      const cart = makeCart();
      expect(() => cart.removeLine('nonexistent')).toThrow('Cart line not found');
    });

    it('should only remove the specified line', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 1 });
      cart.addLine({ id: 'line-2', productId: 'prod-2', quantity: 1 });
      cart.removeLine('line-1');
      expect(cart.lines).toHaveLength(1);
      expect(cart.lines[0].productId).toBe('prod-2');
    });
  });

  // ─── clear ─────────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('should remove all lines', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 1 });
      cart.addLine({ id: 'line-2', productId: 'prod-2', quantity: 2 });
      cart.clear();
      expect(cart.lines).toHaveLength(0);
      expect(cart.isEmpty()).toBe(true);
    });

    it('should be a no-op on an already empty cart', () => {
      const cart = makeCart();
      expect(() => cart.clear()).not.toThrow();
      expect(cart.isEmpty()).toBe(true);
    });
  });

  // ─── totalQuantity ─────────────────────────────────────────────────────────

  describe('totalQuantity', () => {
    it('should return 0 for an empty cart', () => {
      const cart = makeCart();
      expect(cart.totalQuantity).toBe(0);
    });

    it('should sum quantities across all lines', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 3 });
      cart.addLine({ id: 'line-2', productId: 'prod-2', quantity: 2 });
      expect(cart.totalQuantity).toBe(5);
    });
  });

  // ─── validateForCheckout ───────────────────────────────────────────────────

  describe('validateForCheckout', () => {
    it('should not throw for a non-empty cart', () => {
      const cart = makeCart();
      cart.addLine({ id: 'line-1', productId: 'prod-1', quantity: 1 });
      expect(() => cart.validateForCheckout()).not.toThrow();
    });

    it('should throw for an empty cart', () => {
      const cart = makeCart();
      expect(() => cart.validateForCheckout()).toThrow('empty cart');
    });
  });

  // ─── assignToCustomer ──────────────────────────────────────────────────────

  describe('assignToCustomer', () => {
    it('should assign a guest cart to a customer', () => {
      const cart = Cart.create({ id: 'cart-1', guestId: 'guest-abc' });
      cart.assignToCustomer('customer-1');
      expect(cart.customerId).toBe('customer-1');
      expect(cart.guestId).toBeUndefined();
    });
  });

  // ─── reconstitute ──────────────────────────────────────────────────────────

  describe('reconstitute', () => {
    it('should reconstitute a cart with existing lines', () => {
      const line = CartLine.create({
        id: 'line-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 3,
      });
      const cart = Cart.reconstitute({
        id: 'cart-1',
        customerId: 'customer-1',
        lines: [line],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(cart.lines).toHaveLength(1);
      expect(cart.lines[0].quantity).toBe(3);
    });
  });
});
