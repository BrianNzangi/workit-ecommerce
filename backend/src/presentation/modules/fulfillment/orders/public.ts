import { FastifyPluginAsync } from 'fastify';
import { db, desc, eq, or, schema } from '@workit/db';

export const orderPublicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Fulfillment'],
      },
      preHandler: [fastify.authenticateStorefront],
    },
    async (request) => {
      const user = request.storefrontUser as { id?: string } | undefined;
      if (!user?.id) {
        return { orders: [] };
      }

      const orders = await db.query.orders.findMany({
        where: eq(schema.orders.customerId, user.id),
        orderBy: [desc(schema.orders.createdAt)],
        with: {
          lines: {
            with: {
              product: true,
            },
          },
        },
      });

      return { orders };
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['Fulfillment'],
      },
      preHandler: [fastify.authenticateStorefront],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.storefrontUser as { id?: string } | undefined;

      const order = await db.query.orders.findFirst({
        where: or(
          eq(schema.orders.id, id),
          eq(schema.orders.code, id),
        ),
        with: {
          lines: {
            with: {
              product: true,
            },
          },
          customer: true,
          shippingAddress: true,
          payments: true,
        },
      });

      if (!order) {
        return reply.status(404).send({ message: 'Order not found' });
      }

      if (order.customerId !== user?.id) {
        return reply.status(403).send({ message: 'Unauthorized' });
      }

      return order;
    },
  );
};
