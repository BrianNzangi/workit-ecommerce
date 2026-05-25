import { Campaign, DiscountType } from '../../../domain/marketing/aggregates/Campaign.js';
import { Money } from '../../../domain/order-management/value-objects/Money.js';

/**
 * CampaignMapper
 *
 * Maps between Campaign domain aggregate and database persistence format.
 * Handles conversion of value objects and nested entities.
 */
export class CampaignMapper {
  /**
   * Map database record to Campaign domain aggregate
   *
   * @param raw Database record
   * @returns Campaign aggregate
   */
  toDomain(raw: any): Campaign {
    const minPurchaseAmount = raw.minPurchaseAmount
      ? Money.create(raw.minPurchaseAmount, raw.currencyCode || 'KES')
      : undefined;

    const maxDiscountAmount = raw.maxDiscountAmount
      ? Money.create(raw.maxDiscountAmount, raw.currencyCode || 'KES')
      : undefined;

    return Campaign.reconstitute(raw.id, {
      name: raw.name,
      couponCode: raw.couponCode,
      discountType: raw.discountType as DiscountType,
      discountValue: raw.discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate: raw.startDate ? new Date(raw.startDate) : undefined,
      endDate: raw.endDate ? new Date(raw.endDate) : undefined,
      usageLimit: raw.usageLimit,
      usagePerCustomer: raw.usagePerCustomer,
      currentUsageCount: raw.currentUsageCount || 0,
      status: raw.status as 'ACTIVE' | 'INACTIVE'
    });
  }

  /**
   * Map Campaign domain aggregate to database persistence format
   *
   * @param campaign Campaign aggregate
   * @returns Database record
   */
  toPersistence(campaign: Campaign): any {
    return {
      id: campaign.id,
      name: campaign.name,
      couponCode: campaign.couponCode,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      minPurchaseAmount: campaign.minPurchaseAmount?.amount,
      maxDiscountAmount: campaign.maxDiscountAmount?.amount,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      usageLimit: campaign.usageLimit,
      usagePerCustomer: campaign.usagePerCustomer,
      currentUsageCount: campaign.currentUsageCount,
      status: campaign.status,
      currencyCode: campaign.minPurchaseAmount?.currency || 'KES'
    };
  }
}
