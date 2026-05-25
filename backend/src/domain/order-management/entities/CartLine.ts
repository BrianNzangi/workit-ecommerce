import { Entity } from '../../shared/Entity.js';

interface CartLineProps {
  cartId: string;
  productId: string;
  /** Optional variant ID for products with variants. */
  variantId?: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity representing a single line item within a Cart aggregate.
 *
 * CartLine is owned by the Cart aggregate root.
 */
export class CartLine extends Entity<string> {
  private props: CartLineProps;

  private constructor(id: string, props: CartLineProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a new CartLine.
   * @throws {Error} if quantity is not a positive integer
   */
  static create(params: {
    id: string;
    cartId: string;
    productId: string;
    variantId?: string;
    quantity: number;
  }): CartLine {
    if (!Number.isInteger(params.quantity) || params.quantity <= 0) {
      throw new Error(`CartLine quantity must be a positive integer, got: ${params.quantity}`);
    }
    return new CartLine(params.id, {
      cartId: params.cartId,
      productId: params.productId,
      variantId: params.variantId,
      quantity: params.quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstitute a CartLine from persisted data.
   */
  static reconstitute(params: {
    id: string;
    cartId: string;
    productId: string;
    variantId?: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
  }): CartLine {
    return new CartLine(params.id, { ...params });
  }

  get cartId(): string {
    return this.props.cartId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get variantId(): string | undefined {
    return this.props.variantId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Update the quantity of this cart line.
   * @throws {Error} if the new quantity is not a positive integer
   */
  updateQuantity(newQuantity: number): void {
    if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
      throw new Error(`CartLine quantity must be a positive integer, got: ${newQuantity}`);
    }
    this.props.quantity = newQuantity;
    this.props.updatedAt = new Date();
  }
}
