import { ProductStockChanged } from '../../../domain/catalog/events/ProductStockChanged.js';
import { CachedProductRepository } from '../../../infrastructure/persistence/repositories/CachedProductRepository.js';

/**
 * Event handler for ProductStockChanged events.
 *
 * Invalidates the product cache when stock changes to ensure
 * subsequent queries return fresh data.
 *
 * Requirements: 25.3
 */
export class ProductStockChangedHandler {
  constructor(private readonly cachedProductRepository: CachedProductRepository) {}

  async handle(event: ProductStockChanged): Promise<void> {
    this.cachedProductRepository.invalidateProduct(event.productId);
  }
}
