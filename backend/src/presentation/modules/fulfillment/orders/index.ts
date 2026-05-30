import { FastifyPluginAsync } from 'fastify';
import { orderPublicRoutes } from './public.js';
import { ordersAdminRoutes } from './admin.js';

export const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(orderPublicRoutes, { prefix: '/' });
  await fastify.register(ordersAdminRoutes, { prefix: '/admin' });
};
