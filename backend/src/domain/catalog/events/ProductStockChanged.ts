import { DomainEvent } from '../../shared/DomainEvent.js';

/**
 * Raised when a product's stock on hand changes — either through a reservation
 * (stock decreases) or a release (stock increases).
 */
export class ProductStockChanged extends DomainEvent {
  constructor(
    public readonly productId: string,
    public readonly previousStock: number,
    public readonly newStock: number,
  ) {
    super('ProductStockChanged');
  }
}
