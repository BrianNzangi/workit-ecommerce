/**
 * CampaignExpiredError
 *
 * Raised when a campaign has expired (end date has passed).
 * This is a specific case of CampaignNotEligibleError for expired campaigns.
 */
export class CampaignExpiredError extends Error {
  constructor(campaignId: string) {
    super(`Campaign has expired: ${campaignId}`);
    this.name = 'CampaignExpiredError';
    Error.captureStackTrace(this, this.constructor);
  }
}
