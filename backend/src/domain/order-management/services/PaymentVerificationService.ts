import { Order } from '../aggregates/Order.js';
import { Payment } from '../entities/Payment.js';
import { Money } from '../value-objects/Money.js';
import { PaymentVerificationError } from '../errors/PaymentVerificationError.js';

export interface PaystackVerificationData {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  id?: string | number;
  metadata?: Record<string, unknown>;
}

export interface IPaystackClient {
  verifyTransaction(reference: string): Promise<PaystackVerificationData>;
}

/**
 * Domain service for verifying payments against an external payment provider (Paystack).
 *
 * Responsibilities:
 * - Call the Paystack API to verify a payment reference
 * - Validate the payment amount matches the order total
 * - Validate the payment currency matches the order currency
 * - Validate the payment metadata references the correct order
 * - Return a verified Payment entity ready to be attached to the Order
 *
 * This service depends on IPaystackClient (infrastructure interface) injected
 * via constructor, keeping the domain service testable without real HTTP calls.
 */
export class PaymentVerificationService {
  constructor(private readonly paystackClient: IPaystackClient) {}

  /**
   * Verify a Paystack payment reference against an order.
   *
   * @returns A Payment entity in SETTLED state if verification succeeds
   * @throws {PaymentVerificationError} for any business-rule violation
   */
  async verifyPayment(params: {
    paymentId: string;
    order: Order;
    paymentReference: string;
  }): Promise<Payment> {
    const { paymentId, order, paymentReference } = params;

    let data: PaystackVerificationData;
    try {
      data = await this.paystackClient.verifyTransaction(paymentReference);
    } catch (err) {
      throw new PaymentVerificationError(
        `Failed to verify payment with Paystack: ${(err as Error).message}`,
      );
    }

    if (data.status !== 'success') {
      throw new PaymentVerificationError(
        `Payment verification failed: Paystack status is '${data.status}'`,
      );
    }

    // Validate amount (Paystack returns amount in minor units, e.g. kobo/cents)
    // The existing backend normalises by multiplying order total × 100 for Paystack.
    const expectedMinorAmount = Math.round(order.total.amount * 100);
    const paidMinorAmount = Number(data.amount);

    if (!Number.isFinite(paidMinorAmount) || paidMinorAmount !== expectedMinorAmount) {
      throw new PaymentVerificationError(
        `Payment amount mismatch: expected ${expectedMinorAmount} minor units, got ${paidMinorAmount}`,
      );
    }

    // Validate currency
    const paystackCurrency = data.currency?.toUpperCase();
    const orderCurrency = order.currencyCode.toUpperCase();
    if (paystackCurrency && paystackCurrency !== orderCurrency) {
      throw new PaymentVerificationError(
        `Payment currency mismatch: expected ${orderCurrency}, got ${paystackCurrency}`,
      );
    }

    // Validate metadata order ID if present
    const metadataOrderId = this.resolveMetadataOrderId(data.metadata);
    if (metadataOrderId && metadataOrderId !== order.id) {
      throw new PaymentVerificationError(
        `Payment metadata order ID mismatch: expected ${order.id}, got ${metadataOrderId}`,
      );
    }

    // Validate reference order ID if encoded in the reference string
    const referenceOrderId = this.parseOrderIdFromReference(String(data.reference ?? paymentReference));
    if (referenceOrderId && referenceOrderId !== order.id) {
      throw new PaymentVerificationError(
        `Payment reference order ID mismatch: expected ${order.id}, got ${referenceOrderId}`,
      );
    }

    // Build the verified Payment entity
    const payment = Payment.create({
      id: paymentId,
      orderId: order.id,
      amount: Money.create(order.total.amount, order.currencyCode),
      method: 'paystack',
      transactionId: data.id !== undefined ? String(data.id) : undefined,
      paystackRef: String(data.reference ?? paymentReference),
      metadata: data as unknown as Record<string, unknown>,
    });

    payment.settle();
    return payment;
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private resolveMetadataOrderId(metadata: unknown): string | null {
    if (!metadata || typeof metadata !== 'object') return null;
    const m = metadata as Record<string, unknown>;
    const candidate = m['orderId'] ?? m['order_id'];
    return candidate ? String(candidate) : null;
  }

  private parseOrderIdFromReference(reference: string): string | null {
    const match = /^order-([a-f0-9-]+)-\d+$/i.exec(reference);
    return match?.[1] ?? null;
  }
}
