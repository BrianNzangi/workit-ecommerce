import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { OrderLine } from '../entities/OrderLine.js';
import { Payment } from '../entities/Payment.js';
import { Money } from '../value-objects/Money.js';
import { OrderCode } from '../value-objects/OrderCode.js';
import { OrderPlaced } from '../events/OrderPlaced.js';
import { OrderStateChanged } from '../events/OrderStateChanged.js';
import { PaymentSettled } from '../events/PaymentSettled.js';
import { InvalidStateTransitionError } from '../errors/InvalidStateTransitionError.js';

/**
 * Valid states for an Order.
 * Mirrors the OrderState enum in the database schema.
 */
export type OrderState =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_SETTLED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

/** Allowed state transitions: from → [allowed to states] */
const VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
  CREATED: ['PAYMENT_PENDING', 'PAYMENT_SETTLED', 'CANCELLED'],
  PAYMENT_PENDING: ['PAYMENT_AUTHORIZED', 'PAYMENT_SETTLED', 'CANCELLED'],
  PAYMENT_AUTHORIZED: ['PAYMENT_SETTLED', 'CANCELLED'],
  PAYMENT_SETTLED: ['SHIPPED', 'DELIVERED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

interface OrderProps {
  code: OrderCode;
  customerId: string;
  state: OrderState;
  lines: OrderLine[];
  subTotal: Money;
  shipping: Money;
  tax: Money;
  discount: Money;
  total: Money;
  currencyCode: string;
  shippingAddressId: string;
  billingAddressId: string;
  shippingMethodId?: string;
  payment?: Payment;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root for the Order Management bounded context.
 *
 * An Order represents a confirmed purchase intent. It enforces:
 * - Valid state machine transitions
 * - Payment amount must match order total
 * - Payment currency must match order currency
 *
 * Domain events raised:
 * - OrderPlaced: on creation
 * - OrderStateChanged: on every state transition
 * - PaymentSettled: when payment is settled
 */
export class Order extends AggregateRoot<string> {
  private props: OrderProps;

  private constructor(id: string, props: OrderProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a brand-new Order from checkout data.
   * Raises an OrderPlaced domain event.
   */
  static create(params: {
    id: string;
    code: OrderCode;
    customerId: string;
    lines: OrderLine[];
    subTotal: Money;
    shipping: Money;
    tax: Money;
    discount: Money;
    total: Money;
    currencyCode?: string;
    shippingAddressId: string;
    billingAddressId: string;
    shippingMethodId?: string;
  }): Order {
    if (params.lines.length === 0) {
      throw new Error('An order must have at least one line item');
    }

    const currencyCode = params.currencyCode ?? params.total.currency;

    const order = new Order(params.id, {
      code: params.code,
      customerId: params.customerId,
      state: 'CREATED',
      lines: [...params.lines],
      subTotal: params.subTotal,
      shipping: params.shipping,
      tax: params.tax,
      discount: params.discount,
      total: params.total,
      currencyCode,
      shippingAddressId: params.shippingAddressId,
      billingAddressId: params.billingAddressId,
      shippingMethodId: params.shippingMethodId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    order.addDomainEvent(
      new OrderPlaced(order.id, params.customerId, params.total.amount, currencyCode),
    );

    return order;
  }

  /**
   * Reconstitute an Order from persisted data (e.g. from the database).
   * Does NOT raise domain events.
   */
  static reconstitute(params: {
    id: string;
    code: OrderCode;
    customerId: string;
    state: OrderState;
    lines: OrderLine[];
    subTotal: Money;
    shipping: Money;
    tax: Money;
    discount: Money;
    total: Money;
    currencyCode: string;
    shippingAddressId: string;
    billingAddressId: string;
    shippingMethodId?: string;
    payment?: Payment;
    createdAt: Date;
    updatedAt: Date;
  }): Order {
    return new Order(params.id, { ...params, lines: [...params.lines] });
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get code(): OrderCode {
    return this.props.code;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get state(): OrderState {
    return this.props.state;
  }

  get lines(): ReadonlyArray<OrderLine> {
    return this.props.lines;
  }

  get subTotal(): Money {
    return this.props.subTotal;
  }

  get shipping(): Money {
    return this.props.shipping;
  }

  get tax(): Money {
    return this.props.tax;
  }

  get discount(): Money {
    return this.props.discount;
  }

  get total(): Money {
    return this.props.total;
  }

  get currencyCode(): string {
    return this.props.currencyCode;
  }

  get shippingAddressId(): string {
    return this.props.shippingAddressId;
  }

  get billingAddressId(): string {
    return this.props.billingAddressId;
  }

  get shippingMethodId(): string | undefined {
    return this.props.shippingMethodId;
  }

  get payment(): Payment | undefined {
    return this.props.payment;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ─── Business Methods ────────────────────────────────────────────────────────

  /**
   * Transition the order to a new state.
   * Raises an OrderStateChanged domain event on success.
   *
   * @throws {InvalidStateTransitionError} if the transition is not allowed
   */
  transitionTo(newState: OrderState): void {
    const allowed = VALID_TRANSITIONS[this.props.state];
    if (!allowed.includes(newState)) {
      throw new InvalidStateTransitionError(
        `Cannot transition Order from '${this.props.state}' to '${newState}'. ` +
          `Allowed transitions: [${allowed.join(', ') || 'none'}]`,
      );
    }

    const oldState = this.props.state;
    this.props.state = newState;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OrderStateChanged(this.id, oldState, newState));
  }

  /**
   * Attach a verified payment to this order and transition to PAYMENT_SETTLED.
   * Raises OrderStateChanged and PaymentSettled domain events.
   *
   * @throws {Error} if the order is not in a state that allows payment settlement
   * @throws {Error} if the payment amount does not match the order total
   * @throws {Error} if the payment currency does not match the order currency
   */
  settlePayment(payment: Payment): void {
    const allowedStates: OrderState[] = ['CREATED', 'PAYMENT_PENDING', 'PAYMENT_AUTHORIZED'];
    if (!allowedStates.includes(this.props.state)) {
      throw new InvalidStateTransitionError(
        `Cannot settle payment for an order in '${this.props.state}' state`,
      );
    }

    if (payment.amount.amount !== this.props.total.amount) {
      throw new Error(
        `Payment amount (${payment.amount.amount}) does not match order total (${this.props.total.amount})`,
      );
    }

    if (payment.amount.currency !== this.props.currencyCode) {
      throw new Error(
        `Payment currency (${payment.amount.currency}) does not match order currency (${this.props.currencyCode})`,
      );
    }

    payment.settle();
    this.props.payment = payment;

    // Directly set state to PAYMENT_SETTLED (bypassing transitionTo to avoid duplicate events)
    const oldState = this.props.state;
    this.props.state = 'PAYMENT_SETTLED';
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OrderStateChanged(this.id, oldState, 'PAYMENT_SETTLED'));
    this.addDomainEvent(
      new PaymentSettled(
        this.id,
        this.props.customerId,
        payment.amount.amount,
        payment.amount.currency,
        payment.paystackRef ?? payment.transactionId ?? payment.id,
      ),
    );
  }

  /** Returns true if this order can still be cancelled. */
  isCancellable(): boolean {
    return VALID_TRANSITIONS[this.props.state].includes('CANCELLED');
  }
}
