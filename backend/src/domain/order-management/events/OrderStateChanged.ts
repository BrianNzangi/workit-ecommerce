import { DomainEvent } from '../../shared/DomainEvent.js';

/**
 * Raised whenever an Order transitions from one state to another.
 */
export class OrderStateChanged extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly fromState: string,
    public readonly toState: string,
  ) {
    super('OrderStateChanged');
  }
}
