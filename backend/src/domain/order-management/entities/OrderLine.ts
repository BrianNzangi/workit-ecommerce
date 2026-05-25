import { Entity } from '../../shared/Entity.js';
import { Money } from '../value-objects/Money.js';

interface OrderLineProps {
  orderId: string;
  productId: string;
  /** Product name snapshot at time of order creation. */
  productName: string;
  quantity: number;
  /** Unit price at time of order creation. */
  unitPrice: Money;
}

/**
 * Entity representing a single line item within an Order aggregate.
 *
 * OrderLine is owned by the Order aggregate root and must not be modified
 * outside of it. Once created, an order line is immutable.
 */
export class OrderLine extends Entity<string> {
  private readonly props: OrderLineProps;

  private constructor(id: string, props: OrderLineProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a new OrderLine.
   * @throws {Error} if quantity is not a positive integer
   */
  static create(params: {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: Money;
  }): OrderLine {
    if (!Number.isInteger(params.quantity) || params.quantity <= 0) {
      throw new Error(`OrderLine quantity must be a positive integer, got: ${params.quantity}`);
    }
    return new OrderLine(params.id, {
      orderId: params.orderId,
      productId: params.productId,
      productName: params.productName,
      quantity: params.quantity,
      unitPrice: params.unitPrice,
    });
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  /**
   * The total price for this line: unitPrice × quantity.
   */
  get totalPrice(): Money {
    return this.props.unitPrice.multiply(this.props.quantity);
  }
}
