import { describe, it, expect } from 'vitest';
import { AggregateRoot } from '../../../../src/domain/shared/AggregateRoot.js';
import { DomainEvent } from '../../../../src/domain/shared/DomainEvent.js';

class OrderCreatedEvent extends DomainEvent {
  constructor(public readonly orderId: string) {
    super('OrderCreated');
  }
}

class OrderCancelledEvent extends DomainEvent {
  constructor(public readonly orderId: string) {
    super('OrderCancelled');
  }
}

class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }

  doSomething(): void {
    this.addDomainEvent(new OrderCreatedEvent(this.id));
  }

  doSomethingElse(): void {
    this.addDomainEvent(new OrderCancelledEvent(this.id));
  }
}

describe('AggregateRoot', () => {
  it('should start with no domain events', () => {
    const aggregate = new TestAggregate('agg-1');
    expect(aggregate.domainEvents).toHaveLength(0);
  });

  it('should collect domain events when raised', () => {
    const aggregate = new TestAggregate('agg-1');
    aggregate.doSomething();
    expect(aggregate.domainEvents).toHaveLength(1);
    expect(aggregate.domainEvents[0].eventType).toBe('OrderCreated');
  });

  it('should collect multiple domain events', () => {
    const aggregate = new TestAggregate('agg-1');
    aggregate.doSomething();
    aggregate.doSomethingElse();
    expect(aggregate.domainEvents).toHaveLength(2);
  });

  it('should clear domain events', () => {
    const aggregate = new TestAggregate('agg-1');
    aggregate.doSomething();
    aggregate.clearEvents();
    expect(aggregate.domainEvents).toHaveLength(0);
  });

  it('should expose domain events as readonly array', () => {
    const aggregate = new TestAggregate('agg-1');
    aggregate.doSomething();
    const events = aggregate.domainEvents;
    expect(() => {
      // @ts-expect-error testing readonly at runtime
      events.push(new OrderCreatedEvent('other'));
    }).toThrow();
  });

  it('should inherit entity equality by id', () => {
    const a = new TestAggregate('agg-1');
    const b = new TestAggregate('agg-1');
    expect(a.equals(b)).toBe(true);
  });
});
