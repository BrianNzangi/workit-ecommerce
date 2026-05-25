import { FastifyPluginAsync } from 'fastify';
import { identityPublicRoutes } from './endpoints/public.js';
import customersAdminRoutes from '../../../modules/identity/customers/endpoints/admin.js';

export const identityRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(identityPublicRoutes);
  await fastify.register(customersAdminRoutes, { prefix: '/admin' });
};
