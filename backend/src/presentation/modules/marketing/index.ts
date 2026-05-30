import { FastifyPluginAsync } from 'fastify';
import { campaignAdminRoutes } from './endpoints/admin.js';
import { bannerAdminRoutes } from './endpoints/banner-admin.js';
import { blogAdminRoutes } from './endpoints/blog-admin.js';
import { homepageAdminRoutes } from './endpoints/homepage-admin.js';

export const marketingRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(campaignAdminRoutes, { prefix: '/campaigns/admin' });
  await fastify.register(bannerAdminRoutes, { prefix: '/banners/admin' });
  await fastify.register(blogAdminRoutes, { prefix: '/blog/admin' });
  await fastify.register(homepageAdminRoutes, { prefix: '/homepage/admin' });
};
