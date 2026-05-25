import { v4 as uuidv4 } from 'uuid';
import { ICartRepository } from '../../../domain/order-management/repositories/ICartRepository.js';
import { IOrderRepository } from '../../../domain/order-management/repositories/IOrderRepository.js';
import { PricingService, CampaignDiscount } from '../../../domain/order-management/services/PricingService.js';
import { Order } from '../../../domain/order-management/aggregates/Order.js';
import { OrderLine } from '../../../domain/order-management/entities/OrderLine.js';
import { Money } from '../../../domain/order-management/value-objects/Money.js';
import { OrderCode } from '../../../domain/order-management/value-objects/OrderCode.js';
import { IEventBus } from '../../shared/IEventBus.js';
import { IUnitOfWork } from '../../shared/IUnitOfWork.js';

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  stockOnHand: number;
  enabled: boolean;
  currencyCode?: string;
}

export interface IProductInfoProvider {
  getProductsByIds(ids: string[]): Promise<Map<string, ProductInfo>>;
  reserveStock(productId: string, quantity: number): Promise<void>;
}

export interface ICampaignProvider {
  findByCouponCode(couponCode: string): Promise<CampaignDiscount & { id: string } | null>;
  recordRedemption(campaignId: string, customerId: string, orderId: string): Promise<void>;
  getCustomerUsageCount(campaignId: string, customerId: string): Promise<number>;
}

export interface PlaceOrderRequest {
  customerId: string;
  cartId?: string;
  shippingAddressId: string;
  billingAddressId?: string;
  shippingMethodId?: string;
  couponCode?: string;
  /** Shipping cost in major units (e.g. KES). Defaults to 0. */
  shippingCost?: number;
  currencyCode?: string;
}

export interface PlaceOrderResult {
  orderId: string;
  code: string;
  total: number;
  currencyCode: string;
}

/**
 * Application service that orchestrates the checkout / place-order use case.
 *
 * Workflow:
 * 1. Load the customer's cart
 * 2. Validate cart is not empty
 * 3. Load product info and validate stock
 * 4. Apply campaign discount if coupon code provided
 * 5. Calculate pricing (subtotal, discount, total)
 * 6. Reserve stock for each product
 * 7. Create the Order aggregate
 * 8. Persist the order
 * 9. Record campaign redemption if applicable
 * 10. Publish domain events
 *
 * All DB writes happen inside a UnitOfWork transaction.
 */
export class PlaceOrderService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly productInfoProvider: IProductInfoProvider,
    private readonly campaignProvider: ICampaignProvider,
    private readonly pricingService: PricingService,
    private readonly eventBus: IEventBus,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(request: PlaceOrderRequest): Promise<PlaceOrderResult> {
    const currency = request.currencyCode ?? 'KES';

    return this.unitOfWork.transaction(async () => {
      // 1. Load cart
      const cart = request.cartId
        ? await this.cartRepository.findById(request.cartId)
        : await this.cartRepository.findByCustomerId(request.customerId);

      if (!cart || cart.isEmpty()) {
        throw new Error('Cart is empty or not found');
      }

      // 2. Load product info
      const productIds = cart.lines.map((l) => l.productId);
      const productMap = await this.productInfoProvider.getProductsByIds(productIds);

      // 3. Validate products and build order lines
      const orderLines: OrderLine[] = [];
      for (const cartLine of cart.lines) {
        const product = productMap.get(cartLine.productId);
        if (!product) {
          throw new Error(`Product not found: ${cartLine.productId}`);
        }
        if (!product.enabled) {
          throw new Error(`Product '${product.name}' is no longer available`);
        }
        if (product.stockOnHand < cartLine.quantity) {
          throw new Error(
            `Insufficient stock for '${product.name}'. Available: ${product.stockOnHand}, requested: ${cartLine.quantity}`,
          );
        }

        orderLines.push(
          OrderLine.create({
            id: uuidv4(),
            orderId: '', // will be set after order ID is generated
            productId: cartLine.productId,
            productName: product.name,
            quantity: cartLine.quantity,
            unitPrice: Money.create(product.price, currency),
          }),
        );
      }

      // 4. Calculate pricing
      const subtotal = this.pricingService.calculateSubtotal(orderLines, currency);
      const shipping = Money.create(request.shippingCost ?? 0, currency);
      const tax = Money.create(0, currency);

      // 5. Apply campaign discount
      let discount = Money.create(0, currency);
      let campaignId: string | undefined;

      if (request.couponCode) {
        const campaign = await this.campaignProvider.findByCouponCode(request.couponCode);
        if (!campaign) {
          throw new Error(`Invalid coupon code: ${request.couponCode}`);
        }

        const customerUsage = await this.campaignProvider.getCustomerUsageCount(
          campaign.id,
          request.customerId,
        );

        if (
          campaign.minPurchaseAmount !== undefined &&
          subtotal.amount < campaign.minPurchaseAmount
        ) {
          throw new Error(
            `Minimum order value of ${currency} ${campaign.minPurchaseAmount.toLocaleString()} required`,
          );
        }

        discount = this.pricingService.applyDiscount({
          subtotal,
          shipping,
          campaign,
        });

        campaignId = campaign.id;
      }

      const total = this.pricingService.calculateTotal({ subtotal, shipping, tax, discount });

      // 6. Reserve stock
      for (const cartLine of cart.lines) {
        await this.productInfoProvider.reserveStock(cartLine.productId, cartLine.quantity);
      }

      // 7. Create Order aggregate
      const orderId = uuidv4();
      const code = OrderCode.generate();

      // Re-create order lines with the correct orderId
      const finalLines = orderLines.map((line) =>
        OrderLine.create({
          id: line.id,
          orderId,
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        }),
      );

      const order = Order.create({
        id: orderId,
        code,
        customerId: request.customerId,
        lines: finalLines,
        subTotal: subtotal,
        shipping,
        tax,
        discount,
        total,
        currencyCode: currency,
        shippingAddressId: request.shippingAddressId,
        billingAddressId: request.billingAddressId ?? request.shippingAddressId,
        shippingMethodId: request.shippingMethodId,
      });

      // 8. Persist order
      await this.orderRepository.save(order);

      // 9. Record campaign redemption
      if (campaignId) {
        await this.campaignProvider.recordRedemption(campaignId, request.customerId, orderId);
      }

      // 10. Publish domain events
      await this.eventBus.publish(order.domainEvents as any[]);
      order.clearEvents();

      return {
        orderId: order.id,
        code: order.code.value,
        total: order.total.amount,
        currencyCode: order.currencyCode,
      };
    });
  }
}
