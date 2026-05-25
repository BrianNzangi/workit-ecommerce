/**
 * Catalog presentation layer adapter.
 *
 * Provides the same API contract as `backend/src/modules/catalog/products/endpoints/public.ts`
 * but delegates to the DDD SearchProductsService when the feature flag is enabled.
 *
 * Feature flag: USE_DDD_CATALOG
 * - true  â†’ uses SearchProductsService (DDD)
 * - false â†’ falls through to the legacy implementation
 *
 * API contract (maintained for backward compatibility):
 *   GET /catalog/products          â†’ { products: [...] }
 *   GET /catalog/products/search   â†’ { products: [...] }
 *   GET /catalog/products/:idOrSlug â†’ product object or 404
 */
import { FastifyPluginAsync } from 'fastify';
import { featureFlags, isRouteMigrationEnabled } from '../../../../infrastructure/feature-flags/flags.js';
import { container, DI_TOKENS } from '../../../../infrastructure/di/container.js';
import { SearchProductsService } from '../../../../application/catalog/services/SearchProductsService.js';
import { Product } from '../../../../domain/catalog/entities/Product.js';

// â”€â”€â”€ Response Serialisation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Serialise a Product aggregate to a plain JSON-compatible object.
 * Matches the shape returned by the legacy backend for backward compatibility.
 */
function serializeProduct(product: Product): Record<string, unknown> {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku?.value ?? null,
    description: product.description,
    originalPrice: product.originalPrice?.amount ?? null,
    salePrice: product.salePrice?.amount ?? null,
    stockOnHand: product.stockOnHand,
    enabled: product.enabled,
    condition: product.condition,
    brandId: product.brandId,
    vat: product.vat,
    vatInclusive: product.vatInclusive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// â”€â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const catalogPublicRoutes: FastifyPluginAsync = async (fastify) => {
  // â”€â”€â”€ GET /products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fastify.get(
    '/',
    {
      schema: { tags: ['Catalog'] },
    },
    async (request, reply) => {
      if (!isRouteMigrationEnabled(featureFlags.useDDDCatalog)) {
        return reply.status(501).send({ message: 'DDD catalog not enabled' });
      }

      const { limit = 50, offset = 0, collection: collectionSlug } = request.query as any;

      try {
        const searchService = container.resolve<SearchProductsService>(
          DI_TOKENS.SearchProductsService,
        );

        const result = await searchService.execute({
          collectionId: collectionSlug,
          limit: Number(limit),
          offset: Number(offset),
          enabledOnly: true,
        });

        return { products: result.products.map(serializeProduct) };
      } catch (err) {
        fastify.log.error({ err }, '[DDD Catalog] list products failed');
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  // â”€â”€â”€ GET /products/search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fastify.get(
    '/search',
    {
      schema: { tags: ['Catalog'] },
    },
    async (request, reply) => {
      if (!isRouteMigrationEnabled(featureFlags.useDDDCatalog)) {
        return reply.status(501).send({ message: 'DDD catalog not enabled' });
      }

      const { q } = request.query as any;

      if (!q) {
        return { products: [] };
      }

      try {
        const searchService = container.resolve<SearchProductsService>(
          DI_TOKENS.SearchProductsService,
        );

        const result = await searchService.execute({
          query: String(q),
          enabledOnly: true,
        });

        return { products: result.products.map(serializeProduct) };
      } catch (err) {
        fastify.log.error({ err }, '[DDD Catalog] search products failed');
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  // â”€â”€â”€ GET /products/:idOrSlug â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fastify.get(
    '/:idOrSlug',
    {
      schema: { tags: ['Catalog'] },
    },
    async (request, reply) => {
      if (!isRouteMigrationEnabled(featureFlags.useDDDCatalog)) {
        return reply.status(501).send({ message: 'DDD catalog not enabled' });
      }

      const { idOrSlug } = request.params as any;

      try {
        const searchService = container.resolve<SearchProductsService>(
          DI_TOKENS.SearchProductsService,
        );

        // Try by ID first, then fall back to slug search
        let product = await searchService.findById(idOrSlug);

        if (!product) {
          // Search by slug via the search method
          const result = await searchService.execute({
            query: idOrSlug,
            enabledOnly: false,
            limit: 10,
          });
          product = result.products.find((p) => p.slug === idOrSlug) ?? null;
        }

        if (!product) {
          return reply.status(404).send({ message: 'Product not found' });
        }

        return serializeProduct(product);
      } catch (err) {
        fastify.log.error({ err }, '[DDD Catalog] get product failed');
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );
};


