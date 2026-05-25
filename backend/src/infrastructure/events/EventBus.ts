import { DomainEvent } from '../../domain/shared/DomainEvent.js';
import { IEventBus, EventHandler } from '../../application/shared/IEventBus.js';

/**
 * In-process synchronous event bus implementation.
 * Dispatches domain events to all registered handlers for a given event type.
 */
export class EventBus implements IEventBus {
  private readonly handlers: Map<string, EventHandler[]> = new Map();

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler as EventHandler]);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventHandlers = this.handlers.get(event.eventType) ?? [];
      for (const handler of eventHandlers) {
        await handler(event);
      }
    }
  }
}
