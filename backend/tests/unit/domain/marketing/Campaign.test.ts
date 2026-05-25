import { describe, it, expect, beforeEach } from 'vitest';
import { Campaign, DiscountType } from '../../../../src/domain/marketing/aggregates/Campaign.js';
import { Money } from '../../../../src/domain/order-management/value-objects/Money.js';
import { CampaignRedeemed } from '../../../../src/domain/marketing/events/CampaignRedeemed.js';

describe('Campaign Aggregate', () => {
  let campaign: Campaign;
  const campaignId = 'campaign-1';
  const customerId = 'customer-1';
  const orderId = 'order-1';

  describe('Campaign Creation', () => {
    it('should create a campaign with required parameters', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Summer Sale',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20
      });

      expect(campaign.id).toBe(campaignId);
      expect(campaign.name).toBe('Summer Sale');
      expect(campaign.discountType).toBe(DiscountType.PERCENTAGE);
      expect(campaign.discountValue).toBe(20);
      expect(campaign.status).toBe('ACTIVE');
      expect(campaign.currentUsageCount).toBe(0);
    });

    it('should create a campaign with optional parameters', () => {
      const startDate = new Date('2026-06-01');
      const endDate = new Date('2026-08-31');
      const minPurchase = Money.create(5000);
      const maxDiscount = Money.create(2000);

      campaign = Campaign.create({
        id: campaignId,
        name: 'Summer Sale',
        couponCode: 'SUMMER20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minPurchaseAmount: minPurchase,
        maxDiscountAmount: maxDiscount,
        startDate,
        endDate,
        usageLimit: 100,
        usagePerCustomer: 2
      });

      expect(campaign.couponCode).toBe('SUMMER20');
      expect(campaign.minPurchaseAmount).toEqual(minPurchase);
      expect(campaign.maxDiscountAmount).toEqual(maxDiscount);
      expect(campaign.startDate).toEqual(startDate);
      expect(campaign.endDate).toEqual(endDate);
      expect(campaign.usageLimit).toBe(100);
      expect(campaign.usagePerCustomer).toBe(2);
    });

    it('should initialize with zero usage count', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Test Campaign',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 1000
      });

      expect(campaign.currentUsageCount).toBe(0);
    });
  });

  describe('Eligibility Validation', () => {
    beforeEach(() => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Test Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10
      });
    });

    it('should be eligible when all conditions are met', () => {
      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId,
        customerUsageCount: 0
      });

      expect(isEligible).toBe(true);
    });

    it('should not be eligible when campaign is inactive', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Inactive Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10
      });
      // Manually set status to inactive (in real scenario, this would be done through a method)
      (campaign as any).props.status = 'INACTIVE';

      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId,
        customerUsageCount: 0
      });

      expect(isEligible).toBe(false);
    });

    describe('Date Range Validation', () => {
      it('should not be eligible if campaign has not started yet', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);

        campaign = Campaign.create({
          id: campaignId,
          name: 'Future Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          startDate: futureDate
        });

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(10000),
          customerId,
          customerUsageCount: 0
        });

        expect(isEligible).toBe(false);
      });

      it('should not be eligible if campaign has expired', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);

        campaign = Campaign.create({
          id: campaignId,
          name: 'Expired Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          endDate: pastDate
        });

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(10000),
          customerId,
          customerUsageCount: 0
        });

        expect(isEligible).toBe(false);
      });

      it('should be eligible within valid date range', () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 5);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 5);

        campaign = Campaign.create({
          id: campaignId,
          name: 'Active Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          startDate,
          endDate
        });

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(10000),
          customerId,
          customerUsageCount: 0
        });

        expect(isEligible).toBe(true);
      });
    });

    describe('Usage Limit Validation', () => {
      it('should not be eligible when global usage limit is reached', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Limited Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          usageLimit: 5
        });
        // Simulate reaching usage limit
        (campaign as any).props.currentUsageCount = 5;

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(10000),
          customerId,
          customerUsageCount: 0
        });

        expect(isEligible).toBe(false);
      });

      it('should be eligible when global usage limit not reached', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Limited Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          usageLimit: 100
        });
        (campaign as any).props.currentUsageCount = 50;

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(10000),
          customerId,
          customerUsageCount: 0
        });

        expect(isEligible).toBe(true);
      });

      it('should not be eligible when per-customer usage limit is reached', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Per-Customer Limited Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          usagePerCustomer: 2
        });

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(10000),
          customerId,
          customerUsageCount: 2
        });

        expect(isEligible).toBe(false);
      });

      it('should be eligible when per-customer usage limit not reached', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Per-Customer Limited Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          usagePerCustomer: 5
        });

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(10000),
          customerId,
          customerUsageCount: 2
        });

        expect(isEligible).toBe(true);
      });
    });

    describe('Minimum Purchase Validation', () => {
      it('should not be eligible when order subtotal is below minimum', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Minimum Purchase Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          minPurchaseAmount: Money.create(10000)
        });

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(5000),
          customerId,
          customerUsageCount: 0
        });

        expect(isEligible).toBe(false);
      });

      it('should be eligible when order subtotal meets minimum', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Minimum Purchase Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          minPurchaseAmount: Money.create(10000)
        });

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(10000),
          customerId,
          customerUsageCount: 0
        });

        expect(isEligible).toBe(true);
      });

      it('should be eligible when order subtotal exceeds minimum', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Minimum Purchase Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          minPurchaseAmount: Money.create(10000)
        });

        const isEligible = campaign.isEligible({
          orderSubtotal: Money.create(15000),
          customerId,
          customerUsageCount: 0
        });

        expect(isEligible).toBe(true);
      });
    });

    it('should validate all conditions together', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 5);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 5);

      campaign = Campaign.create({
        id: campaignId,
        name: 'Complex Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        startDate,
        endDate,
        usageLimit: 100,
        usagePerCustomer: 3,
        minPurchaseAmount: Money.create(5000)
      });
      (campaign as any).props.currentUsageCount = 50;

      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId,
        customerUsageCount: 1
      });

      expect(isEligible).toBe(true);
    });
  });

  describe('Discount Calculation', () => {
    const orderSubtotal = Money.create(10000);
    const shippingCost = Money.create(500);

    describe('Percentage Discount', () => {
      beforeEach(() => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Percentage Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 20
        });
      });

      it('should calculate percentage discount correctly', () => {
        const discount = campaign.calculateDiscount(orderSubtotal, shippingCost);

        expect(discount.amount).toBe(2000); // 20% of 10000
      });

      it('should apply maximum discount limit when specified', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Percentage Campaign with Max',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 50,
          maxDiscountAmount: Money.create(3000)
        });

        const discount = campaign.calculateDiscount(orderSubtotal, shippingCost);

        expect(discount.amount).toBe(3000); // Capped at max discount
      });

      it('should not exceed order total plus shipping', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Percentage Campaign',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 200 // 200% would be 20000
        });

        const discount = campaign.calculateDiscount(orderSubtotal, shippingCost);

        expect(discount.amount).toBe(10500); // Capped at order + shipping
      });
    });

    describe('Fixed Amount Discount', () => {
      beforeEach(() => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Fixed Amount Campaign',
          discountType: DiscountType.FIXED_AMOUNT,
          discountValue: 1500
        });
      });

      it('should apply fixed amount discount', () => {
        const discount = campaign.calculateDiscount(orderSubtotal, shippingCost);

        expect(discount.amount).toBe(1500);
      });

      it('should not exceed order total plus shipping', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Fixed Amount Campaign',
          discountType: DiscountType.FIXED_AMOUNT,
          discountValue: 50000 // Exceeds order + shipping
        });

        const discount = campaign.calculateDiscount(orderSubtotal, shippingCost);

        expect(discount.amount).toBe(10500); // Capped at order + shipping
      });
    });

    describe('Free Shipping Discount', () => {
      beforeEach(() => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Free Shipping Campaign',
          discountType: DiscountType.FREE_SHIPPING,
          discountValue: 0 // Value is ignored for free shipping
        });
      });

      it('should apply free shipping discount', () => {
        const discount = campaign.calculateDiscount(orderSubtotal, shippingCost);

        expect(discount.amount).toBe(500); // Shipping cost
      });

      it('should handle zero shipping cost', () => {
        const zeroShipping = Money.create(0);
        const discount = campaign.calculateDiscount(orderSubtotal, zeroShipping);

        expect(discount.amount).toBe(0);
      });
    });

    describe('Buy X Get Y Discount', () => {
      it('should handle BUY_X_GET_Y discount type', () => {
        campaign = Campaign.create({
          id: campaignId,
          name: 'Buy X Get Y Campaign',
          discountType: DiscountType.BUY_X_GET_Y,
          discountValue: 0 // Value depends on implementation
        });

        const discount = campaign.calculateDiscount(orderSubtotal, shippingCost);

        // Default behavior returns 0 for unimplemented types
        expect(discount.amount).toBe(0);
      });
    });

    it('should return Money object with correct currency', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Currency Test Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10
      });

      const discount = campaign.calculateDiscount(orderSubtotal, shippingCost);

      expect(discount.currency).toBe('KES');
    });
  });

  describe('Campaign Redemption', () => {
    beforeEach(() => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Redeemable Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10
      });
    });

    it('should increment usage count when redeemed', () => {
      const initialCount = campaign.currentUsageCount;

      campaign.redeem(customerId, orderId);

      expect(campaign.currentUsageCount).toBe(initialCount + 1);
    });

    it('should raise CampaignRedeemed event when redeemed', () => {
      campaign.redeem(customerId, orderId);

      const events = campaign.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(CampaignRedeemed);
    });

    it('should include correct data in CampaignRedeemed event', () => {
      campaign.redeem(customerId, orderId);

      const event = campaign.domainEvents[0] as CampaignRedeemed;
      expect(event.campaignId).toBe(campaignId);
      expect(event.customerId).toBe(customerId);
      expect(event.orderId).toBe(orderId);
    });

    it('should allow multiple redemptions', () => {
      campaign.redeem(customerId, 'order-1');
      campaign.redeem(customerId, 'order-2');
      campaign.redeem('customer-2', 'order-3');

      expect(campaign.currentUsageCount).toBe(3);
      expect(campaign.domainEvents).toHaveLength(3);
    });

    it('should track usage count across multiple redemptions', () => {
      for (let i = 0; i < 5; i++) {
        campaign.redeem(customerId, `order-${i}`);
      }

      expect(campaign.currentUsageCount).toBe(5);
    });
  });

  describe('Campaign Properties', () => {
    it('should provide access to campaign properties', () => {
      const startDate = new Date('2026-06-01');
      const endDate = new Date('2026-08-31');
      const minPurchase = Money.create(5000);
      const maxDiscount = Money.create(2000);

      campaign = Campaign.create({
        id: campaignId,
        name: 'Full Campaign',
        couponCode: 'FULL20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minPurchaseAmount: minPurchase,
        maxDiscountAmount: maxDiscount,
        startDate,
        endDate,
        usageLimit: 100,
        usagePerCustomer: 2
      });

      expect(campaign.id).toBe(campaignId);
      expect(campaign.name).toBe('Full Campaign');
      expect(campaign.couponCode).toBe('FULL20');
      expect(campaign.discountType).toBe(DiscountType.PERCENTAGE);
      expect(campaign.discountValue).toBe(20);
      expect(campaign.minPurchaseAmount).toEqual(minPurchase);
      expect(campaign.maxDiscountAmount).toEqual(maxDiscount);
      expect(campaign.startDate).toEqual(startDate);
      expect(campaign.endDate).toEqual(endDate);
      expect(campaign.usageLimit).toBe(100);
      expect(campaign.usagePerCustomer).toBe(2);
      expect(campaign.status).toBe('ACTIVE');
    });
  });

  describe('Edge Cases', () => {
    it('should handle campaign with zero discount value', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Zero Discount Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 0
      });

      const discount = campaign.calculateDiscount(Money.create(10000), Money.create(500));

      expect(discount.amount).toBe(0);
    });

    it('should handle campaign with very large discount value', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Large Discount Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 99
      });

      const discount = campaign.calculateDiscount(Money.create(10000), Money.create(500));

      expect(discount.amount).toBe(9900);
    });

    it('should handle campaign with no coupon code', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'No Code Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10
      });

      expect(campaign.couponCode).toBeUndefined();
    });

    it('should handle campaign with no date restrictions', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'No Date Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10
      });

      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId,
        customerUsageCount: 0
      });

      expect(isEligible).toBe(true);
    });

    it('should handle campaign with no usage limits', () => {
      campaign = Campaign.create({
        id: campaignId,
        name: 'Unlimited Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10
      });

      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId,
        customerUsageCount: 1000
      });

      expect(isEligible).toBe(true);
    });
  });
});
