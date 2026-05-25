import { FastifyPluginAsync } from 'fastify';
import { db, eq, schema } from '@workit/db';
import { container, DI_TOKENS } from '../../../../infrastructure/di/container.js';
import { ShippingMethodRepository } from '../../../../infrastructure/persistence/repositories/ShippingMethodRepository.js';

function serializeShippingMethod(method: any) {
  return {
    id: method.id,
    code: method.code,
    name: method.name,
    description: method.description ?? null,
    enabled: method.enabled,
    isExpress: method.isExpress,
    createdAt: method.createdAt,
    updatedAt: method.updatedAt,
  };
}

export const shippingPublicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/methods',
    {
      schema: {
        tags: ['Fulfillment'],
      },
    },
    async () => {
      const shippingRepository = container.resolve<ShippingMethodRepository>(
        DI_TOKENS.ShippingMethodRepository,
      );
      const methods = await shippingRepository.findAllEnabled();
      return { methods: methods.map(serializeShippingMethod) };
    },
  );

  fastify.get(
    '/methods/:id',
    {
      schema: {
        tags: ['Fulfillment'],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const method = await db.query.shippingMethods.findFirst({
        where: eq(schema.shippingMethods.id, id),
        with: {
          zones: {
            with: {
              cities: true,
            },
          },
        },
      });

      if (!method) {
        return reply.status(404).send({ message: 'Shipping method not found' });
      }

      return method;
    },
  );

  fastify.get(
    '/zones',
    {
      schema: {
        tags: ['Fulfillment'],
      },
    },
    async () => {
      const zones = await db.query.shippingZones.findMany({
        with: { cities: true },
      });
      return { zones };
    },
  );
};
