import { FastifyPluginAsync } from 'fastify';
import { shippingPublicRoutes } from './public.js';
import legacyShippingAdminRoutes from '../../../../modules/fulfillment/shipping/endpoints/admin.js';

export const shippingRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(shippingPublicRoutes);
  await fastify.register(legacyShippingAdminRoutes, { prefix: '/admin' });
};
