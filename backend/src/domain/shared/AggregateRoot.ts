import { Entity } from './Entity.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * Base class for all aggregate roots.
 * An aggregate root is the entry point to an aggregate and enforces invariants.
 * It collects domain events that are published after the transaction commits.
 */
export abstract class AggregateRoot<TId> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return Object.freeze([...this._domainEvents]);
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Clears all collected domain events. Called after events have been published.
   */
  clearEvents(): void {
    this._domainEvents = [];
  }
}
