import { FastifyPluginAsync } from 'fastify';
import { db, schema, eq, desc, ilike, and, inArray } from '@workit/db';

function sanitizeOrder(order: any) {
  if (!order) return order;
  if (order.customer) {
    const { password, ...rest } = order.customer;
    return { ...order, customer: rest };
  }
  return order;
}

export const ordersAdminRoutes: FastifyPluginAsync = async (fastify) => {
  const preAdmin = [fastify.authenticate, fastify.authorizePermission('orders.manage')];

  const orderRelations = {
    customer: true,
    lines: { with: { product: true } },
    payments: true,
    shippingAddress: true,
    billingAddress: true,
    shippingMethod: true,
  };

  fastify.get('/', { preHandler: preAdmin }, async (request) => {
    const { limit = 50, offset = 0 } = request.query as any;
    const orders = await db.query.orders.findMany({
      limit: Number(limit),
      offset: Number(offset),
      orderBy: [desc(schema.orders.createdAt)],
      with: orderRelations,
    });
    return { orders: orders.map(sanitizeOrder), success: true };
  });

  fastify.get('/search', { preHandler: preAdmin }, async (request) => {
    const { q } = request.query as any;
    if (!q) return { orders: [], success: true };
    const orders = await db.query.orders.findMany({
      where: ilike(schema.orders.id, `%${q}%`),
      orderBy: [desc(schema.orders.createdAt)],
      with: orderRelations,
    });
    return { orders: orders.map(sanitizeOrder), success: true };
  });

  fastify.get('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, id),
      with: orderRelations,
    });
    if (!order) return reply.status(404).send({ message: 'Order not found' });
    return { order: sanitizeOrder(order), success: true };
  });

  fastify.patch('/:id/status', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const { state } = request.body as any;
    const [order] = await db
      .update(schema.orders)
      .set({ state, updatedAt: new Date() })
      .where(eq(schema.orders.id, id))
      .returning();
    if (!order) return reply.status(404).send({ message: 'Order not found' });
    return { order: sanitizeOrder(order), success: true };
  });

  fastify.put('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    const [order] = await db
      .update(schema.orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.orders.id, id))
      .returning();
    if (!order) return reply.status(404).send({ message: 'Order not found' });
    return { order: sanitizeOrder(order), success: true };
  });

  fastify.delete('/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    await db.delete(schema.orders).where(eq(schema.orders.id, id));
    return { success: true };
  });

  fastify.post('/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as any;
    if (!Array.isArray(ids) || ids.length === 0) return { success: false };
    await db.delete(schema.orders).where(inArray(schema.orders.id, ids));
    return { success: true, count: ids.length };
  });
};
