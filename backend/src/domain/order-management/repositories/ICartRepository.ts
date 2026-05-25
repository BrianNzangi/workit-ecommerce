import { Cart } from '../aggregates/Cart.js';

/**
 * Repository interface for the Cart aggregate.
 * Defined in the domain layer; implemented in the infrastructure layer.
 */
export interface ICartRepository {
  /**
   * Find a Cart by its unique ID.
   * Returns null if not found.
   */
  findById(id: string): Promise<Cart | null>;

  /**
   * Find the active Cart for an authenticated customer.
   * Returns null if the customer has no cart.
   */
  findByCustomerId(customerId: string): Promise<Cart | null>;

  /**
   * Find the active Cart for a guest session.
   * Returns null if no cart exists for this guest ID.
   */
  findByGuestId(guestId: string): Promise<Cart | null>;

  /**
   * Persist a Cart aggregate (insert or update), including all cart lines.
   */
  save(cart: Cart): Promise<void>;

  /**
   * Delete a Cart and all its lines.
   */
  delete(cartId: string): Promise<void>;
}
