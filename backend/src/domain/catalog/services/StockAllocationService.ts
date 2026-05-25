import { Product } from '../entities/Product.js';
import { InsufficientStockError } from '../errors/InsufficientStockError.js';

export interface AllocationRequest {
  productId: string;
  quantity: number;
}

/**
 * Domain service for atomically allocating (reserving) stock across multiple products.
 *
 * The allocation is performed in two phases:
 * 1. **Validation phase** — check all products have sufficient stock before touching any.
 * 2. **Reservation phase** — call reserveStock on each product.
 *
 * This two-phase approach ensures that either all reservations succeed or none do,
 * preventing partial allocations that would leave the system in an inconsistent state.
 *
 * Note: "atomic" here refers to the in-memory domain logic. Persistence-level atomicity
 * is guaranteed by the UnitOfWork / database transaction wrapping the application service.
 */
export class StockAllocationService {
  /**
   * Validate and reserve stock for a set of products.
   *
   * @param products - Map of productId → Product aggregate, pre-loaded by the caller.
   * @param requests - List of allocation requests (productId + quantity).
   *
   * @throws {Error} if a requested productId is not present in the products map.
   * @throws {InsufficientStockError} if any product has insufficient stock.
   *   When this is thrown, NO stock has been modified (validation-first guarantee).
   */
  allocateStock(
    products: Map<string, Product>,
    requests: AllocationRequest[],
  ): void {
    // ── Phase 1: Validate all allocations before modifying any state ──────────
    for (const request of requests) {
      if (!Number.isInteger(request.quantity) || request.quantity <= 0) {
        throw new Error(
          `Allocation quantity must be a positive integer for product "${request.productId}", ` +
            `got: ${request.quantity}`,
        );
      }

      const product = products.get(request.productId);
      if (!product) {
        throw new Error(
          `Product not found in allocation map: "${request.productId}". ` +
            'Ensure all products are loaded before calling allocateStock.',
        );
      }

      if (product.stockOnHand < request.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock for "${product.name}" (id: ${product.id}). ` +
            `Available: ${product.stockOnHand}, Requested: ${request.quantity}`,
        );
      }
    }

    // ── Phase 2: Perform all reservations (all validations passed) ────────────
    for (const request of requests) {
      const product = products.get(request.productId)!;
      product.reserveStock(request.quantity);
    }
  }

  /**
   * Release previously reserved stock for a set of products.
   * Used when an order is cancelled or a reservation needs to be undone.
   *
   * @param products - Map of productId → Product aggregate, pre-loaded by the caller.
   * @param requests - List of release requests (productId + quantity).
   *
   * @throws {Error} if a requested productId is not present in the products map.
   */
  releaseStock(
    products: Map<string, Product>,
    requests: AllocationRequest[],
  ): void {
    for (const request of requests) {
      if (!Number.isInteger(request.quantity) || request.quantity <= 0) {
        throw new Error(
          `Release quantity must be a positive integer for product "${request.productId}", ` +
            `got: ${request.quantity}`,
        );
      }

      const product = products.get(request.productId);
      if (!product) {
        throw new Error(
          `Product not found in release map: "${request.productId}". ` +
            'Ensure all products are loaded before calling releaseStock.',
        );
      }

      product.releaseStock(request.quantity);
    }
  }
}
