import { DomainEvent } from '../../shared/DomainEvent.js';

/**
 * Raised when a new Customer account is successfully created.
 */
export class CustomerRegistered extends DomainEvent {
  constructor(
    public readonly customerId: string,
    public readonly email: string,
    public readonly name: string,
  ) {
    super('CustomerRegistered');
  }
}
