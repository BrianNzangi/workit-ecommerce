import { DomainEvent } from '../../shared/DomainEvent.js';

/**
 * Raised when a new Order is successfully created from a Cart.
 */
export class OrderPlaced extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number,
    public readonly currencyCode: string,
  ) {
    super('OrderPlaced');
  }
}
