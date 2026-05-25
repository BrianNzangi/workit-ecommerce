import { DomainEvent } from '../../domain/shared/DomainEvent.js';

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;

/**
 * Interface for the event bus that publishes and subscribes to domain events.
 */
export interface IEventBus {
  /**
   * Publish one or more domain events to all registered handlers.
   */
  publish(events: DomainEvent[]): Promise<void>;

  /**
   * Subscribe a handler to a specific event type.
   * @param eventType - The event type string to listen for
   * @param handler - The handler function to invoke when the event is published
   */
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
}
