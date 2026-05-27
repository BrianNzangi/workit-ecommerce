import { v4 as uuidv4 } from 'uuid';
import { ICartRepository } from '../../../domain/order-management/repositories/ICartRepository.js';
import { Cart } from '../../../domain/order-management/aggregates/Cart.js';

export interface AddToCartRequest {
  /** Authenticated customer ID, or undefined for guest. */
  customerId?: string;
  /** Guest session ID, or undefined for authenticated users. */
  guestId?: string;
  productId: string;
  quantity: number;
}

export interface UpdateCartLineRequest {
  customerId?: string;
  guestId?: string;
  lineId: string;
  quantity: number;
}

export interface RemoveCartLineRequest {
  customerId?: string;
  guestId?: string;
  lineId: string;
}

export interface CartResult {
  cartId: string;
  totalQuantity: number;
  lineCount: number;
}

/**
 * Application service for managing cart line items.
 *
 * Handles:
 * - Adding items to a cart (creates cart if it doesn't exist)
 * - Updating line item quantities
 * - Removing line items
 */
export class AddToCartService {
  constructor(private readonly cartRepository: ICartRepository) {}

  /**
   * Add a product to the cart. Creates a new cart if one doesn't exist.
   * If the product is already in the cart, the quantity is increased.
   */
  async addItem(request: AddToCartRequest): Promise<CartResult> {
    if (!request.customerId && !request.guestId) {
      throw new Error('Either customerId or guestId must be provided');
    }
    if (!Number.isInteger(request.quantity) || request.quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }

    let cart = await this.loadCart(request.customerId, request.guestId);

    if (!cart) {
      cart = Cart.create({
        id: uuidv4(),
        customerId: request.customerId,
        guestId: request.guestId,
      });
    }

    cart.addLine({
      id: uuidv4(),
      productId: request.productId,
      quantity: request.quantity,
    });

    await this.cartRepository.save(cart);

    return {
      cartId: cart.id,
      totalQuantity: cart.totalQuantity,
      lineCount: cart.lines.length,
    };
  }

  /**
   * Update the quantity of an existing cart line.
   */
  async updateLineQuantity(request: UpdateCartLineRequest): Promise<CartResult> {
    const cart = await this.loadCart(request.customerId, request.guestId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.updateLineQuantity(request.lineId, request.quantity);
    await this.cartRepository.save(cart);

    return {
      cartId: cart.id,
      totalQuantity: cart.totalQuantity,
      lineCount: cart.lines.length,
    };
  }

  /**
   * Remove a line item from the cart.
   */
  async removeLine(request: RemoveCartLineRequest): Promise<CartResult> {
    const cart = await this.loadCart(request.customerId, request.guestId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.removeLine(request.lineId);
    await this.cartRepository.save(cart);

    return {
      cartId: cart.id,
      totalQuantity: cart.totalQuantity,
      lineCount: cart.lines.length,
    };
  }

  /**
   * Clear all items from the cart.
   */
  async clearCart(params: { customerId?: string; guestId?: string }): Promise<void> {
    const cart = await this.loadCart(params.customerId, params.guestId);
    if (!cart) return;

    cart.clear();
    await this.cartRepository.save(cart);
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private async loadCart(
    customerId?: string,
    guestId?: string,
  ): Promise<Cart | null> {
    if (customerId) {
      return this.cartRepository.findByCustomerId(customerId);
    }
    if (guestId) {
      return this.cartRepository.findByGuestId(guestId);
    }
    return null;
  }
}
