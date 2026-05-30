import { Container, DI_TOKENS } from './container.js';
import { CouponMapper } from '../persistence/mappers/CouponMapper.js';
import { FlashSaleMapper } from '../persistence/mappers/FlashSaleMapper.js';
import { FeaturedDealMapper } from '../persistence/mappers/FeaturedDealMapper.js';
import { ClearanceDealMapper } from '../persistence/mappers/ClearanceDealMapper.js';
import { CouponRepository } from '../persistence/repositories/CouponRepository.js';
import { FlashSaleRepository } from '../persistence/repositories/FlashSaleRepository.js';
import { FeaturedDealRepository } from '../persistence/repositories/FeaturedDealRepository.js';
import { ClearanceDealRepository } from '../persistence/repositories/ClearanceDealRepository.js';
import {
  AdminCouponService,
  AdminFlashSaleService,
  AdminFeaturedDealService,
  AdminClearanceDealService,
} from '../../application/promotions/services/index.js';

export function registerPromotions(container: Container): void {
  container.registerSingleton(DI_TOKENS.CouponMapper, () => new CouponMapper());
  container.registerSingleton(DI_TOKENS.FlashSaleMapper, () => new FlashSaleMapper());
  container.registerSingleton(DI_TOKENS.FeaturedDealMapper, () => new FeaturedDealMapper());
  container.registerSingleton(DI_TOKENS.ClearanceDealMapper, () => new ClearanceDealMapper());

  container.registerSingleton(
    DI_TOKENS.CouponRepository,
    () => new CouponRepository(container.resolve(DI_TOKENS.CouponMapper)),
  );
  container.registerSingleton(
    DI_TOKENS.FlashSaleRepository,
    () => new FlashSaleRepository(container.resolve(DI_TOKENS.FlashSaleMapper)),
  );
  container.registerSingleton(
    DI_TOKENS.FeaturedDealRepository,
    () => new FeaturedDealRepository(container.resolve(DI_TOKENS.FeaturedDealMapper)),
  );
  container.registerSingleton(
    DI_TOKENS.ClearanceDealRepository,
    () => new ClearanceDealRepository(container.resolve(DI_TOKENS.ClearanceDealMapper)),
  );

  container.registerSingleton(
    DI_TOKENS.AdminCouponService,
    () => new AdminCouponService(container.resolve(DI_TOKENS.CouponRepository)),
  );
  container.registerSingleton(
    DI_TOKENS.AdminFlashSaleService,
    () => new AdminFlashSaleService(container.resolve(DI_TOKENS.FlashSaleRepository)),
  );
  container.registerSingleton(
    DI_TOKENS.AdminFeaturedDealService,
    () => new AdminFeaturedDealService(container.resolve(DI_TOKENS.FeaturedDealRepository)),
  );
  container.registerSingleton(
    DI_TOKENS.AdminClearanceDealService,
    () => new AdminClearanceDealService(container.resolve(DI_TOKENS.ClearanceDealRepository)),
  );
}
