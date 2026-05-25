import {
  IProductRepository,
  ProductSearchParams,
  ProductSearchResult,
} from '../../../domain/catalog/repositories/IProductRepository.js';
import { Product } from '../../../domain/catalog/entities/Product.js';

export interface SearchProductsRequest {
  /** Full-text search query. */
  query?: string;
  /** Filter by brand ID. */
  brandId?: string;
  /** Filter by collection ID. */
  collectionId?: string;
  /** Minimum price filter. */
  minPrice?: number;
  /** Maximum price filter. */
  maxPrice?: number;
  /** Only return enabled products. Defaults to true. */
  enabledOnly?: boolean;
  /** Page size. Defaults to 50. */
  limit?: number;
  /** Page offset. Defaults to 0. */
  offset?: number;
}

export interface SearchProductsResponse {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Application service for searching the product catalogue.
 *
 * Orchestrates the query by delegating to the IProductRepository.
 * Does not contain business logic — that lives in the domain layer.
 *
 * Requirements: 8.1, 8.6
 */
export class SearchProductsService {
  constructor(private readonly productRepository: IProductRepository) {}

  /**
   * Search products with optional filters and pagination.
   *
   * @param request - Search parameters.
   * @returns Matching products and total count for pagination.
   */
  async execute(request: SearchProductsRequest): Promise<SearchProductsResponse> {
    const limit = request.limit ?? 50;
    const offset = request.offset ?? 0;

    const searchParams: ProductSearchParams = {
      query: request.query,
      brandId: request.brandId,
      collectionId: request.collectionId,
      minPrice: request.minPrice,
      maxPrice: request.maxPrice,
      enabledOnly: request.enabledOnly ?? true,
      limit,
      offset,
    };

    const result: ProductSearchResult = await this.productRepository.search(searchParams);

    return {
      products: result.products,
      total: result.total,
      limit,
      offset,
    };
  }

  /**
   * Find a single product by ID.
   * Returns null if not found.
   */
  async findById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }
}
