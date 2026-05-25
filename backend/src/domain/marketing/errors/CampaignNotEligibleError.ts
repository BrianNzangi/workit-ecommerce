/**
 * CampaignNotEligibleError
 *
 * Raised when a campaign cannot be applied to an order due to eligibility constraints.
 * This includes violations of date ranges, usage limits, or minimum purchase amounts.
 */
export class CampaignNotEligibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CampaignNotEligibleError';
    Error.captureStackTrace(this, this.constructor);
  }
}
