import { describe, it, expect } from 'vitest';
import { Product } from '../../../../src/domain/catalog/entities/Product.js';
import { ProductSKU } from '../../../../src/domain/catalog/value-objects/ProductSKU.js';
import { Money } from '../../../../src/domain/order-management/value-objects/Money.js';
import { InsufficientStockError } from '../../../../src/domain/catalog/errors/InsufficientStockError.js';
import { ProductStockChanged } from '../../../../src/domain/catalog/events/ProductStockChanged.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeProduct(overrides: Partial<Parameters<typeof Product.create>[0]> = {}): Product {
  return Product.create({
    id: 'prod-1',
    sku: ProductSKU.create('SHOE-RED-42'),
    name: 'Red Shoe',
    slug: 'red-shoe',
    description: 'A nice red shoe',
    shortDescription: 'A nice red shoe',
    originalPrice: Money.create(2000, 'KES'),
    salePrice: Money.create(1500, 'KES'),
    stockOnHand: 10,
    enabled: true,
    ...overrides,
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Product', () => {
  // ─── Creation ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a product with valid parameters', () => {
      const product = makeProduct();
      expect(product.id).toBe('prod-1');
      expect(product.name).toBe('Red Shoe');
      expect(product.stockOnHand).toBe(10);
      expect(product.enabled).toBe(true);
    });

    it('should default enabled to true when not specified', () => {
      const product = Product.create({
        id: 'prod-2',
        name: 'Blue Shoe',
        slug: 'blue-shoe',
        stockOnHand: 5,
      });
      expect(product.enabled).toBe(true);
    });

    it('should default condition to NEW when not specified', () => {
      const product = makeProduct({ condition: undefined });
      expect(product.condition).toBe('NEW');
    });

    it('should allow zero stock on creation', () => {
      const product = makeProduct({ stockOnHand: 0 });
      expect(product.stockOnHand).toBe(0);
    });

    it('should throw when stock is negative', () => {
      expect(() => makeProduct({ stockOnHand: -1 })).toThrow(
        'Product stock cannot be negative',
      );
    });

    it('should throw when sale price exceeds original price', () => {
      expect(() =>
        makeProduct({
          originalPrice: Money.create(1000, 'KES'),
          salePrice: Money.create(1500, 'KES'),
        }),
      ).toThrow('Sale price');
    });

    it('should allow sale price equal to original price', () => {
      const product = makeProduct({
        originalPrice: Money.create(1000, 'KES'),
        salePrice: Money.create(1000, 'KES'),
      });
      expect(product.salePrice?.amount).toBe(1000);
    });

    it('should allow null sale price', () => {
      const product = makeProduct({ salePrice: null });
      expect(product.salePrice).toBeNull();
    });

    it('should allow null original price', () => {
      const product = makeProduct({ originalPrice: null, salePrice: null });
      expect(product.originalPrice).toBeNull();
    });
  });

  // ─── currentPrice ──────────────────────────────────────────────────────────

  describe('currentPrice', () => {
    it('should return sale price when set', () => {
      const product = makeProduct({
        originalPrice: Money.create(2000, 'KES'),
        salePrice: Money.create(1500, 'KES'),
      });
      expect(product.currentPrice?.amount).toBe(1500);
    });

    it('should return original price when sale price is null', () => {
      const product = makeProduct({
        originalPrice: Money.create(2000, 'KES'),
        salePrice: null,
      });
      expect(product.currentPrice?.amount).toBe(2000);
    });

    it('should return null when both prices are null', () => {
      const product = makeProduct({ originalPrice: null, salePrice: null });
      expect(product.currentPrice).toBeNull();
    });
  });

  // ─── reserveStock ──────────────────────────────────────────────────────────

  describe('reserveStock', () => {
    it('should decrement stock by the requested quantity', () => {
      const product = makeProduct({ stockOnHand: 10 });
      product.reserveStock(3);
      expect(product.stockOnHand).toBe(7);
    });

    it('should allow reserving all available stock', () => {
      const product = makeProduct({ stockOnHand: 5 });
      product.reserveStock(5);
      expect(product.stockOnHand).toBe(0);
    });

    it('should raise a ProductStockChanged event', () => {
      const product = makeProduct({ stockOnHand: 10 });
      product.reserveStock(3);

      const events = product.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductStockChanged);

      const event = events[0] as ProductStockChanged;
      expect(event.productId).toBe('prod-1');
      expect(event.previousStock).toBe(10);
      expect(event.newStock).toBe(7);
    });

    it('should throw InsufficientStockError when quantity exceeds stock', () => {
      const product = makeProduct({ stockOnHand: 3 });
      expect(() => product.reserveStock(5)).toThrow(InsufficientStockError);
    });

    it('should throw InsufficientStockError when stock is zero', () => {
      const product = makeProduct({ stockOnHand: 0 });
      expect(() => product.reserveStock(1)).toThrow(InsufficientStockError);
    });

    it('should throw when quantity is zero', () => {
      const product = makeProduct({ stockOnHand: 10 });
      expect(() => product.reserveStock(0)).toThrow('positive integer');
    });

    it('should throw when quantity is negative', () => {
      const product = makeProduct({ stockOnHand: 10 });
      expect(() => product.reserveStock(-1)).toThrow('positive integer');
    });

    it('should throw when quantity is a non-integer', () => {
      const product = makeProduct({ stockOnHand: 10 });
      expect(() => product.reserveStock(1.5)).toThrow('positive integer');
    });

    it('should NOT modify stock when InsufficientStockError is thrown', () => {
      const product = makeProduct({ stockOnHand: 3 });
      try {
        product.reserveStock(5);
      } catch {
        // expected
      }
      expect(product.stockOnHand).toBe(3);
    });

    it('should NOT raise events when reservation fails', () => {
      const product = makeProduct({ stockOnHand: 3 });
      try {
        product.reserveStock(5);
      } catch {
        // expected
      }
      expect(product.domainEvents).toHaveLength(0);
    });
  });

  // ─── releaseStock ──────────────────────────────────────────────────────────

  describe('releaseStock', () => {
    it('should increment stock by the released quantity', () => {
      const product = makeProduct({ stockOnHand: 5 });
      product.releaseStock(3);
      expect(product.stockOnHand).toBe(8);
    });

    it('should raise a ProductStockChanged event', () => {
      const product = makeProduct({ stockOnHand: 5 });
      product.releaseStock(3);

      const events = product.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductStockChanged);

      const event = events[0] as ProductStockChanged;
      expect(event.productId).toBe('prod-1');
      expect(event.previousStock).toBe(5);
      expect(event.newStock).toBe(8);
    });

    it('should allow releasing stock when current stock is zero', () => {
      const product = makeProduct({ stockOnHand: 0 });
      product.releaseStock(5);
      expect(product.stockOnHand).toBe(5);
    });

    it('should throw when quantity is zero', () => {
      const product = makeProduct({ stockOnHand: 5 });
      expect(() => product.releaseStock(0)).toThrow('positive integer');
    });

    it('should throw when quantity is negative', () => {
      const product = makeProduct({ stockOnHand: 5 });
      expect(() => product.releaseStock(-1)).toThrow('positive integer');
    });

    it('should throw when quantity is a non-integer', () => {
      const product = makeProduct({ stockOnHand: 5 });
      expect(() => product.releaseStock(2.5)).toThrow('positive integer');
    });
  });

  // ─── Invariant: non-negative stock ────────────────────────────────────────

  describe('non-negative stock invariant', () => {
    it('should never allow stock to go below zero via reserveStock', () => {
      const product = makeProduct({ stockOnHand: 2 });
      expect(() => product.reserveStock(3)).toThrow(InsufficientStockError);
      expect(product.stockOnHand).toBe(2); // unchanged
    });

    it('should enforce non-negative stock on reconstitution', () => {
      expect(() =>
        Product.reconstitute({
          id: 'prod-x',
          sku: null,
          name: 'Test',
          slug: 'test',
          description: null,
          shortDescription: null,
          originalPrice: null,
          salePrice: null,
          stockOnHand: -5,
          enabled: true,
          condition: 'NEW',
          brandId: null,
          shippingMethodId: null,
          vat: 0,
          vatInclusive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ).toThrow('negative');
    });
  });

  // ─── Invariant: sale price <= original price ───────────────────────────────

  describe('price invariant', () => {
    it('should throw when sale price exceeds original price on reconstitution', () => {
      expect(() =>
        Product.reconstitute({
          id: 'prod-x',
          sku: null,
          name: 'Test',
          slug: 'test',
          description: null,
          shortDescription: null,
          originalPrice: Money.create(1000, 'KES'),
          salePrice: Money.create(2000, 'KES'),
          stockOnHand: 5,
          enabled: true,
          condition: 'NEW',
          brandId: null,
          shippingMethodId: null,
          vat: 0,
          vatInclusive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
      ).toThrow('Sale price');
    });
  });

  // ─── Domain Events ─────────────────────────────────────────────────────────

  describe('domain events', () => {
    it('should accumulate multiple events', () => {
      const product = makeProduct({ stockOnHand: 10 });
      product.reserveStock(2);
      product.reserveStock(3);

      expect(product.domainEvents).toHaveLength(2);
    });

    it('should clear events after clearEvents()', () => {
      const product = makeProduct({ stockOnHand: 10 });
      product.reserveStock(2);
      product.clearEvents();

      expect(product.domainEvents).toHaveLength(0);
    });

    it('should include correct event type string', () => {
      const product = makeProduct({ stockOnHand: 10 });
      product.reserveStock(1);

      expect(product.domainEvents[0].eventType).toBe('ProductStockChanged');
    });
  });

  // ─── updatePrices ──────────────────────────────────────────────────────────

  describe('updatePrices', () => {
    it('should update prices when valid', () => {
      const product = makeProduct();
      product.updatePrices(Money.create(3000, 'KES'), Money.create(2500, 'KES'));
      expect(product.originalPrice?.amount).toBe(3000);
      expect(product.salePrice?.amount).toBe(2500);
    });

    it('should throw when new sale price exceeds new original price', () => {
      const product = makeProduct();
      expect(() =>
        product.updatePrices(Money.create(1000, 'KES'), Money.create(2000, 'KES')),
      ).toThrow('Sale price');
    });

    it('should allow setting both prices to null', () => {
      const product = makeProduct();
      product.updatePrices(null, null);
      expect(product.originalPrice).toBeNull();
      expect(product.salePrice).toBeNull();
    });
  });
});
