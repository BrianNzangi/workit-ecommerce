import { Container, DI_TOKENS } from './container.js';
import { CampaignRepository } from '../persistence/repositories/CampaignRepository.js';
import { CampaignMapper } from '../persistence/mappers/CampaignMapper.js';

/**
 * Register Marketing context services in the DI container.
 *
 * @param container The DI container instance
 */
export function registerMarketing(container: Container): void {
  // ─── Mappers ────────────────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.CampaignMapper, () => new CampaignMapper());

  // ─── Repositories ────────────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.CampaignRepository, () =>
    new CampaignRepository(container.resolve(DI_TOKENS.CampaignMapper))
  );
}
