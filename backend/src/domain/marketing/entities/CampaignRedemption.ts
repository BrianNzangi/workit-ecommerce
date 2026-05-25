import { Entity } from '../../shared/Entity.js';

/**
 * CampaignRedemption Entity
 *
 * Tracks individual campaign redemptions by customers.
 * Used to enforce per-customer usage limits and maintain audit trail.
 *
 * Business Rules:
 * - Each redemption is uniquely identified by ID
 * - Tracks which customer redeemed which campaign for which order
 * - Immutable after creation (represents a historical fact)
 */
export class CampaignRedemption extends Entity<string> {
  private readonly _campaignId: string;
  private readonly _customerId: string;
  private readonly _orderId: string;
  private readonly _redeemedAt: Date;

  private constructor(
    id: string,
    campaignId: string,
    customerId: string,
    orderId: string,
    redeemedAt: Date
  ) {
    super(id);
    this._campaignId = campaignId;
    this._customerId = customerId;
    this._orderId = orderId;
    this._redeemedAt = redeemedAt;
  }

  /**
   * Create a new campaign redemption record
   *
   * @param params Redemption creation parameters
   * @returns New CampaignRedemption entity
   */
  static create(params: {
    id: string;
    campaignId: string;
    customerId: string;
    orderId: string;
  }): CampaignRedemption {
    return new CampaignRedemption(
      params.id,
      params.campaignId,
      params.customerId,
      params.orderId,
      new Date()
    );
  }

  /**
   * Reconstitute a campaign redemption from persistence
   *
   * @param id Redemption ID
   * @param campaignId Campaign ID
   * @param customerId Customer ID
   * @param orderId Order ID
   * @param redeemedAt Timestamp of redemption
   * @returns CampaignRedemption entity
   */
  static reconstitute(
    id: string,
    campaignId: string,
    customerId: string,
    orderId: string,
    redeemedAt: Date
  ): CampaignRedemption {
    return new CampaignRedemption(id, campaignId, customerId, orderId, redeemedAt);
  }

  // Getters for redemption properties
  get campaignId(): string {
    return this._campaignId;
  }

  get customerId(): string {
    return this._customerId;
  }

  get orderId(): string {
    return this._orderId;
  }

  get redeemedAt(): Date {
    return this._redeemedAt;
  }
}
