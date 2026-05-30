import { FastifyPluginAsync } from 'fastify';
import { shippingPublicRoutes } from './public.js';
import { shippingAdminRoutes } from './admin.js';

export const shippingRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(shippingPublicRoutes);
  await fastify.register(shippingAdminRoutes, { prefix: '/admin' });
};
