import { CampaignRedeemed } from '../../../domain/marketing/events/CampaignRedeemed.js';
import { CachedCampaignRepository } from '../../../infrastructure/persistence/repositories/CachedCampaignRepository.js';

/**
 * Event handler for CampaignRedeemed events.
 *
 * Invalidates the campaign cache when a campaign is redeemed to ensure
 * usage counts and eligibility checks reflect the latest state.
 *
 * Requirements: 25.3
 */
export class CampaignRedeemedHandler {
  constructor(private readonly cachedCampaignRepository: CachedCampaignRepository) {}

  async handle(event: CampaignRedeemed): Promise<void> {
    this.cachedCampaignRepository.invalidateCampaign(event.campaignId);
  }
}
