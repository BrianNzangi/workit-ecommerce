import { Product } from '../entities/Product.js';
import { ProductSKU } from '../value-objects/ProductSKU.js';

export interface ProductSearchParams {
  /** Full-text search query matched against name, description, and SKU. */
  query?: string;
  /** Filter by brand ID. */
  brandId?: string;
  /** Filter by collection ID. */
  collectionId?: string;
  /** Minimum price filter (inclusive). */
  minPrice?: number;
  /** Maximum price filter (inclusive). */
  maxPrice?: number;
  /** Only return enabled products. Defaults to true. */
  enabledOnly?: boolean;
  /** Maximum number of results to return. */
  limit?: number;
  /** Number of results to skip (for pagination). */
  offset?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
}

/**
 * Repository interface for the Product aggregate.
 *
 * Defined in the Domain layer; implemented in the Infrastructure layer.
 * The domain layer must NOT import from the infrastructure layer.
 */
export interface IProductRepository {
  /**
   * Find a product by its unique ID.
   * Returns null if no product with that ID exists.
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find a product by its SKU value object.
   * Returns null if no product with that SKU exists.
   */
  findBySKU(sku: ProductSKU): Promise<Product | null>;

  /**
   * Load multiple products by their IDs in a single query.
   * Products not found are silently omitted from the result.
   * Preserves no particular ordering.
   */
  findByIds(ids: string[]): Promise<Product[]>;

  /**
   * Persist a product aggregate (insert or update).
   * The implementation must save all state changes including stock updates.
   */
  save(product: Product): Promise<void>;

  /**
   * Search products with optional filters and pagination.
   * Returns the matching products and the total count (before pagination).
   */
  search(params: ProductSearchParams): Promise<ProductSearchResult>;
}
