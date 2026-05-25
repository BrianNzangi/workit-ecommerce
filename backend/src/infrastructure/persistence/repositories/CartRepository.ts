import { eq } from 'drizzle-orm';
import { db, schema } from '@workit/db';
import { ICartRepository } from '../../../domain/order-management/repositories/ICartRepository.js';
import { Cart } from '../../../domain/order-management/aggregates/Cart.js';
import { CartMapper } from '../mappers/CartMapper.js';

/**
 * Drizzle ORM implementation of ICartRepository.
 *
 * Uses the shared @workit/db connection and schema.
 */
export class CartRepository implements ICartRepository {
  private readonly mapper = new CartMapper();

  async findById(id: string): Promise<Cart | null> {
    const raw = await db.query.carts.findFirst({
      where: eq(schema.carts.id, id),
      with: { lines: true },
    });
    if (!raw) return null;
    return this.mapper.toDomain(raw as any);
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    const raw = await db.query.carts.findFirst({
      where: eq(schema.carts.customerId, customerId),
      with: { lines: true },
    });
    if (!raw) return null;
    return this.mapper.toDomain(raw as any);
  }

  async findByGuestId(guestId: string): Promise<Cart | null> {
    const raw = await db.query.carts.findFirst({
      where: eq(schema.carts.guestId, guestId),
      with: { lines: true },
    });
    if (!raw) return null;
    return this.mapper.toDomain(raw as any);
  }

  async save(cart: Cart): Promise<void> {
    const cartDto = this.mapper.toCartPersistence(cart);
    const linesDtos = this.mapper.toCartLinesPersistence(cart);

    // Upsert the cart record
    await db
      .insert(schema.carts as any)
      .values(cartDto as any)
      .onConflictDoUpdate({
        target: (schema.carts as any).id,
        set: {
          customerId: cartDto.customerId,
          guestId: cartDto.guestId,
          updatedAt: cartDto.updatedAt,
        },
      });

    // Delete existing lines and re-insert (simpler than diffing)
    await db
      .delete(schema.cartLines as any)
      .where(eq((schema.cartLines as any).cartId, cart.id));

    if (linesDtos.length > 0) {
      await db.insert(schema.cartLines as any).values(linesDtos as any);
    }
  }

  async delete(cartId: string): Promise<void> {
    // Cart lines are deleted via cascade (onDelete: 'cascade' in schema)
    await db
      .delete(schema.carts as any)
      .where(eq((schema.carts as any).id, cartId));
  }
}
