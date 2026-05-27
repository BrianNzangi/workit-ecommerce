import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { and, db, eq, schema } from '@workit/db';
import { enrichProductCampaigns } from '../../../../lib/product-campaigns.js';
import { container, DI_TOKENS } from '../../../../infrastructure/di/container.js';
import { AddToCartService } from '../../../../application/order-management/services/AddToCartService.js';
import { CartRepository } from '../../../../infrastructure/persistence/repositories/CartRepository.js';

const addBodySchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).default(1),
});

const updateBodySchema = z.object({
  quantity: z.number().int().min(1),
});

const lineParamsSchema = z.object({
  lineId: z.string(),
});

function getGuestId(request: any): string | undefined {
  return (
    (request.headers['x-guest-id'] as string | undefined) ||
    (request.cookies?.guest_id as string | undefined) ||
    (request.query?.guestId as string | undefined)
  );
}

function enrichCart(cart: any) {
  if (!cart?.lines) return cart;

  return {
    ...cart,
    lines: cart.lines.map((line: any) => ({
      ...line,
      product: line.product
        ? enrichProductCampaigns(line.product, { onlyActive: true })
        : line.product,
    })),
  };
}

async function loadEnrichedCartForIdentity(params: {
  customerId?: string;
  guestId?: string;
}): Promise<any | null> {
  if (!params.customerId && !params.guestId) {
    return null;
  }

  const where = params.customerId
    ? eq(schema.carts.customerId, params.customerId)
    : eq(schema.carts.guestId, params.guestId!);

  const cart = await db.query.carts.findFirst({
    where,
    with: {
      lines: {
        with: {
          product: {
            with: {
              assets: {
                with: {
                  asset: true,
                },
              },
              campaignProducts: {
                with: {
                  campaign: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return enrichCart(cart);
}

async function mergeGuestCartIfNeeded(params: {
  customerId?: string;
  guestId?: string;
}): Promise<void> {
  const { customerId, guestId } = params;
  if (!customerId || !guestId) {
    return;
  }

  const cartRepository = container.resolve<CartRepository>(DI_TOKENS.CartRepository);
  const customerCart = await cartRepository.findByCustomerId(customerId);
  const guestCart = await cartRepository.findByGuestId(guestId);

  if (!guestCart) {
    return;
  }

  if (!customerCart) {
    guestCart.assignToCustomer(customerId);
    await cartRepository.save(guestCart);
    return;
  }

  for (const line of guestCart.lines) {
    customerCart.addLine({
      id: uuidv4(),
      productId: line.productId,
      quantity: line.quantity,
    });
  }

  await cartRepository.save(customerCart);
  await cartRepository.delete(guestCart.id);
}

export const cartPublicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.optionalStorefrontAuth);

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Cart'],
      },
    },
    async (request) => {
      const customerId = (request as any).storefrontUser?.id as string | undefined;
      const guestId = getGuestId(request);

      await mergeGuestCartIfNeeded({ customerId, guestId });

      const cart = await loadEnrichedCartForIdentity({ customerId, guestId });
      return cart ?? { lines: [] };
    },
  );

  fastify.post(
    '/',
    {
      schema: {
        tags: ['Cart'],
        body: addBodySchema,
      },
    },
    async (request, reply) => {
      const { productId, quantity } = request.body as z.infer<typeof addBodySchema>;
      const customerId = (request as any).storefrontUser?.id as string | undefined;
      const guestId = getGuestId(request);

      if (!customerId && !guestId) {
        return reply.status(400).send({ message: 'Guest ID or User required' });
      }

      await mergeGuestCartIfNeeded({ customerId, guestId });

      try {
        const addToCartService = container.resolve<AddToCartService>(DI_TOKENS.AddToCartService);
        await addToCartService.addItem({
          customerId,
          guestId: customerId ? undefined : guestId,
          productId,
          quantity,
        });

        return (await loadEnrichedCartForIdentity({ customerId, guestId })) ?? { lines: [] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update cart';
        if (message.includes('Either customerId or guestId')) {
          return reply.status(400).send({ message: 'Guest ID or User required' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  fastify.put(
    '/:lineId',
    {
      schema: {
        tags: ['Cart'],
        params: lineParamsSchema,
        body: updateBodySchema,
      },
    },
    async (request, reply) => {
      const { lineId } = request.params as z.infer<typeof lineParamsSchema>;
      const { quantity } = request.body as z.infer<typeof updateBodySchema>;
      const customerId = (request as any).storefrontUser?.id as string | undefined;
      const guestId = getGuestId(request);

      try {
        const addToCartService = container.resolve<AddToCartService>(DI_TOKENS.AddToCartService);
        await addToCartService.updateLineQuantity({
          customerId,
          guestId: customerId ? undefined : guestId,
          lineId,
          quantity,
        });

        return (await loadEnrichedCartForIdentity({ customerId, guestId })) ?? { lines: [] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update cart';
        if (message.includes('Cart not found')) {
          return reply.status(404).send({ message: 'Cart not found' });
        }
        if (message.includes('Cart line not found')) {
          return reply.status(404).send({ message: 'Line item not found in cart' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  fastify.delete(
    '/:lineId',
    {
      schema: {
        tags: ['Cart'],
        params: lineParamsSchema,
      },
    },
    async (request, reply) => {
      const { lineId } = request.params as z.infer<typeof lineParamsSchema>;
      const customerId = (request as any).storefrontUser?.id as string | undefined;
      const guestId = getGuestId(request);

      try {
        const addToCartService = container.resolve<AddToCartService>(DI_TOKENS.AddToCartService);
        await addToCartService.removeLine({
          customerId,
          guestId: customerId ? undefined : guestId,
          lineId,
        });

        return (await loadEnrichedCartForIdentity({ customerId, guestId })) ?? { lines: [] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update cart';
        if (message.includes('Cart not found')) {
          return reply.status(404).send({ message: 'Cart not found' });
        }
        if (message.includes('Cart line not found')) {
          return reply.status(404).send({ message: 'Line item not found in cart' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  fastify.delete(
    '/',
    {
      schema: {
        tags: ['Cart'],
      },
    },
    async (request) => {
      const customerId = (request as any).storefrontUser?.id as string | undefined;
      const guestId = getGuestId(request);

      const addToCartService = container.resolve<AddToCartService>(DI_TOKENS.AddToCartService);
      await addToCartService.clearCart({
        customerId,
        guestId: customerId ? undefined : guestId,
      });

      return { message: 'Cart emptied', lines: [] };
    },
  );
};
