/**
 * Base class for all domain events.
 * A domain event represents something significant that happened in the domain.
 */
export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly eventType: string;

  constructor(eventType: string) {
    this.occurredAt = new Date();
    this.eventType = eventType;
  }
}
