import { Product } from '../../../domain/catalog/entities/Product.js';
import { ProductSKU } from '../../../domain/catalog/value-objects/ProductSKU.js';
import { IProductRepository, ProductSearchParams, ProductSearchResult } from '../../../domain/catalog/repositories/IProductRepository.js';
import { ProductRepository } from './ProductRepository.js';

/**
 * Cached wrapper around ProductRepository.
 *
 * Implements in-memory caching for frequently accessed products with TTL-based invalidation.
 * Cache is invalidated on ProductStockChanged domain events.
 *
 * Requirements: 25.3
 */
export class CachedProductRepository implements IProductRepository {
  private readonly repository: ProductRepository;
  private readonly cache = new Map<string, { product: Product | null; expiresAt: number }>();
  private readonly searchCache = new Map<string, { result: ProductSearchResult; expiresAt: number }>();
  private readonly ttlMs: number;

  constructor(repository: ProductRepository, ttlMs: number = 5 * 60 * 1000) {
    this.repository = repository;
    this.ttlMs = ttlMs;
  }

  async findById(id: string): Promise<Product | null> {
    const cached = this.cache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.product;
    }

    const product = await this.repository.findById(id);
    this.cache.set(id, {
      product,
      expiresAt: Date.now() + this.ttlMs,
    });

    return product;
  }

  async findBySKU(sku: ProductSKU): Promise<Product | null> {
    const cacheKey = `sku:${sku.value}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.product;
    }

    const product = await this.repository.findBySKU(sku);
    this.cache.set(cacheKey, {
      product,
      expiresAt: Date.now() + this.ttlMs,
    });

    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    const results: Product[] = [];
    const missingIds: string[] = [];

    // Check cache for each ID
    for (const id of ids) {
      const cached = this.cache.get(id);
      if (cached && cached.expiresAt > Date.now()) {
        if (cached.product) {
          results.push(cached.product);
        }
      } else {
        missingIds.push(id);
      }
    }

    // Fetch missing products
    if (missingIds.length > 0) {
      const products = await this.repository.findByIds(missingIds);
      for (const product of products) {
        this.cache.set(product.id, {
          product,
          expiresAt: Date.now() + this.ttlMs,
        });
        results.push(product);
      }
    }

    return results;
  }

  async save(product: Product): Promise<void> {
    // Invalidate cache for this product
    this.cache.delete(product.id);
    if (product.sku) {
      this.cache.delete(`sku:${product.sku.value}`);
    }
    this.clearSearchCache();

    await this.repository.save(product);
  }

  async search(params: ProductSearchParams): Promise<ProductSearchResult> {
    const cacheKey = this.buildSearchCacheKey(params);
    const cached = this.searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const result = await this.repository.search(params);
    this.searchCache.set(cacheKey, {
      result,
      expiresAt: Date.now() + this.ttlMs,
    });

    return result;
  }

  /**
   * Invalidate cache for a product when stock changes.
   * Called by event handlers on ProductStockChanged events.
   */
  invalidateProduct(productId: string): void {
    this.cache.delete(productId);
    this.clearSearchCache();
  }

  /**
   * Clear all search cache entries.
   */
  private clearSearchCache(): void {
    this.searchCache.clear();
  }

  async softDelete(id: string): Promise<void> {
    this.cache.delete(id);
    this.clearSearchCache();
    return this.repository.softDelete(id);
  }

  async countAll(): Promise<number> {
    return this.repository.countAll();
  }

  async findByIdentifier(identifier: string): Promise<Product | null> {
    const cacheKey = `ident:${identifier}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.product;
    }
    const product = await this.repository.findByIdentifier(identifier);
    if (product) {
      this.cache.set(product.id, { product, expiresAt: Date.now() + this.ttlMs });
    }
    return product;
  }

  /**
   * Build a cache key from search parameters.
   */
  private buildSearchCacheKey(params: ProductSearchParams): string {
    const parts = [
      params.query || '',
      params.brandId || '',
      params.collectionId || '',
      params.minPrice ?? '',
      params.maxPrice ?? '',
      params.condition || '',
      params.stockStatus || '',
      params.enabledOnly ?? true,
      params.limit ?? 50,
      params.offset ?? 0,
    ];
    return `search:${parts.join('|')}`;
  }
}
