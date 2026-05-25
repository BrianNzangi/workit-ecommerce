import { DomainEvent } from '../../shared/DomainEvent.js';

/**
 * CampaignRedeemed Domain Event
 *
 * Raised when a campaign is successfully redeemed during order placement.
 * Used to track campaign usage and trigger downstream processes.
 */
export class CampaignRedeemed extends DomainEvent {
  constructor(
    public readonly campaignId: string,
    public readonly customerId: string,
    public readonly orderId: string
  ) {
    super('CampaignRedeemed');
  }
}
