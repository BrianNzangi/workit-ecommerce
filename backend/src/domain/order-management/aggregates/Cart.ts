import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { CartLine } from '../entities/CartLine.js';

interface CartProps {
  /** Authenticated customer ID, or null for guest carts. */
  customerId?: string;
  /** Guest session ID for unauthenticated carts. */
  guestId?: string;
  lines: CartLine[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root representing a shopping cart.
 *
 * A Cart belongs to either an authenticated customer (customerId) or a guest
 * session (guestId). At least one of these must be set.
 *
 * Invariants:
 * - Either customerId or guestId must be provided
 * - Duplicate product+variant combinations are merged (quantity summed)
 * - Line quantities must be positive integers
 */
export class Cart extends AggregateRoot<string> {
  private props: CartProps;

  private constructor(id: string, props: CartProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a new empty Cart.
   * @throws {Error} if neither customerId nor guestId is provided
   */
  static create(params: {
    id: string;
    customerId?: string;
    guestId?: string;
  }): Cart {
    if (!params.customerId && !params.guestId) {
      throw new Error('Cart must belong to either a customer or a guest session');
    }
    return new Cart(params.id, {
      customerId: params.customerId,
      guestId: params.guestId,
      lines: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstitute a Cart from persisted data.
   */
  static reconstitute(params: {
    id: string;
    customerId?: string;
    guestId?: string;
    lines: CartLine[];
    createdAt: Date;
    updatedAt: Date;
  }): Cart {
    return new Cart(params.id, { ...params, lines: [...params.lines] });
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get customerId(): string | undefined {
    return this.props.customerId;
  }

  get guestId(): string | undefined {
    return this.props.guestId;
  }

  get lines(): ReadonlyArray<CartLine> {
    return this.props.lines;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Returns true if the cart has no line items. */
  isEmpty(): boolean {
    return this.props.lines.length === 0;
  }

  /** Total number of items across all lines. */
  get totalQuantity(): number {
    return this.props.lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  // ─── Business Methods ────────────────────────────────────────────────────────

  /**
   * Add a product to the cart or increase its quantity if already present.
   * If the same productId + variantId combination exists, quantities are merged.
   *
   * @throws {Error} if quantity is not a positive integer
   */
  addLine(params: {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
  }): void {
    if (!Number.isInteger(params.quantity) || params.quantity <= 0) {
      throw new Error(`Quantity must be a positive integer, got: ${params.quantity}`);
    }

    const existing = this.findLine(params.productId, params.variantId);
    if (existing) {
      existing.updateQuantity(existing.quantity + params.quantity);
    } else {
      const line = CartLine.create({
        id: params.id,
        cartId: this.id,
        productId: params.productId,
        variantId: params.variantId,
        quantity: params.quantity,
      });
      this.props.lines.push(line);
    }

    this.props.updatedAt = new Date();
  }

  /**
   * Update the quantity of an existing cart line.
   *
   * @throws {Error} if the line is not found
   * @throws {Error} if quantity is not a positive integer
   */
  updateLineQuantity(lineId: string, newQuantity: number): void {
    const line = this.props.lines.find((l) => l.id === lineId);
    if (!line) {
      throw new Error(`Cart line not found: ${lineId}`);
    }
    line.updateQuantity(newQuantity);
    this.props.updatedAt = new Date();
  }

  /**
   * Remove a line item from the cart by its ID.
   *
   * @throws {Error} if the line is not found
   */
  removeLine(lineId: string): void {
    const index = this.props.lines.findIndex((l) => l.id === lineId);
    if (index === -1) {
      throw new Error(`Cart line not found: ${lineId}`);
    }
    this.props.lines.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  /**
   * Remove all line items from the cart.
   */
  clear(): void {
    this.props.lines = [];
    this.props.updatedAt = new Date();
  }

  /**
   * Assign this cart to an authenticated customer (used during guest → user merge).
   */
  assignToCustomer(customerId: string): void {
    this.props.customerId = customerId;
    this.props.guestId = undefined;
    this.props.updatedAt = new Date();
  }

  /**
   * Validate that the cart is ready for checkout.
   * @throws {Error} if the cart is empty
   */
  validateForCheckout(): void {
    if (this.isEmpty()) {
      throw new Error('Cannot checkout with an empty cart');
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private findLine(productId: string, variantId?: string): CartLine | undefined {
    return this.props.lines.find(
      (l) => l.productId === productId && l.variantId === variantId,
    );
  }
}
