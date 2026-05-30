import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from "uuid";
import { db, schema, eq, desc, ilike, and, inArray } from '@workit/db';

export const customersAdminRoutes: FastifyPluginAsync = async (fastify) => {
  const preAdmin = [fastify.authenticate, fastify.authorizePermission('customers.manage')];

  const customerRelations = {
    addresses: true,
    orders: {
      limit: 50,
      orderBy: [desc(schema.orders.createdAt)],
    },
  };

  const userBaseFilter = eq(schema.users.role, 'CUSTOMER');

  fastify.get('/', { preHandler: preAdmin }, async (request) => {
    const { limit = 50, offset = 0, q } = request.query as any;
    const conditions: any[] = [userBaseFilter];
    if (q) conditions.push(ilike(schema.users.name, `%${q}%`));

    const customers = await db.query.users.findMany({
      where: and(...conditions),
      limit: Number(limit),
      offset: Number(offset),
      orderBy: [desc(schema.users.createdAt)],
      with: { addresses: true },
    });

    return { customers, success: true };
  });

  fastify.get('/search', { preHandler: preAdmin }, async (request) => {
    const { q } = request.query as any;
    if (!q) return { customers: [], success: true };
    const customers = await db.query.users.findMany({
      where: and(
        userBaseFilter,
        ilike(schema.users.name, `%${q}%`),
      ),
      with: { addresses: true },
    });
    return { customers, success: true };
  });

  fastify.post('/', { preHandler: preAdmin }, async (request, reply) => {
    const body = request.body as any;
    const id = uuidv4();

    const [customer] = await db.insert(schema.users).values({
      id,
      email: body.email,
      name: `${body.firstName} ${body.lastName}`.trim(),
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber || null,
      password: body.password || null,
      role: 'CUSTOMER',
      emailVerified: false,
    }).returning();

    return { customer, success: true };
  });

  fastify.get('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const customer = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        addresses: true,
        orders: {
          limit: 50,
          orderBy: [desc(schema.orders.createdAt)],
          with: { lines: { with: { product: true } } },
        },
      },
    });

    if (!customer) return reply.status(404).send({ message: 'Customer not found' });

    const totalSpent = (customer.orders || []).reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
    const { password, ...safeCustomer } = customer;

    return {
      customer: {
        ...safeCustomer,
        address: customer.addresses?.[0] || null,
        totalSpent,
        ordersCount: customer.orders?.length || 0,
      },
      success: true,
    };
  });

  fastify.put('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    const [customer] = await db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    if (!customer) return reply.status(404).send({ message: 'Customer not found' });
    return { customer, success: true };
  });

  fastify.delete('/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    await db.delete(schema.users).where(eq(schema.users.id, id));
    return { success: true };
  });

  fastify.post('/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as any;
    if (!Array.isArray(ids) || ids.length === 0) return { success: false };
    await db.delete(schema.users).where(inArray(schema.users.id, ids));
    return { success: true, count: ids.length };
  });

  fastify.get('/:id/preferences', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    let prefs = await db.query.customerPreferences.findFirst({
      where: eq(schema.customerPreferences.customerId, id),
    });
    if (!prefs) {
      prefs = {
        emailNotifications: true,
        smsNotifications: false,
        promoNotifications: true,
      } as any;
    }
    return { preferences: prefs, success: true };
  });

  fastify.put('/:id/preferences', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;

    const existing = await db.query.customerPreferences.findFirst({
      where: eq(schema.customerPreferences.customerId, id),
    });

    let prefs;
    if (existing) {
      [prefs] = await db
        .update(schema.customerPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.customerPreferences.customerId, id))
        .returning();
    } else {
      [prefs] = await db.insert(schema.customerPreferences).values({
        id: uuidv4(),
        customerId: id,
        emailNotifications: data.emailNotifications ?? true,
        smsNotifications: data.smsNotifications ?? false,
        promoNotifications: data.promoNotifications ?? true,
      }).returning();
    }

    return { preferences: prefs, success: true };
  });
};
