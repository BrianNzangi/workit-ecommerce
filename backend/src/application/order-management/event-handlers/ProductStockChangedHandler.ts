import { IEventBus } from '../../shared/IEventBus.js';
import { ProductStockChanged } from '../../../domain/catalog/events/ProductStockChanged.js';

/**
 * Event handler that subscribes to ProductStockChanged events from the Catalog context.
 *
 * The Order Management context listens to these events to stay informed about
 * stock level changes. This enables future use cases such as:
 * - Notifying customers when out-of-stock items become available
 * - Cancelling pending orders when stock drops to zero
 * - Updating cart line item availability indicators
 *
 * Currently this handler logs the event for observability. Additional business
 * logic can be added here as requirements evolve.
 *
 * Requirements: 5.8
 */
export class ProductStockChangedHandler {
  constructor(private readonly eventBus: IEventBus) {}

  /**
   * Register this handler with the event bus.
   * Call this once during application startup.
   */
  register(): void {
    this.eventBus.subscribe<ProductStockChanged>(
      'ProductStockChanged',
      this.handle.bind(this),
    );
  }

  /**
   * Handle a ProductStockChanged event.
   *
   * @param event - The domain event from the Catalog context.
   */
  async handle(event: ProductStockChanged): Promise<void> {
    const { productId, previousStock, newStock } = event;
    const delta = newStock - previousStock;
    const direction = delta < 0 ? 'decreased' : 'increased';

    // Log the stock change for observability
    console.info(
      `[OrderManagement] ProductStockChanged: product=${productId} ` +
        `stock ${direction} from ${previousStock} to ${newStock} (delta: ${delta})`,
    );

    // Future: if newStock === 0, cancel pending orders or notify customers
    // Future: update cart line item availability cache
  }
}
