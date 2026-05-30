import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from "uuid";
import { db, schema, eq } from '@workit/db';
import { container, DI_TOKENS } from '../../../../infrastructure/di/container.js';
import { ShippingMethodRepository } from '../../../../infrastructure/persistence/repositories/ShippingMethodRepository.js';
import { ShippingMethod } from '../../../../domain/fulfillment/entities/ShippingMethod.js';

export const shippingAdminRoutes: FastifyPluginAsync = async (fastify) => {
  const preAdmin = [fastify.authenticate, fastify.authorizePermission('shipping.manage')];

  const invalidateShipping = async () => {
    try { await (fastify as any).cache.invalidateTags(['shipping']); } catch { }
  };

  // ─── Shipping Methods ─────────────────────────────────────────────────────

  fastify.get('/', { preHandler: preAdmin }, async () => {
    const methods = await db.query.shippingMethods.findMany({
      with: {
        zones: { with: { cities: true } },
      },
    });
    return methods;
  });

  fastify.post('/', { preHandler: preAdmin }, async (request) => {
    const data = request.body as any;
    const id = uuidv4();
    const [method] = await db.insert(schema.shippingMethods).values({ ...data, id }).returning();
    await invalidateShipping();
    return method;
  });

  fastify.put('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    const [method] = await db
      .update(schema.shippingMethods)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.shippingMethods.id, id))
      .returning();
    if (!method) return reply.status(404).send({ message: 'Shipping method not found' });
    await invalidateShipping();
    return method;
  });

  fastify.delete('/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    await db.delete(schema.shippingMethods).where(eq(schema.shippingMethods.id, id));
    await invalidateShipping();
    return { success: true };
  });

  // ─── Shipping Zones ───────────────────────────────────────────────────────

  fastify.get('/zones', { preHandler: preAdmin }, async () => {
    const zones = await db.query.shippingZones.findMany({
      with: { cities: true },
    });
    return zones;
  });

  fastify.post('/zones', { preHandler: preAdmin }, async (request) => {
    const { shippingMethodId, county, cities } = request.body as any;
    const zoneId = uuidv4();

    await db.insert(schema.shippingZones).values({
      id: zoneId,
      shippingMethodId,
      county,
    });

    if (Array.isArray(cities) && cities.length > 0) {
      await db.insert(schema.shippingCities).values(
        cities.map((city: any) => ({
          id: uuidv4(),
          zoneId,
          cityTown: city.cityTown,
          standardPrice: city.standardPrice,
          expressPrice: city.expressPrice || 0,
        })),
      );
    }

    await invalidateShipping();
    return { id: zoneId, success: true };
  });

  fastify.patch('/zones/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const { county, cities } = request.body as any;

    await db
      .update(schema.shippingZones)
      .set({ county, updatedAt: new Date() })
      .where(eq(schema.shippingZones.id, id));

    if (Array.isArray(cities)) {
      await db.delete(schema.shippingCities).where(eq(schema.shippingCities.zoneId, id));
      if (cities.length > 0) {
        await db.insert(schema.shippingCities).values(
          cities.map((city: any) => ({
            id: uuidv4(),
            zoneId: id,
            cityTown: city.cityTown,
            standardPrice: city.standardPrice,
            expressPrice: city.expressPrice || 0,
          })),
        );
      }
    }

    await invalidateShipping();
    return { success: true };
  });

  fastify.delete('/zones/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    await db.delete(schema.shippingZones).where(eq(schema.shippingZones.id, id));
    await invalidateShipping();
    return { success: true };
  });
};
