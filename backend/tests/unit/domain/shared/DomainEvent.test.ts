import { describe, it, expect } from 'vitest';
import { DomainEvent } from '../../../../src/domain/shared/DomainEvent.js';

class TestEvent extends DomainEvent {
  constructor(public readonly payload: string) {
    super('TestEvent');
  }
}

describe('DomainEvent', () => {
  it('should set the eventType', () => {
    const event = new TestEvent('hello');
    expect(event.eventType).toBe('TestEvent');
  });

  it('should set occurredAt to current time', () => {
    const before = new Date();
    const event = new TestEvent('hello');
    const after = new Date();
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should carry payload data', () => {
    const event = new TestEvent('my-payload');
    expect(event.payload).toBe('my-payload');
  });
});
