import { Entity } from '../../shared/Entity.js';
import { Money } from '../value-objects/Money.js';

export type PaymentState = 'PENDING' | 'AUTHORIZED' | 'SETTLED' | 'DECLINED' | 'CANCELLED' | 'ERROR';
export type PaymentMethod = 'paystack' | 'cash' | 'bank_transfer';

interface PaymentProps {
  orderId: string;
  amount: Money;
  method: PaymentMethod;
  state: PaymentState;
  /** External payment provider transaction ID (e.g. Paystack transaction ID). */
  transactionId?: string;
  /** Paystack payment reference string. */
  paystackRef?: string;
  /** Raw metadata from the payment provider. */
  metadata?: Record<string, unknown>;
  /** Reason for failure, if state is DECLINED or ERROR. */
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity representing a payment attempt for an Order.
 *
 * Payment is owned by the Order aggregate root. State transitions are
 * managed through the Order.settlePayment() method.
 *
 * Invariants:
 * - amount must match the order total (enforced by Order.settlePayment)
 * - currency must match the order currency (enforced by Order.settlePayment)
 */
export class Payment extends Entity<string> {
  private props: PaymentProps;

  private constructor(id: string, props: PaymentProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a new Payment in PENDING state.
   */
  static create(params: {
    id: string;
    orderId: string;
    amount: Money;
    method: PaymentMethod;
    transactionId?: string;
    paystackRef?: string;
    metadata?: Record<string, unknown>;
  }): Payment {
    return new Payment(params.id, {
      orderId: params.orderId,
      amount: params.amount,
      method: params.method,
      state: 'PENDING',
      transactionId: params.transactionId,
      paystackRef: params.paystackRef,
      metadata: params.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstitute a Payment from persisted data (e.g. from the database).
   */
  static reconstitute(params: {
    id: string;
    orderId: string;
    amount: Money;
    method: PaymentMethod;
    state: PaymentState;
    transactionId?: string;
    paystackRef?: string;
    metadata?: Record<string, unknown>;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Payment {
    return new Payment(params.id, { ...params });
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get method(): PaymentMethod {
    return this.props.method;
  }

  get state(): PaymentState {
    return this.props.state;
  }

  get transactionId(): string | undefined {
    return this.props.transactionId;
  }

  get paystackRef(): string | undefined {
    return this.props.paystackRef;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }

  get errorMessage(): string | undefined {
    return this.props.errorMessage;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Transition this payment to SETTLED state. */
  settle(): void {
    this.props.state = 'SETTLED';
    this.props.updatedAt = new Date();
  }

  /** Transition this payment to DECLINED state with an optional reason. */
  decline(reason?: string): void {
    this.props.state = 'DECLINED';
    this.props.errorMessage = reason;
    this.props.updatedAt = new Date();
  }

  /** Transition this payment to ERROR state with an optional reason. */
  markError(reason?: string): void {
    this.props.state = 'ERROR';
    this.props.errorMessage = reason;
    this.props.updatedAt = new Date();
  }

  /** Returns true if this payment has been successfully settled. */
  isSettled(): boolean {
    return this.props.state === 'SETTLED';
  }
}
