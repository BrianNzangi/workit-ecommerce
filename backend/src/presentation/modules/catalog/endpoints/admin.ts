import { FastifyPluginAsync } from 'fastify';
import { container, DI_TOKENS } from '../../../../infrastructure/di/container.js';
import { AdminProductsService } from '../../../../application/catalog/services/AdminProductsService.js';

export const catalogAdminRoutes: FastifyPluginAsync = async (fastify) => {
  const preAdmin = [fastify.authenticate, fastify.authorizePermission('catalog.manage')];

  const adminService = () => container.resolve<AdminProductsService>(DI_TOKENS.AdminProductsService);

  const enqueueSearchSync = async (job: { type: string; payload: any }, context: string) => {
    try {
      await (fastify as any).jobs.enqueue(job as any);
    } catch (error) {
      fastify.log.error({ error, context }, 'Product search index sync failed');
    }
  };

  // ─── GET /_admin ── List products (admin) ─────────────────────────────────
  fastify.get('/', { preHandler: preAdmin }, async (request) => {
    const query = request.query as any;
    return adminService().list({
      limit: query.limit,
      offset: query.offset,
      collectionId: query.collectionId,
      brandId: query.brandId,
      enabled: query.enabled,
      q: query.q,
      condition: query.condition,
      stockStatus: query.stockStatus,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      includeTotalAll: query.includeTotalAll,
    });
  });

  // ─── POST /_admin ── Create product ──────────────────────────────────────
  fastify.post('/', { preHandler: preAdmin }, async (request, reply) => {
    try {
      return await adminService().create(request.body as any);
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  // ─── GET /_admin/search ── Admin search ──────────────────────────────────
  fastify.get('/search', { preHandler: preAdmin }, async (request) => {
    const { q, limit = 50 } = request.query as any;
    return adminService().list({ q, limit: Number(limit) });
  });

  // ─── POST /_admin/search/reindex ── Reindex search ───────────────────────
  fastify.post('/search/reindex', { preHandler: preAdmin }, async () => {
    await enqueueSearchSync({ type: 'search.reindex', payload: {} }, 'reindex');
    return { success: true, queued: true };
  });

  // ─── GET /_admin/template ── Download CSV template ───────────────────────
  fastify.get('/template', { preHandler: preAdmin }, async (_request, reply) => {
    const headers = [
      'name', 'slug', 'sku', 'description', 'salePrice', 'originalPrice',
      'stockOnHand', 'enabled', 'condition', 'brandSlug', 'collections', 'vat', 'vatInclusive',
    ];
    const sampleRow = [
      'Example Product', 'example-product', 'SKU-001', 'Product description here',
      '1500', '2000', '20', 'true', 'NEW', 'brand-slug', 'collection-slug-1|collection-slug-2',
      '16', 'true',
    ];
    const csv = headers.join(',') + '\n' + sampleRow.join(',') + '\n';
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="product-import-template.csv"');
    return reply.send(csv);
  });

  // ─── GET /_admin/export ── Export products as CSV ────────────────────────
  fastify.get('/export', { preHandler: preAdmin }, async (_request, reply) => {
    const csv = await adminService().exportCSV();
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="products-export-${Date.now()}.csv"`);
    return reply.send(csv);
  });

  // ─── POST /_admin/import ── Import products ──────────────────────────────
  fastify.post('/import', { preHandler: preAdmin }, async (request, reply) => {
    const { products } = request.body as { products: any[] };
    if (!Array.isArray(products) || products.length === 0) {
      return reply.status(400).send({ error: 'No data provided' });
    }

    const result = await adminService().importProducts(products);

    const touchedIds: string[] = [];
    if (result.created > 0 || result.updated > 0) {
      await enqueueSearchSync(
        { type: 'search.sync', payload: { productIds: touchedIds } },
        `import:${touchedIds.length}`,
      );
      try {
        await (fastify as any).cache.invalidateTags(['products', 'homepage-collections']);
      } catch { /* cache may not be available */ }
    }

    return result;
  });

  // ─── POST /_admin/bulk-delete ── Bulk delete products ────────────────────
  fastify.post('/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as { ids: string[] };
    const result = await adminService().bulkDelete(ids);
    await enqueueSearchSync(
      { type: 'search.delete', payload: { productIds: ids } },
      `bulk-delete:${ids?.length}`,
    );
    try {
      await (fastify as any).cache.invalidateTags(['products', 'homepage-collections']);
    } catch { /* cache may not be available */ }
    return result;
  });

  // ─── GET /_admin/:id ── Show product (admin) ────────────────────────────
  fastify.get('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const result = await adminService().getById(id);
    if (!result) return reply.status(404).send({ message: 'Product not found' });
    return result;
  });

  // ─── PUT /_admin/:id ── Update product ──────────────────────────────────
  fastify.put('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    try {
      return await adminService().update(id, request.body);
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  // ─── PATCH /_admin/:id ── Update product (alias) ────────────────────────
  fastify.patch('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    try {
      return await adminService().update(id, request.body);
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });

  // ─── DELETE /_admin/:id ── Delete product ───────────────────────────────
  fastify.delete('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    try {
      const result = await adminService().softDelete(id);
      await enqueueSearchSync(
        { type: 'search.delete', payload: { productIds: [id] } },
        `delete:${id}`,
      );
      try {
        await (fastify as any).cache.invalidateTags(['products', 'homepage-collections']);
      } catch { /* cache may not be available */ }
      return result;
    } catch (err: any) {
      if (err.statusCode) return reply.status(err.statusCode).send({ message: err.message });
      throw err;
    }
  });
};
