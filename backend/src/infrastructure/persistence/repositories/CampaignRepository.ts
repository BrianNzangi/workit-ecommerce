import { ICampaignRepository } from '../../../domain/marketing/repositories/ICampaignRepository.js';
import { Campaign } from '../../../domain/marketing/aggregates/Campaign.js';
import { CampaignMapper } from '../mappers/CampaignMapper.js';
import { db, schema } from '@workit/db';
import { eq, and, count } from 'drizzle-orm';

/**
 * CampaignRepository
 *
 * Implements persistence for Campaign aggregates.
 * Handles CRUD operations and customer usage tracking.
 */
export class CampaignRepository implements ICampaignRepository {
  constructor(private readonly mapper: CampaignMapper) {}

  /**
   * Find a campaign by ID
   *
   * @param id Campaign ID
   * @returns Campaign aggregate or null if not found
   */
  async findById(id: string): Promise<Campaign | null> {
    const campaignData = await db.query.campaigns.findFirst({
      where: eq(schema.campaigns.id, id)
    });

    if (!campaignData) {
      return null;
    }

    return this.mapper.toDomain(campaignData);
  }

  /**
   * Find a campaign by coupon code
   *
   * @param couponCode Coupon code to search for
   * @returns Campaign aggregate or null if not found
   */
  async findByCouponCode(couponCode: string): Promise<Campaign | null> {
    const campaignData = await db.query.campaigns.findFirst({
      where: eq(schema.campaigns.couponCode, couponCode)
    });

    if (!campaignData) {
      return null;
    }

    return this.mapper.toDomain(campaignData);
  }

  /**
   * Save a campaign aggregate
   *
   * Uses upsert semantics to handle both create and update scenarios.
   * Updates the usage count when campaign is redeemed.
   *
   * @param campaign Campaign aggregate to save
   */
  async save(campaign: Campaign): Promise<void> {
    const persistence = this.mapper.toPersistence(campaign);

    await db
      .insert(schema.campaigns)
      .values(persistence)
      .onConflictDoUpdate({
        target: schema.campaigns.id,
        set: {
          currentUsageCount: persistence.currentUsageCount,
          status: persistence.status,
          updatedAt: new Date()
        }
      });
  }

  /**
   * Get the number of times a customer has redeemed a campaign
   *
   * Counts redemptions in the campaign_redemptions table.
   *
   * @param campaignId Campaign ID
   * @param customerId Customer ID
   * @returns Number of times the customer has redeemed this campaign
   */
  async getCustomerUsageCount(campaignId: string, customerId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(schema.campaignRedemptions)
      .where(
        and(
          eq(schema.campaignRedemptions.campaignId, campaignId),
          eq(schema.campaignRedemptions.customerId, customerId)
        )
      );

    return Number(result[0]?.count || 0);
  }
}
