import { FastifyPluginAsync } from 'fastify';
import { catalogPublicRoutes } from './endpoints/public.js';

export const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(catalogPublicRoutes);
};
