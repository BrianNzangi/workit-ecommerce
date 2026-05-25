import { Container, DI_TOKENS } from './container.js';
import { ProductMapper } from '../persistence/mappers/ProductMapper.js';
import { ProductRepository } from '../persistence/repositories/ProductRepository.js';
import { StockAllocationService } from '../../domain/catalog/services/StockAllocationService.js';
import { SearchProductsService } from '../../application/catalog/services/SearchProductsService.js';

/**
 * Register all Catalog bounded context services in the DI container.
 *
 * No prerequisites required — the Catalog context is self-contained.
 */
export function registerCatalog(container: Container): void {
  // ─── Mappers ────────────────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.ProductMapper, () => new ProductMapper());

  // ─── Repositories ────────────────────────────────────────────────────────────
  container.registerSingleton(
    DI_TOKENS.ProductRepository,
    () => new ProductRepository(),
  );

  // ─── Domain Services ─────────────────────────────────────────────────────────
  container.registerSingleton(
    DI_TOKENS.StockAllocationService,
    () => new StockAllocationService(),
  );

  // ─── Application Services ────────────────────────────────────────────────────
  container.registerSingleton(
    DI_TOKENS.SearchProductsService,
    () => new SearchProductsService(container.resolve(DI_TOKENS.ProductRepository)),
  );
}
