import { Order, OrderState } from '../../../domain/order-management/aggregates/Order.js';
import { OrderLine } from '../../../domain/order-management/entities/OrderLine.js';
import { Payment, PaymentMethod, PaymentState } from '../../../domain/order-management/entities/Payment.js';
import { Money } from '../../../domain/order-management/value-objects/Money.js';
import { OrderCode } from '../../../domain/order-management/value-objects/OrderCode.js';

// ─── Raw DB record types (matching the Drizzle schema) ───────────────────────

export interface OrderRecord {
  id: string;
  code: string;
  customerId: string;
  state: string;
  subTotal: number;
  shipping: number;
  tax: number;
  total: number;
  currencyCode: string;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  shippingMethodId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderLineRecord {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  /** Unit price stored in the DB (major units, e.g. KES). */
  linePrice: number;
  product?: { name: string } | null;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  state: string;
  transactionId: string | null;
  paystackRef: string | null;
  metadata: unknown;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithRelations extends OrderRecord {
  lines: OrderLineRecord[];
  payment?: PaymentRecord | null;
}

// ─── Persistence DTOs (what we write back to the DB) ─────────────────────────

export interface OrderPersistenceDto {
  id: string;
  code: string;
  customerId: string;
  state: string;
  subTotal: number;
  shipping: number;
  tax: number;
  total: number;
  currencyCode: string;
  shippingAddressId: string;
  billingAddressId: string;
  shippingMethodId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderLinePersistenceDto {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  linePrice: number;
}

export interface PaymentPersistenceDto {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  state: string;
  transactionId: string | null;
  paystackRef: string | null;
  metadata: unknown;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Maps between Order aggregate and database records.
 */
export class OrderMapper {
  /**
   * Reconstruct an Order aggregate from database records.
   */
  toDomain(raw: OrderWithRelations): Order {
    const currency = raw.currencyCode ?? 'KES';

    const lines = raw.lines.map((l) =>
      OrderLine.create({
        id: l.id,
        orderId: l.orderId,
        productId: l.productId,
        productName: l.product?.name ?? '',
        quantity: l.quantity,
        unitPrice: Money.create(l.linePrice, currency),
      }),
    );

    let payment: Payment | undefined;
    if (raw.payment) {
      const p = raw.payment;
      payment = Payment.reconstitute({
        id: p.id,
        orderId: p.orderId,
        amount: Money.create(p.amount, currency),
        method: (p.method as PaymentMethod) ?? 'paystack',
        state: (p.state as PaymentState) ?? 'PENDING',
        transactionId: p.transactionId ?? undefined,
        paystackRef: p.paystackRef ?? undefined,
        metadata: (p.metadata as Record<string, unknown>) ?? undefined,
        errorMessage: p.errorMessage ?? undefined,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      });
    }

    return Order.reconstitute({
      id: raw.id,
      code: OrderCode.create(raw.code),
      customerId: raw.customerId,
      state: raw.state as OrderState,
      lines,
      subTotal: Money.create(raw.subTotal, currency),
      shipping: Money.create(raw.shipping, currency),
      tax: Money.create(raw.tax, currency),
      discount: Money.create(
        Math.max(0, raw.subTotal + raw.shipping + raw.tax - raw.total),
        currency,
      ),
      total: Money.create(raw.total, currency),
      currencyCode: currency,
      shippingAddressId: raw.shippingAddressId ?? '',
      billingAddressId: raw.billingAddressId ?? '',
      shippingMethodId: raw.shippingMethodId ?? undefined,
      payment,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  /**
   * Convert an Order aggregate to a persistence DTO for the orders table.
   */
  toOrderPersistence(order: Order): OrderPersistenceDto {
    return {
      id: order.id,
      code: order.code.value,
      customerId: order.customerId,
      state: order.state,
      subTotal: order.subTotal.amount,
      shipping: order.shipping.amount,
      tax: order.tax.amount,
      total: order.total.amount,
      currencyCode: order.currencyCode,
      shippingAddressId: order.shippingAddressId,
      billingAddressId: order.billingAddressId,
      shippingMethodId: order.shippingMethodId ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Convert OrderLine entities to persistence DTOs for the order_lines table.
   */
  toOrderLinesPersistence(order: Order): OrderLinePersistenceDto[] {
    return order.lines.map((line) => ({
      id: line.id,
      orderId: order.id,
      productId: line.productId,
      quantity: line.quantity,
      linePrice: line.unitPrice.amount,
    }));
  }

  /**
   * Convert a Payment entity to a persistence DTO for the payments table.
   * Returns null if the order has no payment.
   */
  toPaymentPersistence(order: Order): PaymentPersistenceDto | null {
    const payment = order.payment;
    if (!payment) return null;

    return {
      id: payment.id,
      orderId: order.id,
      amount: payment.amount.amount,
      method: payment.method,
      state: payment.state,
      transactionId: payment.transactionId ?? null,
      paystackRef: payment.paystackRef ?? null,
      metadata: payment.metadata ?? null,
      errorMessage: payment.errorMessage ?? null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
