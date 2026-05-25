import { Campaign } from '../../../domain/marketing/aggregates/Campaign.js';
import { ICampaignRepository } from '../../../domain/marketing/repositories/ICampaignRepository.js';
import { CampaignRepository } from './CampaignRepository.js';

/**
 * Cached wrapper around CampaignRepository.
 *
 * Implements in-memory caching for frequently accessed campaigns with TTL-based invalidation.
 * Campaigns are read-heavy and change infrequently, making them ideal for caching.
 *
 * Requirements: 25.3
 */
export class CachedCampaignRepository implements ICampaignRepository {
  private readonly repository: CampaignRepository;
  private readonly cache = new Map<string, { campaign: Campaign | null; expiresAt: number }>();
  private readonly ttlMs: number;

  constructor(repository: CampaignRepository, ttlMs: number = 10 * 60 * 1000) {
    this.repository = repository;
    this.ttlMs = ttlMs;
  }

  async findById(id: string): Promise<Campaign | null> {
    const cached = this.cache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.campaign;
    }

    const campaign = await this.repository.findById(id);
    this.cache.set(id, {
      campaign,
      expiresAt: Date.now() + this.ttlMs,
    });

    return campaign;
  }

  async findByCouponCode(couponCode: string): Promise<Campaign | null> {
    const cacheKey = `coupon:${couponCode}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.campaign;
    }

    const campaign = await this.repository.findByCouponCode(couponCode);
    this.cache.set(cacheKey, {
      campaign,
      expiresAt: Date.now() + this.ttlMs,
    });

    return campaign;
  }

  async save(campaign: Campaign): Promise<void> {
    // Invalidate cache for this campaign
    this.cache.delete(campaign.id);
    this.cache.delete(`coupon:${campaign.couponCode}`);

    await this.repository.save(campaign);
  }

  async getCustomerUsageCount(customerId: string, campaignId: string): Promise<number> {
    // Usage counts are not cached as they change frequently
    return this.repository.getCustomerUsageCount(customerId, campaignId);
  }

  /**
   * Invalidate cache for a campaign.
   * Called when campaign is updated or redeemed.
   */
  invalidateCampaign(campaignId: string): void {
    this.cache.delete(campaignId);
  }

  /**
   * Clear all cache entries.
   */
  clearCache(): void {
    this.cache.clear();
  }
}
