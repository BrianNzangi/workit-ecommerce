import { DomainEvent } from '../../shared/DomainEvent.js';

/**
 * Raised when payment for an Order is successfully verified and settled.
 */
export class PaymentSettled extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly amount: number,
    public readonly currencyCode: string,
    public readonly paymentReference: string,
  ) {
    super('PaymentSettled');
  }
}
