import { Order } from '../aggregates/Order.js';

/**
 * Repository interface for the Order aggregate.
 * Defined in the domain layer; implemented in the infrastructure layer.
 */
export interface IOrderRepository {
  /**
   * Find an Order by its unique ID, including all lines and payment.
   * Returns null if not found.
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Find an Order by its human-readable code (e.g. "ORD-123456-789").
   * Returns null if not found.
   */
  findByCode(code: string): Promise<Order | null>;

  /**
   * Find all Orders belonging to a customer, ordered by creation date descending.
   */
  findByCustomerId(customerId: string): Promise<Order[]>;

  /**
   * Persist an Order aggregate (insert or update).
   * Must persist all child entities (lines, payment) within the same transaction.
   */
  save(order: Order): Promise<void>;
}
