import { IEventBus } from '../../shared/IEventBus.js';
import { PaymentSettled } from '../../../domain/order-management/events/PaymentSettled.js';

/**
 * Event handler that subscribes to PaymentSettled events from the Order Management context.
 *
 * The Fulfillment context listens to these events to trigger order fulfillment workflows.
 * When a payment is settled, the fulfillment process can begin:
 * - Create fulfillment records
 * - Trigger shipping label generation
 * - Notify warehouse of new orders to pick and pack
 * - Send order confirmation to customer
 *
 * Requirements: 5.8
 */
export class PaymentSettledHandler {
  constructor(private readonly eventBus: IEventBus) {}

  /**
   * Register this handler with the event bus.
   * Call this once during application startup.
   */
  register(): void {
    this.eventBus.subscribe<PaymentSettled>(
      'PaymentSettled',
      this.handle.bind(this),
    );
  }

  /**
   * Handle a PaymentSettled event.
   *
   * @param event - The domain event from the Order Management context.
   */
  async handle(event: PaymentSettled): Promise<void> {
    const { orderId, customerId, amount, currencyCode, paymentReference } = event;

    // Log the payment settlement for observability
    console.info(
      `[Fulfillment] PaymentSettled: order=${orderId} customer=${customerId} ` +
        `amount=${amount} ${currencyCode} reference=${paymentReference}`,
    );

    // Future: Create fulfillment record for the order
    // Future: Trigger shipping label generation
    // Future: Notify warehouse system
    // Future: Send order confirmation email to customer
    // Future: Publish OrderFulfilled event when fulfillment is ready
  }
}
