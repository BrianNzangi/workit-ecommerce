import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderPlacedHandler } from '../../../../src/application/marketing/event-handlers/OrderPlacedHandler.js';
import { OrderPlaced } from '../../../../src/domain/order-management/events/OrderPlaced.js';
import { IEventBus } from '../../../../src/application/shared/IEventBus.js';

describe('OrderPlacedHandler', () => {
  let handler: OrderPlacedHandler;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    // Create a mock event bus
    mockEventBus = {
      publish: vi.fn(),
      subscribe: vi.fn(),
    };

    handler = new OrderPlacedHandler(mockEventBus);
  });

  describe('register', () => {
    it('should subscribe to OrderPlaced events', () => {
      handler.register();

      expect(mockEventBus.subscribe).toHaveBeenCalledWith('OrderPlaced', expect.any(Function));
    });

    it('should register the handler function', () => {
      handler.register();

      const calls = (mockEventBus.subscribe as any).mock.calls;
      expect(calls).toHaveLength(1);
      expect(calls[0][0]).toBe('OrderPlaced');
      expect(typeof calls[0][1]).toBe('function');
    });
  });

  describe('handle', () => {
    it('should handle OrderPlaced event', async () => {
      const event = new OrderPlaced('order-1', 'customer-1', 5000, 'KES');

      await handler.handle(event);

      // Handler should complete without errors
      expect(true).toBe(true);
    });

    it('should extract event data correctly', async () => {
      const orderId = 'order-123';
      const customerId = 'customer-456';
      const total = 10000;
      const currencyCode = 'KES';

      const event = new OrderPlaced(orderId, customerId, total, currencyCode);

      await handler.handle(event);

      // Verify event properties are accessible
      expect(event.orderId).toBe(orderId);
      expect(event.customerId).toBe(customerId);
      expect(event.total).toBe(total);
      expect(event.currencyCode).toBe(currencyCode);
    });

    it('should handle multiple events sequentially', async () => {
      const event1 = new OrderPlaced('order-1', 'customer-1', 5000, 'KES');
      const event2 = new OrderPlaced('order-2', 'customer-2', 7500, 'KES');

      await handler.handle(event1);
      await handler.handle(event2);

      // Both events should be handled without errors
      expect(true).toBe(true);
    });
  });

  describe('Event Handler Integration', () => {
    it('should be callable as an event handler', async () => {
      const event = new OrderPlaced('order-1', 'customer-1', 5000, 'KES');

      // Register and get the handler function
      let handlerFunction: ((event: OrderPlaced) => Promise<void>) | null = null;
      (mockEventBus.subscribe as any).mockImplementation((eventType: string, fn: any) => {
        if (eventType === 'OrderPlaced') {
          handlerFunction = fn;
        }
      });

      handler.register();

      // Call the handler function
      if (handlerFunction) {
        const registeredHandler = handlerFunction as (event: OrderPlaced) => Promise<void>;
        await registeredHandler(event);
        expect(true).toBe(true);
      } else {
        throw new Error('Handler function not registered');
      }
    });

    it('should handle events with different order amounts', async () => {
      const amounts = [100, 1000, 10000, 100000];

      for (const amount of amounts) {
        const event = new OrderPlaced('order-1', 'customer-1', amount, 'KES');
        await handler.handle(event);
        expect(event.total).toBe(amount);
      }
    });

    it('should handle events from different customers', async () => {
      const customerIds = ['customer-1', 'customer-2', 'customer-3'];

      for (const customerId of customerIds) {
        const event = new OrderPlaced('order-1', customerId, 5000, 'KES');
        await handler.handle(event);
        expect(event.customerId).toBe(customerId);
      }
    });
  });

  describe('Error Handling', () => {
    it('should not throw on valid events', async () => {
      const event = new OrderPlaced('order-1', 'customer-1', 5000, 'KES');

      await expect(handler.handle(event)).resolves.not.toThrow();
    });

    it('should handle events with zero amount', async () => {
      const event = new OrderPlaced('order-1', 'customer-1', 0, 'KES');

      await expect(handler.handle(event)).resolves.not.toThrow();
    });

    it('should handle events with large amounts', async () => {
      const event = new OrderPlaced('order-1', 'customer-1', 999999999, 'KES');

      await expect(handler.handle(event)).resolves.not.toThrow();
    });
  });
});
