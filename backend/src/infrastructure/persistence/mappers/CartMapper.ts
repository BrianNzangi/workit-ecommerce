import { Cart } from '../../../domain/order-management/aggregates/Cart.js';
import { CartLine } from '../../../domain/order-management/entities/CartLine.js';

// ─── Raw DB record types (matching the Drizzle schema) ───────────────────────

export interface CartRecord {
  id: string;
  customerId: string | null;
  guestId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartLineRecord {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartWithLines extends CartRecord {
  lines: CartLineRecord[];
}

// ─── Persistence DTOs ─────────────────────────────────────────────────────────

export interface CartPersistenceDto {
  id: string;
  customerId: string | null;
  guestId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartLinePersistenceDto {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Maps between Cart aggregate and database records.
 */
export class CartMapper {
  /**
   * Reconstruct a Cart aggregate from database records.
   */
  toDomain(raw: CartWithLines): Cart {
    const lines = raw.lines.map((l) =>
      CartLine.reconstitute({
        id: l.id,
        cartId: l.cartId,
        productId: l.productId,
        quantity: l.quantity,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }),
    );

    return Cart.reconstitute({
      id: raw.id,
      customerId: raw.customerId ?? undefined,
      guestId: raw.guestId ?? undefined,
      lines,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  /**
   * Convert a Cart aggregate to a persistence DTO for the carts table.
   */
  toCartPersistence(cart: Cart): CartPersistenceDto {
    return {
      id: cart.id,
      customerId: cart.customerId ?? null,
      guestId: cart.guestId ?? null,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Convert CartLine entities to persistence DTOs for the cart_lines table.
   */
  toCartLinesPersistence(cart: Cart): CartLinePersistenceDto[] {
    return cart.lines.map((line) => ({
      id: line.id,
      cartId: cart.id,
      productId: line.productId,
      quantity: line.quantity,
      createdAt: line.createdAt,
      updatedAt: line.updatedAt,
    }));
  }
}
