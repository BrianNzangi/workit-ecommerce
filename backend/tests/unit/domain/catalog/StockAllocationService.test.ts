import { describe, it, expect } from 'vitest';
import { StockAllocationService } from '../../../../src/domain/catalog/services/StockAllocationService.js';
import { Product } from '../../../../src/domain/catalog/entities/Product.js';
import { ProductSKU } from '../../../../src/domain/catalog/value-objects/ProductSKU.js';
import { Money } from '../../../../src/domain/order-management/value-objects/Money.js';
import { InsufficientStockError } from '../../../../src/domain/catalog/errors/InsufficientStockError.js';
import { ProductStockChanged } from '../../../../src/domain/catalog/events/ProductStockChanged.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeProduct(id: string, stock: number, name = `Product ${id}`): Product {
  return Product.create({
    id,
    sku: ProductSKU.create(`SKU-${id.toUpperCase()}`),
    name,
    slug: `product-${id}`,
    originalPrice: Money.create(1000, 'KES'),
    stockOnHand: stock,
  });
}

function makeProductMap(...products: Product[]): Map<string, Product> {
  return new Map(products.map((p) => [p.id, p]));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('StockAllocationService', () => {
  const service = new StockAllocationService();

  // ─── allocateStock ────────────────────────────────────────────────────────

  describe('allocateStock', () => {
    it('should reserve stock for a single product', () => {
      const product = makeProduct('p1', 10);
      const products = makeProductMap(product);

      service.allocateStock(products, [{ productId: 'p1', quantity: 3 }]);

      expect(product.stockOnHand).toBe(7);
    });

    it('should reserve stock for multiple products atomically', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 5);
      const products = makeProductMap(p1, p2);

      service.allocateStock(products, [
        { productId: 'p1', quantity: 3 },
        { productId: 'p2', quantity: 2 },
      ]);

      expect(p1.stockOnHand).toBe(7);
      expect(p2.stockOnHand).toBe(3);
    });

    it('should raise ProductStockChanged events for each allocated product', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 5);
      const products = makeProductMap(p1, p2);

      service.allocateStock(products, [
        { productId: 'p1', quantity: 3 },
        { productId: 'p2', quantity: 2 },
      ]);

      expect(p1.domainEvents).toHaveLength(1);
      expect(p1.domainEvents[0]).toBeInstanceOf(ProductStockChanged);

      expect(p2.domainEvents).toHaveLength(1);
      expect(p2.domainEvents[0]).toBeInstanceOf(ProductStockChanged);
    });

    it('should allow allocating all available stock', () => {
      const product = makeProduct('p1', 5);
      const products = makeProductMap(product);

      service.allocateStock(products, [{ productId: 'p1', quantity: 5 }]);

      expect(product.stockOnHand).toBe(0);
    });

    // ─── Validation before allocation (atomic rollback) ─────────────────────

    it('should throw InsufficientStockError when one product has insufficient stock', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 2); // only 2 available
      const products = makeProductMap(p1, p2);

      expect(() =>
        service.allocateStock(products, [
          { productId: 'p1', quantity: 3 },
          { productId: 'p2', quantity: 5 }, // exceeds stock
        ]),
      ).toThrow(InsufficientStockError);
    });

    it('should NOT modify any stock when validation fails (atomic rollback)', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 2);
      const products = makeProductMap(p1, p2);

      try {
        service.allocateStock(products, [
          { productId: 'p1', quantity: 3 },
          { productId: 'p2', quantity: 5 },
        ]);
      } catch {
        // expected
      }

      // Neither product should have been modified
      expect(p1.stockOnHand).toBe(10);
      expect(p2.stockOnHand).toBe(2);
    });

    it('should NOT raise any events when validation fails', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 2);
      const products = makeProductMap(p1, p2);

      try {
        service.allocateStock(products, [
          { productId: 'p1', quantity: 3 },
          { productId: 'p2', quantity: 5 },
        ]);
      } catch {
        // expected
      }

      expect(p1.domainEvents).toHaveLength(0);
      expect(p2.domainEvents).toHaveLength(0);
    });

    it('should throw when a product is not in the products map', () => {
      const products = makeProductMap(makeProduct('p1', 10));

      expect(() =>
        service.allocateStock(products, [{ productId: 'unknown', quantity: 1 }]),
      ).toThrow('Product not found');
    });

    it('should throw when quantity is zero', () => {
      const product = makeProduct('p1', 10);
      const products = makeProductMap(product);

      expect(() =>
        service.allocateStock(products, [{ productId: 'p1', quantity: 0 }]),
      ).toThrow('positive integer');
    });

    it('should throw when quantity is negative', () => {
      const product = makeProduct('p1', 10);
      const products = makeProductMap(product);

      expect(() =>
        service.allocateStock(products, [{ productId: 'p1', quantity: -1 }]),
      ).toThrow('positive integer');
    });

    it('should succeed with an empty requests array', () => {
      const products = makeProductMap(makeProduct('p1', 10));
      expect(() => service.allocateStock(products, [])).not.toThrow();
    });
  });

  // ─── releaseStock ─────────────────────────────────────────────────────────

  describe('releaseStock', () => {
    it('should release stock for a single product', () => {
      const product = makeProduct('p1', 5);
      const products = makeProductMap(product);

      service.releaseStock(products, [{ productId: 'p1', quantity: 3 }]);

      expect(product.stockOnHand).toBe(8);
    });

    it('should release stock for multiple products', () => {
      const p1 = makeProduct('p1', 5);
      const p2 = makeProduct('p2', 2);
      const products = makeProductMap(p1, p2);

      service.releaseStock(products, [
        { productId: 'p1', quantity: 3 },
        { productId: 'p2', quantity: 1 },
      ]);

      expect(p1.stockOnHand).toBe(8);
      expect(p2.stockOnHand).toBe(3);
    });

    it('should raise ProductStockChanged events on release', () => {
      const product = makeProduct('p1', 5);
      const products = makeProductMap(product);

      service.releaseStock(products, [{ productId: 'p1', quantity: 3 }]);

      expect(product.domainEvents).toHaveLength(1);
      expect(product.domainEvents[0]).toBeInstanceOf(ProductStockChanged);
    });

    it('should throw when a product is not in the products map', () => {
      const products = makeProductMap(makeProduct('p1', 10));

      expect(() =>
        service.releaseStock(products, [{ productId: 'unknown', quantity: 1 }]),
      ).toThrow('Product not found');
    });

    it('should throw when quantity is zero', () => {
      const product = makeProduct('p1', 5);
      const products = makeProductMap(product);

      expect(() =>
        service.releaseStock(products, [{ productId: 'p1', quantity: 0 }]),
      ).toThrow('positive integer');
    });
  });
});
