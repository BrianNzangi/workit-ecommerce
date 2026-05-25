import { Campaign } from '../aggregates/Campaign.js';

/**
 * ICampaignRepository Interface
 *
 * Defines the contract for persisting and retrieving Campaign aggregates.
 * Implementations must handle mapping between domain models and database records.
 *
 * Business Rules:
 * - Campaigns are retrieved by ID or coupon code
 * - Customer usage count is tracked separately for per-customer limits
 * - Campaigns are saved atomically with all their data
 */
export interface ICampaignRepository {
  /**
   * Find a campaign by its ID
   *
   * @param id Campaign ID
   * @returns Campaign aggregate or null if not found
   */
  findById(id: string): Promise<Campaign | null>;

  /**
   * Find a campaign by its coupon code
   *
   * @param couponCode Coupon code to search for
   * @returns Campaign aggregate or null if not found
   */
  findByCouponCode(couponCode: string): Promise<Campaign | null>;

  /**
   * Save a campaign aggregate
   *
   * Persists the campaign and all its data (including redemption count).
   * Should use upsert semantics to handle both create and update scenarios.
   *
   * @param campaign Campaign aggregate to save
   */
  save(campaign: Campaign): Promise<void>;

  /**
   * Get the number of times a customer has redeemed a campaign
   *
   * Used to enforce per-customer usage limits.
   *
   * @param campaignId Campaign ID
   * @param customerId Customer ID
   * @returns Number of times the customer has redeemed this campaign
   */
  getCustomerUsageCount(campaignId: string, customerId: string): Promise<number>;
}
