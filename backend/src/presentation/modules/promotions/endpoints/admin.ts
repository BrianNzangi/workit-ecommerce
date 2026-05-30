import { FastifyPluginAsync } from 'fastify';
import { container, DI_TOKENS } from '../../../../infrastructure/di/container.js';
import { AdminCouponService } from '../../../../application/promotions/services/AdminCouponService.js';
import { AdminFlashSaleService } from '../../../../application/promotions/services/AdminFlashSaleService.js';
import { AdminFeaturedDealService } from '../../../../application/promotions/services/AdminFeaturedDealService.js';
import { AdminClearanceDealService } from '../../../../application/promotions/services/AdminClearanceDealService.js';

export const promotionsAdminRoutes: FastifyPluginAsync = async (fastify) => {
  const preAdmin = [fastify.authenticate, fastify.authorizePermission('promotions.manage')];

  const couponService = () => container.resolve<AdminCouponService>(DI_TOKENS.AdminCouponService);
  const flashSaleService = () => container.resolve<AdminFlashSaleService>(DI_TOKENS.AdminFlashSaleService);
  const featuredDealService = () => container.resolve<AdminFeaturedDealService>(DI_TOKENS.AdminFeaturedDealService);
  const clearanceDealService = () => container.resolve<AdminClearanceDealService>(DI_TOKENS.AdminClearanceDealService);

  const invalidatePromotions = async () => {
    try { await (fastify as any).cache.invalidateTags(['promotions']); } catch { }
  };

  // ─── COUPONS ────────────────────────────────────────────────────────────────

  fastify.get('/coupons/admin', { preHandler: preAdmin }, async (request) => {
    const q = request.query as any;
    return couponService().list({ limit: q.limit, offset: q.offset, status: q.status, q: q.q });
  });

  fastify.post('/coupons/admin', { preHandler: preAdmin }, async (request, reply) => {
    try {
      const result = await couponService().create(request.body as any);
      await invalidatePromotions();
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  fastify.get('/coupons/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const result = await couponService().getById(id);
    if (!result) return reply.status(404).send({ message: 'Coupon not found' });
    return result;
  });

  fastify.put('/coupons/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    try {
      const result = await couponService().update(id, request.body as any);
      await invalidatePromotions();
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  fastify.delete('/coupons/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    const result = await couponService().delete(id);
    await invalidatePromotions();
    return result;
  });

  fastify.post('/coupons/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as any;
    const result = await couponService().bulkDelete(ids);
    await invalidatePromotions();
    return result;
  });

  // ─── FLASH SALES ────────────────────────────────────────────────────────────

  fastify.get('/flash-sales/admin', { preHandler: preAdmin }, async (request) => {
    const q = request.query as any;
    return flashSaleService().list({ limit: q.limit, offset: q.offset, status: q.status, q: q.q });
  });

  fastify.post('/flash-sales/admin', { preHandler: preAdmin }, async (request, reply) => {
    try {
      const result = await flashSaleService().create(request.body as any);
      await invalidatePromotions();
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  fastify.get('/flash-sales/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const result = await flashSaleService().getById(id);
    if (!result) return reply.status(404).send({ message: 'Flash sale not found' });
    return result;
  });

  fastify.put('/flash-sales/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    try {
      const result = await flashSaleService().update(id, request.body as any);
      await invalidatePromotions();
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  fastify.delete('/flash-sales/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    const result = await flashSaleService().delete(id);
    await invalidatePromotions();
    return result;
  });

  fastify.post('/flash-sales/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as any;
    const result = await flashSaleService().bulkDelete(ids);
    await invalidatePromotions();
    return result;
  });

  // ─── FEATURED DEALS ─────────────────────────────────────────────────────────

  fastify.get('/featured-deals/admin', { preHandler: preAdmin }, async (request) => {
    const q = request.query as any;
    return featuredDealService().list({ limit: q.limit, offset: q.offset, status: q.status, q: q.q });
  });

  fastify.post('/featured-deals/admin', { preHandler: preAdmin }, async (request, reply) => {
    try {
      const result = await featuredDealService().create(request.body as any);
      await invalidatePromotions();
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  fastify.get('/featured-deals/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const result = await featuredDealService().getById(id);
    if (!result) return reply.status(404).send({ message: 'Featured deal not found' });
    return result;
  });

  fastify.put('/featured-deals/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    try {
      const result = await featuredDealService().update(id, request.body as any);
      await invalidatePromotions();
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  fastify.delete('/featured-deals/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    const result = await featuredDealService().delete(id);
    await invalidatePromotions();
    return result;
  });

  fastify.post('/featured-deals/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as any;
    const result = await featuredDealService().bulkDelete(ids);
    await invalidatePromotions();
    return result;
  });

  // ─── CLEARANCE DEALS ────────────────────────────────────────────────────────

  fastify.get('/clearance-deals/admin', { preHandler: preAdmin }, async (request) => {
    const q = request.query as any;
    return clearanceDealService().list({ limit: q.limit, offset: q.offset, status: q.status, q: q.q, deal: q.deal });
  });

  fastify.post('/clearance-deals/admin', { preHandler: preAdmin }, async (request, reply) => {
    try {
      const result = await clearanceDealService().create(request.body as any);
      await invalidatePromotions();
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  fastify.get('/clearance-deals/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const result = await clearanceDealService().getById(id);
    if (!result) return reply.status(404).send({ message: 'Clearance deal not found' });
    return result;
  });

  fastify.put('/clearance-deals/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    try {
      const result = await clearanceDealService().update(id, request.body as any);
      await invalidatePromotions();
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  fastify.delete('/clearance-deals/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    const result = await clearanceDealService().delete(id);
    await invalidatePromotions();
    return result;
  });

  fastify.post('/clearance-deals/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as any;
    const result = await clearanceDealService().bulkDelete(ids);
    await invalidatePromotions();
    return result;
  });
};
