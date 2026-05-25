import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../src/infrastructure/events/EventBus.js';
import { DomainEvent } from '../../src/domain/shared/DomainEvent.js';

class OrderPlacedEvent extends DomainEvent {
  constructor(public readonly orderId: string) {
    super('OrderPlaced');
  }
}

class PaymentSettledEvent extends DomainEvent {
  constructor(public readonly orderId: string) {
    super('PaymentSettled');
  }
}

describe('EventBus', () => {
  it('should call a subscribed handler when an event is published', async () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe('OrderPlaced', handler);
    await bus.publish([new OrderPlacedEvent('order-1')]);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0]).toBeInstanceOf(OrderPlacedEvent);
  });

  it('should call multiple handlers for the same event type', async () => {
    const bus = new EventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.subscribe('OrderPlaced', handler1);
    bus.subscribe('OrderPlaced', handler2);
    await bus.publish([new OrderPlacedEvent('order-1')]);

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('should only call handlers for the matching event type', async () => {
    const bus = new EventBus();
    const orderHandler = vi.fn();
    const paymentHandler = vi.fn();

    bus.subscribe('OrderPlaced', orderHandler);
    bus.subscribe('PaymentSettled', paymentHandler);

    await bus.publish([new OrderPlacedEvent('order-1')]);

    expect(orderHandler).toHaveBeenCalledOnce();
    expect(paymentHandler).not.toHaveBeenCalled();
  });

  it('should publish multiple events in order', async () => {
    const bus = new EventBus();
    const calls: string[] = [];

    bus.subscribe('OrderPlaced', async (e) => {
      calls.push(`order:${(e as OrderPlacedEvent).orderId}`);
    });
    bus.subscribe('PaymentSettled', async (e) => {
      calls.push(`payment:${(e as PaymentSettledEvent).orderId}`);
    });

    await bus.publish([
      new OrderPlacedEvent('order-1'),
      new PaymentSettledEvent('order-1'),
    ]);

    expect(calls).toEqual(['order:order-1', 'payment:order-1']);
  });

  it('should not call handlers when no events are published', async () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe('OrderPlaced', handler);
    await bus.publish([]);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle async handlers', async () => {
    const bus = new EventBus();
    let resolved = false;

    bus.subscribe('OrderPlaced', async () => {
      await new Promise((r) => setTimeout(r, 10));
      resolved = true;
    });

    await bus.publish([new OrderPlacedEvent('order-1')]);
    expect(resolved).toBe(true);
  });
});
