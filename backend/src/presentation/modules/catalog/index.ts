import { FastifyPluginAsync } from 'fastify';
import { catalogPublicRoutes } from './endpoints/public.js';
import { catalogAdminRoutes } from './endpoints/admin.js';

export const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(catalogPublicRoutes);
  await fastify.register(catalogAdminRoutes, { prefix: '/_admin' });
};
