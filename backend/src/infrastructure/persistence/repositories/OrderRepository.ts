import { eq } from 'drizzle-orm';
import { db, schema } from '@workit/db';
import { IOrderRepository } from '../../../domain/order-management/repositories/IOrderRepository.js';
import { Order } from '../../../domain/order-management/aggregates/Order.js';
import {
  OrderMapper,
  OrderWithRelations,
} from '../mappers/OrderMapper.js';

/**
 * Drizzle ORM implementation of IOrderRepository.
 *
 * Uses the shared @workit/db connection and schema.
 * Eagerly loads order lines and payment when fetching an Order.
 */
export class OrderRepository implements IOrderRepository {
  private readonly mapper = new OrderMapper();

  async findById(id: string): Promise<Order | null> {
    const raw = await db.query.orders.findFirst({
      where: eq(schema.orders.id, id),
      with: {
        lines: {
          with: { product: true },
        },
        payments: true,
      },
    });

    if (!raw) return null;
    return this.mapper.toDomain(this.normalise(raw));
  }

  async findByCode(code: string): Promise<Order | null> {
    const raw = await db.query.orders.findFirst({
      where: eq(schema.orders.code, code),
      with: {
        lines: {
          with: { product: true },
        },
        payments: true,
      },
    });

    if (!raw) return null;
    return this.mapper.toDomain(this.normalise(raw));
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await db.query.orders.findMany({
      where: eq(schema.orders.customerId, customerId),
      with: {
        lines: {
          with: { product: true },
        },
        payments: true,
      },
      orderBy: (orders: any, { desc }: any) => [desc(orders.createdAt)],
    });

    return rows.map((raw: any) => this.mapper.toDomain(this.normalise(raw)));
  }

  async save(order: Order): Promise<void> {
    const orderDto = this.mapper.toOrderPersistence(order);
    const linesDtos = this.mapper.toOrderLinesPersistence(order);
    const paymentDto = this.mapper.toPaymentPersistence(order);

    // Upsert the order record
    await db
      .insert(schema.orders as any)
      .values(orderDto as any)
      .onConflictDoUpdate({
        target: (schema.orders as any).id,
        set: {
          state: orderDto.state,
          subTotal: orderDto.subTotal,
          shipping: orderDto.shipping,
          tax: orderDto.tax,
          total: orderDto.total,
          shippingAddressId: orderDto.shippingAddressId,
          billingAddressId: orderDto.billingAddressId,
          shippingMethodId: orderDto.shippingMethodId,
          updatedAt: orderDto.updatedAt,
        },
      });

    // Upsert order lines
    for (const lineDto of linesDtos) {
      await db
        .insert(schema.orderLines as any)
        .values(lineDto as any)
        .onConflictDoUpdate({
          target: (schema.orderLines as any).id,
          set: {
            quantity: lineDto.quantity,
            linePrice: lineDto.linePrice,
          },
        });
    }

    // Upsert payment if present
    if (paymentDto) {
      await db
        .insert(schema.payments as any)
        .values(paymentDto as any)
        .onConflictDoUpdate({
          target: (schema.payments as any).id,
          set: {
            state: paymentDto.state,
            transactionId: paymentDto.transactionId,
            paystackRef: paymentDto.paystackRef,
            metadata: paymentDto.metadata,
            errorMessage: paymentDto.errorMessage,
            updatedAt: paymentDto.updatedAt,
          },
        });
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  /**
   * Normalise the raw Drizzle query result into the shape expected by OrderMapper.
   * Drizzle returns `payments` as an array; we take the first one.
   */
  private normalise(raw: any): OrderWithRelations {
    return {
      ...raw,
      payment: Array.isArray(raw.payments) ? (raw.payments[0] ?? null) : (raw.payment ?? null),
    };
  }
}
