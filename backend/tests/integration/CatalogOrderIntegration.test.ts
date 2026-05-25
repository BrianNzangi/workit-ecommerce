/**
 * Integration tests for Catalog ↔ Order Management context integration.
 *
 * Tests verify:
 * - Stock allocation during order placement (StockAllocationService)
 * - ProductStockChanged event publishing and handling
 * - Cross-context event flow between Catalog and Order Management
 *
 * Requirements: 22.1, 22.4
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Product } from '../../src/domain/catalog/entities/Product.js';
import { ProductSKU } from '../../src/domain/catalog/value-objects/ProductSKU.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';
import { StockAllocationService } from '../../src/domain/catalog/services/StockAllocationService.js';
import { ProductStockChanged } from '../../src/domain/catalog/events/ProductStockChanged.js';
import { InsufficientStockError } from '../../src/domain/catalog/errors/InsufficientStockError.js';
import { EventBus } from '../../src/infrastructure/events/EventBus.js';
import { ProductStockChangedHandler } from '../../src/application/order-management/event-handlers/ProductStockChangedHandler.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeProduct(id: string, stock: number, name = `Product ${id}`): Product {
  return Product.create({
    id,
    sku: ProductSKU.create(`SKU-${id.toUpperCase().replace(/-/g, '')}`),
    name,
    slug: `product-${id}`,
    originalPrice: Money.create(1000, 'KES'),
    stockOnHand: stock,
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Catalog ↔ Order Management Integration', () => {
  let allocationService: StockAllocationService;
  let eventBus: EventBus;

  beforeEach(() => {
    allocationService = new StockAllocationService();
    eventBus = new EventBus();
  });

  // ─── Stock Allocation During Order Placement ────────────────────────────────

  describe('stock allocation during order placement', () => {
    it('should allocate stock for a single product', () => {
      const product = makeProduct('p1', 10);
      const products = new Map([['p1', product]]);

      allocationService.allocateStock(products, [{ productId: 'p1', quantity: 3 }]);

      expect(product.stockOnHand).toBe(7);
    });

    it('should allocate stock for multiple products in a single order', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 5);
      const products = new Map([
        ['p1', p1],
        ['p2', p2],
      ]);

      allocationService.allocateStock(products, [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 3 },
      ]);

      expect(p1.stockOnHand).toBe(8);
      expect(p2.stockOnHand).toBe(2);
    });

    it('should fail the entire allocation when one product has insufficient stock', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 1); // only 1 available
      const products = new Map([
        ['p1', p1],
        ['p2', p2],
      ]);

      expect(() =>
        allocationService.allocateStock(products, [
          { productId: 'p1', quantity: 5 },
          { productId: 'p2', quantity: 3 }, // exceeds stock
        ]),
      ).toThrow(InsufficientStockError);

      // Neither product should be modified (atomic rollback)
      expect(p1.stockOnHand).toBe(10);
      expect(p2.stockOnHand).toBe(1);
    });

    it('should handle concurrent allocations correctly (sequential)', () => {
      const product = makeProduct('p1', 10);
      const products = new Map([['p1', product]]);

      // First order allocates 4
      allocationService.allocateStock(products, [{ productId: 'p1', quantity: 4 }]);
      expect(product.stockOnHand).toBe(6);

      // Second order allocates 3
      allocationService.allocateStock(products, [{ productId: 'p1', quantity: 3 }]);
      expect(product.stockOnHand).toBe(3);

      // Third order tries to allocate 5 — should fail
      expect(() =>
        allocationService.allocateStock(products, [{ productId: 'p1', quantity: 5 }]),
      ).toThrow(InsufficientStockError);

      // Stock should remain at 3
      expect(product.stockOnHand).toBe(3);
    });
  });

  // ─── ProductStockChanged Event Publishing ───────────────────────────────────

  describe('ProductStockChanged event publishing', () => {
    it('should raise ProductStockChanged event after stock reservation', () => {
      const product = makeProduct('p1', 10);
      const products = new Map([['p1', product]]);

      allocationService.allocateStock(products, [{ productId: 'p1', quantity: 3 }]);

      const events = product.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductStockChanged);

      const event = events[0] as ProductStockChanged;
      expect(event.productId).toBe('p1');
      expect(event.previousStock).toBe(10);
      expect(event.newStock).toBe(7);
      expect(event.eventType).toBe('ProductStockChanged');
    });

    it('should raise ProductStockChanged event after stock release', () => {
      const product = makeProduct('p1', 5);

      product.releaseStock(3);

      const events = product.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductStockChanged);

      const event = events[0] as ProductStockChanged;
      expect(event.previousStock).toBe(5);
      expect(event.newStock).toBe(8);
    });

    it('should raise one event per product in a multi-product allocation', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 5);
      const products = new Map([
        ['p1', p1],
        ['p2', p2],
      ]);

      allocationService.allocateStock(products, [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 1 },
      ]);

      expect(p1.domainEvents).toHaveLength(1);
      expect(p2.domainEvents).toHaveLength(1);
    });

    it('should NOT raise events when allocation fails', () => {
      const p1 = makeProduct('p1', 10);
      const p2 = makeProduct('p2', 1);
      const products = new Map([
        ['p1', p1],
        ['p2', p2],
      ]);

      try {
        allocationService.allocateStock(products, [
          { productId: 'p1', quantity: 5 },
          { productId: 'p2', quantity: 3 },
        ]);
      } catch {
        // expected
      }

      expect(p1.domainEvents).toHaveLength(0);
      expect(p2.domainEvents).toHaveLength(0);
    });
  });

  // ─── Event Bus Integration ──────────────────────────────────────────────────

  describe('EventBus integration with ProductStockChanged', () => {
    it('should deliver ProductStockChanged events to subscribed handlers', async () => {
      const receivedEvents: ProductStockChanged[] = [];

      eventBus.subscribe<ProductStockChanged>('ProductStockChanged', async (event) => {
        receivedEvents.push(event);
      });

      const product = makeProduct('p1', 10);
      product.reserveStock(3);

      await eventBus.publish(product.domainEvents as ProductStockChanged[]);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].productId).toBe('p1');
      expect(receivedEvents[0].previousStock).toBe(10);
      expect(receivedEvents[0].newStock).toBe(7);
    });

    it('should deliver events to multiple subscribers', async () => {
      const handler1Calls: string[] = [];
      const handler2Calls: string[] = [];

      eventBus.subscribe<ProductStockChanged>('ProductStockChanged', async (event) => {
        handler1Calls.push(event.productId);
      });
      eventBus.subscribe<ProductStockChanged>('ProductStockChanged', async (event) => {
        handler2Calls.push(event.productId);
      });

      const product = makeProduct('p1', 10);
      product.reserveStock(2);

      await eventBus.publish(product.domainEvents as ProductStockChanged[]);

      expect(handler1Calls).toContain('p1');
      expect(handler2Calls).toContain('p1');
    });
  });

  // ─── ProductStockChangedHandler ─────────────────────────────────────────────

  describe('ProductStockChangedHandler', () => {
    it('should register with the event bus and handle events', async () => {
      const handler = new ProductStockChangedHandler(eventBus);
      handler.register();

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const product = makeProduct('p1', 10);
      product.reserveStock(3);

      await eventBus.publish([...product.domainEvents]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ProductStockChanged'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('p1'),
      );

      consoleSpy.mockRestore();
    });

    it('should log stock decrease correctly', async () => {
      const handler = new ProductStockChangedHandler(eventBus);
      handler.register();

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const product = makeProduct('p1', 10);
      product.reserveStock(4); // stock decreases

      await eventBus.publish([...product.domainEvents]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('decreased'),
      );

      consoleSpy.mockRestore();
    });

    it('should log stock increase correctly', async () => {
      const handler = new ProductStockChangedHandler(eventBus);
      handler.register();

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const product = makeProduct('p1', 5);
      product.releaseStock(3); // stock increases

      await eventBus.publish([...product.domainEvents]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('increased'),
      );

      consoleSpy.mockRestore();
    });
  });
});
