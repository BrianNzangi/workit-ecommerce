/**
 * Checkout presentation layer adapter.
 *
 * This module provides the same API contract as `backend/src/modules/checkout/endpoints/public.ts`
 * but delegates to the DDD application services when the feature flag is enabled.
 *
 * Feature flag: USE_DDD_ORDER_MANAGEMENT
 * - true  â†’ uses PlaceOrderService / VerifyPaymentService (DDD)
 * - false â†’ falls through to the legacy Transaction Script implementation
 *
 * API contract (maintained for backward compatibility):
 *   POST /checkout/initiate  â†’ { orderId, code, total }
 *   POST /checkout/verify    â†’ { message, orderId, tracking }
 *   POST /checkout/webhook   â†’ { status }
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { featureFlags, isRouteMigrationEnabled } from '../../../../infrastructure/feature-flags/flags.js';
import { container, DI_TOKENS } from '../../../../infrastructure/di/container.js';
import { PlaceOrderService } from '../../../../application/order-management/services/PlaceOrderService.js';
import { VerifyPaymentService } from '../../../../application/order-management/services/VerifyPaymentService.js';

// â”€â”€â”€ Request / Response Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const addressSchema = z.object({
  fullName: z.string(),
  streetLine1: z.string(),
  streetLine2: z.string().optional().or(z.literal('')),
  city: z.string(),
  province: z.string(),
  postalCode: z.string().optional().or(z.literal('')),
  phoneNumber: z.string(),
  country: z.string().optional().default('KE'),
});

const initiateBodySchema = z.object({
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  shippingMethodId: z.string().optional(),
  couponCode: z.string().optional(),
});

const verifyBodySchema = z.object({
  orderId: z.string(),
  paymentReference: z.string().optional(),
});

// â”€â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const checkoutPublicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.optionalStorefrontAuth);

  // â”€â”€â”€ POST /checkout/initiate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fastify.post(
    '/initiate',
    {
      schema: {
        tags: ['Checkout'],
        body: initiateBodySchema,
      },
    },
    async (request, reply) => {
      const body = request.body as z.infer<typeof initiateBodySchema>;
      const userId = (request as any).storefrontUser?.id as string | undefined;

      if (!userId) {
        return reply.status(401).send({ message: 'Login required for checkout' });
      }

      if (!isRouteMigrationEnabled(featureFlags.useDDDOrderManagement)) {
        // Feature flag is off â€” this adapter should not be registered in that case.
        // If it is, return a 501 to signal misconfiguration.
        return reply.status(501).send({ message: 'DDD checkout not enabled' });
      }

      try {
        const placeOrderService = container.resolve<PlaceOrderService>(DI_TOKENS.PlaceOrderService);

        const result = await placeOrderService.execute({
          customerId: userId,
          shippingAddressId: body.shippingAddressId ?? '',
          billingAddressId: body.billingAddressId,
          shippingMethodId: body.shippingMethodId,
          couponCode: body.couponCode,
          currencyCode: 'KES',
        });

        return {
          orderId: result.orderId,
          code: result.code,
          total: result.total,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Checkout failed';
        fastify.log.error({ err }, '[DDD Checkout] initiate failed');

        if (
          message.includes('Cart is empty') ||
          message.includes('Insufficient stock') ||
          message.includes('Invalid coupon') ||
          message.includes('Minimum order value') ||
          message.includes('no longer available') ||
          message.includes('Shipping address is required')
        ) {
          return reply.status(400).send({ message });
        }

        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  // â”€â”€â”€ POST /checkout/verify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fastify.post(
    '/verify',
    {
      schema: {
        tags: ['Checkout'],
        body: verifyBodySchema,
      },
    },
    async (request, reply) => {
      const { orderId, paymentReference } = request.body as z.infer<typeof verifyBodySchema>;
      const userId = (request as any).storefrontUser?.id as string | undefined;

      if (!isRouteMigrationEnabled(featureFlags.useDDDOrderManagement)) {
        return reply.status(501).send({ message: 'DDD checkout not enabled' });
      }

      if (!paymentReference) {
        return reply.status(400).send({ message: 'paymentReference is required' });
      }

      try {
        const verifyPaymentService = container.resolve<VerifyPaymentService>(
          DI_TOKENS.VerifyPaymentService,
        );

        const result = await verifyPaymentService.execute({
          orderId,
          paymentReference,
          userId,
        });

        return {
          message: result.message,
          orderId: result.orderId,
          tracking: result.tracking,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Verification failed';
        fastify.log.error({ err }, '[DDD Checkout] verify failed');

        if (message.includes('Order not found')) {
          return reply.status(404).send({ message: 'Order not found' });
        }
        if (message.includes('Not authorized')) {
          return reply.status(403).send({ message: 'Not authorized to verify this order' });
        }
        if (
          message.includes('Payment verification failed') ||
          message.includes('amount mismatch') ||
          message.includes('currency mismatch') ||
          message.includes('metadata') ||
          message.includes('reference')
        ) {
          return reply.status(400).send({ message });
        }

        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  // â”€â”€â”€ POST /checkout/webhook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fastify.post(
    '/webhook',
    {
      preParsing: (request, _reply, payload, done) => {
        let data = '';
        payload.on('data', (chunk: Buffer) => {
          data += chunk;
        });
        payload.on('end', () => {
          (request as any).rawBody = data;
          done(null, payload);
        });
      },
    },
    async (request, reply) => {
      if (!isRouteMigrationEnabled(featureFlags.useDDDOrderManagement)) {
        return reply.status(501).send({ message: 'DDD checkout not enabled' });
      }

      const rawBody = (request as any).rawBody as string | undefined;
      if (!rawBody) {
        return reply.status(400).send({ message: 'Missing payload' });
      }

      const signature = request.headers['x-paystack-signature'];
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY ?? '';

      if (!paystackSecret) {
        fastify.log.error('PAYSTACK_SECRET_KEY is not configured');
        return reply.status(500).send({ message: 'Webhook unavailable' });
      }

      // Validate HMAC signature
      const { createHmac } = await import('crypto');
      const computed = createHmac('sha512', paystackSecret).update(rawBody).digest('hex');
      if (!signature || computed !== signature) {
        return reply.status(400).send({ message: 'Invalid signature' });
      }

      let event: Record<string, unknown>;
      try {
        event = JSON.parse(rawBody);
      } catch {
        return reply.status(400).send({ message: 'Invalid JSON payload' });
      }

      if (event?.event !== 'charge.success') {
        return { status: 'ignored' };
      }

      const data = event?.data as Record<string, unknown> | undefined;
      const reference = data?.reference ?? data?.trxref;
      const metadata = data?.metadata as Record<string, unknown> | undefined;

      // Resolve orderId from metadata or reference
      const metadataOrderId = metadata?.orderId ?? metadata?.order_id;
      const referenceOrderId = reference
        ? /^order-([a-f0-9-]+)-\d+$/i.exec(String(reference))?.[1]
        : null;
      const orderId = metadataOrderId ? String(metadataOrderId) : referenceOrderId;

      if (!reference || !orderId) {
        fastify.log.warn({ reference, orderId }, 'Paystack webhook missing reference/orderId');
        return { status: 'ignored' };
      }

      try {
        const verifyPaymentService = container.resolve<VerifyPaymentService>(
          DI_TOKENS.VerifyPaymentService,
        );

        await verifyPaymentService.execute({
          orderId,
          paymentReference: String(reference),
        });

        return { status: 'success' };
      } catch (err) {
        fastify.log.error({ err, orderId }, '[DDD Checkout] webhook verification failed');
        return reply.status(400).send({ message: 'Webhook processing failed' });
      }
    },
  );
};


