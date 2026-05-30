import { FastifyPluginAsync } from 'fastify';
import { promotionsAdminRoutes } from './endpoints/admin.js';

export const promotionsRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(promotionsAdminRoutes);
};
