import { Container, DI_TOKENS } from './container.js';
import { OrderMapper } from '../persistence/mappers/OrderMapper.js';
import { CartMapper } from '../persistence/mappers/CartMapper.js';
import { OrderRepository } from '../persistence/repositories/OrderRepository.js';
import { CartRepository } from '../persistence/repositories/CartRepository.js';
import { PricingService } from '../../domain/order-management/services/PricingService.js';
import { OrderStateService } from '../../domain/order-management/services/OrderStateService.js';
import { PlaceOrderService } from '../../application/order-management/services/PlaceOrderService.js';
import { VerifyPaymentService } from '../../application/order-management/services/VerifyPaymentService.js';
import { AddToCartService } from '../../application/order-management/services/AddToCartService.js';
import { IEventBus } from '../../application/shared/IEventBus.js';
import { IUnitOfWork } from '../../application/shared/IUnitOfWork.js';
import {
  PaymentVerificationService,
  IPaystackClient,
} from '../../domain/order-management/services/PaymentVerificationService.js';
import { and, count, db, eq, ilike, isNotNull, schema } from '@workit/db';

/**
 * Register all Order Management bounded context services in the DI container.
 *
 * Prerequisites: EventBus and UnitOfWork must already be registered.
 *
 * @param paystackClient - The Paystack HTTP client implementation to inject.
 */
export function registerOrderManagement(
  container: Container,
  paystackClient: IPaystackClient,
): void {
  // ─── Mappers ────────────────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.OrderMapper, () => new OrderMapper());
  container.registerSingleton(DI_TOKENS.CartMapper, () => new CartMapper());

  // ─── Repositories ────────────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.OrderRepository, () => new OrderRepository());
  container.registerSingleton(DI_TOKENS.CartRepository, () => new CartRepository());

  // ─── Domain Services ─────────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.PricingService, () => new PricingService());
  container.registerSingleton(DI_TOKENS.OrderStateService, () => new OrderStateService());
  container.registerSingleton(
    DI_TOKENS.PaymentVerificationService,
    () => new PaymentVerificationService(paystackClient),
  );

  // ─── Application Services ────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.PlaceOrderService, () => {
    // PlaceOrderService requires a ProductInfoProvider and CampaignProvider.
    // These are thin adapters over the DB; for now we use a lazy-resolved
    // inline implementation. In Phase 3 (Catalog context) these will be
    // replaced by proper domain services.
    const productInfoProvider = {
      async getProductsByIds(ids: string[]) {
        const rows = await db.query.products.findMany({
          where: (products: any, { inArray }: any) => inArray(products.id, ids),
        });
        const map = new Map();
        for (const row of rows) {
          map.set(row.id, {
            id: row.id,
            name: row.name,
            price: row.salePrice ?? row.originalPrice ?? 0,
            stockOnHand: row.stockOnHand,
            enabled: row.enabled,
          });
        }
        return map;
      },
      async reserveStock(productId: string, quantity: number) {
        const product = await db.query.products.findFirst({
          where: eq(schema.products.id, productId),
        });
        if (!product) throw new Error(`Product not found: ${productId}`);
        await db
          .update(schema.products)
          .set({ stockOnHand: product.stockOnHand - quantity })
          .where(eq(schema.products.id, productId));
      },
    };

    const campaignProvider = {
      async findByCouponCode(couponCode: string) {
        const campaign = await db.query.campaigns.findFirst({
          where: and(
            eq(schema.campaigns.status, 'ACTIVE'),
            isNotNull(schema.campaigns.couponCode),
            ilike(schema.campaigns.couponCode, couponCode),
          ),
        });
        if (!campaign) return null;
        return {
          id: campaign.id,
          discountType: campaign.discountType ?? 'NONE',
          discountValue: campaign.discountValue ?? 0,
          minPurchaseAmount: campaign.minPurchaseAmount
            ? campaign.minPurchaseAmount / 100
            : undefined,
          maxDiscountAmount: campaign.maxDiscountAmount
            ? campaign.maxDiscountAmount / 100
            : undefined,
        };
      },
      async getCustomerUsageCount(campaignId: string, customerId: string) {
        const result = await db
          .select({ count: count() })
          .from(schema.campaignRedemptions)
          .where(
            and(
              eq(schema.campaignRedemptions.campaignId, campaignId),
              eq(schema.campaignRedemptions.customerId, customerId),
            ),
          );
        return Number(result[0]?.count ?? 0);
      },
      async recordRedemption(campaignId: string, customerId: string, orderId: string) {
        const { v4: uuidv4 } = await import('uuid');
        await db.insert(schema.campaignRedemptions).values({
          id: uuidv4(),
          campaignId,
          customerId,
          orderId,
        });
      },
    };

    return new PlaceOrderService(
      container.resolve(DI_TOKENS.CartRepository),
      container.resolve(DI_TOKENS.OrderRepository),
      productInfoProvider,
      campaignProvider,
      container.resolve(DI_TOKENS.PricingService),
      container.resolve<IEventBus>(DI_TOKENS.EventBus),
      container.resolve<IUnitOfWork>(DI_TOKENS.UnitOfWork),
    );
  });

  container.registerSingleton(DI_TOKENS.VerifyPaymentService, () =>
    new VerifyPaymentService(
      container.resolve(DI_TOKENS.OrderRepository),
      container.resolve(DI_TOKENS.CartRepository),
      container.resolve(DI_TOKENS.PaymentVerificationService),
      container.resolve<IEventBus>(DI_TOKENS.EventBus),
      container.resolve<IUnitOfWork>(DI_TOKENS.UnitOfWork),
    ),
  );

  container.registerSingleton(DI_TOKENS.AddToCartService, () =>
    new AddToCartService(container.resolve(DI_TOKENS.CartRepository)),
  );
}
