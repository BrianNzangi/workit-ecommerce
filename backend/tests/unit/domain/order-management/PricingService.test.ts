import { describe, it, expect } from 'vitest';
import { PricingService, CampaignDiscount } from '../../../../src/domain/order-management/services/PricingService.js';
import { OrderLine } from '../../../../src/domain/order-management/entities/OrderLine.js';
import { Money } from '../../../../src/domain/order-management/value-objects/Money.js';
import { Campaign, DiscountType } from '../../../../src/domain/marketing/aggregates/Campaign.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeLine(id: string, unitPrice: number, quantity: number): OrderLine {
  return OrderLine.create({
    id,
    orderId: 'order-1',
    productId: `product-${id}`,
    productName: `Product ${id}`,
    quantity,
    unitPrice: Money.create(unitPrice, 'KES'),
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PricingService', () => {
  const service = new PricingService();

  // ─── calculateSubtotal ─────────────────────────────────────────────────────

  describe('calculateSubtotal', () => {
    it('should return zero for an empty list', () => {
      const result = service.calculateSubtotal([]);
      expect(result.amount).toBe(0);
    });

    it('should calculate subtotal for a single line', () => {
      const lines = [makeLine('1', 500, 2)]; // 500 × 2 = 1000
      const result = service.calculateSubtotal(lines);
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe('KES');
    });

    it('should sum multiple lines', () => {
      const lines = [
        makeLine('1', 500, 2),  // 1000
        makeLine('2', 300, 3),  // 900
        makeLine('3', 100, 1),  // 100
      ];
      const result = service.calculateSubtotal(lines);
      expect(result.amount).toBe(2000);
    });

    it('should use the currency from the first line', () => {
      const lines = [makeLine('1', 500, 1)];
      const result = service.calculateSubtotal(lines);
      expect(result.currency).toBe('KES');
    });

    it('should use the provided default currency for empty list', () => {
      const result = service.calculateSubtotal([], 'USD');
      expect(result.currency).toBe('USD');
    });
  });

  // ─── applyDiscount ─────────────────────────────────────────────────────────

  describe('applyDiscount', () => {
    const subtotal = Money.create(2000, 'KES');
    const shipping = Money.create(200, 'KES');

    it('should return zero discount when no campaign is provided', () => {
      const result = service.applyDiscount({ subtotal, shipping });
      expect(result.amount).toBe(0);
    });

    it('should return zero discount for NONE discount type', () => {
      const campaign: CampaignDiscount = { discountType: 'NONE', discountValue: 0 };
      const result = service.applyDiscount({ subtotal, shipping, campaign });
      expect(result.amount).toBe(0);
    });

    describe('PERCENTAGE discount', () => {
      it('should apply a percentage discount to the subtotal', () => {
        const campaign: CampaignDiscount = { discountType: 'PERCENTAGE', discountValue: 10 };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(200); // 10% of 2000
      });

      it('should cap discount at maxDiscountAmount', () => {
        const campaign: CampaignDiscount = {
          discountType: 'PERCENTAGE',
          discountValue: 50,
          maxDiscountAmount: 300,
        };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(300); // 50% of 2000 = 1000, capped at 300
      });

      it('should not cap when maxDiscountAmount is 0 (disabled)', () => {
        const campaign: CampaignDiscount = {
          discountType: 'PERCENTAGE',
          discountValue: 10,
          maxDiscountAmount: 0,
        };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(200); // no cap applied
      });

      it('should return zero when subtotal is below minPurchaseAmount', () => {
        const campaign: CampaignDiscount = {
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minPurchaseAmount: 5000,
        };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(0);
      });

      it('should apply discount when subtotal meets minPurchaseAmount exactly', () => {
        const campaign: CampaignDiscount = {
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minPurchaseAmount: 2000,
        };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(200);
      });
    });

    describe('FIXED_AMOUNT discount', () => {
      it('should apply a fixed amount discount', () => {
        const campaign: CampaignDiscount = { discountType: 'FIXED_AMOUNT', discountValue: 500 };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(500);
      });

      it('should cap fixed discount at subtotal + shipping', () => {
        const campaign: CampaignDiscount = {
          discountType: 'FIXED_AMOUNT',
          discountValue: 99999,
        };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(2200); // subtotal(2000) + shipping(200)
      });
    });

    describe('FREE_SHIPPING discount', () => {
      it('should discount the full shipping cost', () => {
        const campaign: CampaignDiscount = { discountType: 'FREE_SHIPPING', discountValue: 0 };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(200); // equals shipping cost
      });

      it('should return zero when shipping is zero', () => {
        const campaign: CampaignDiscount = { discountType: 'FREE_SHIPPING', discountValue: 0 };
        const result = service.applyDiscount({
          subtotal,
          shipping: Money.create(0, 'KES'),
          campaign,
        });
        expect(result.amount).toBe(0);
      });
    });

    describe('BUY_X_GET_Y discount', () => {
      it('should return zero (handled at application layer)', () => {
        const campaign: CampaignDiscount = { discountType: 'BUY_X_GET_Y', discountValue: 1 };
        const result = service.applyDiscount({ subtotal, shipping, campaign });
        expect(result.amount).toBe(0);
      });
    });
  });

  // ─── calculateTotal ────────────────────────────────────────────────────────

  describe('calculateTotal', () => {
    it('should calculate total as subtotal + shipping + tax - discount', () => {
      const result = service.calculateTotal({
        subtotal: Money.create(2000, 'KES'),
        shipping: Money.create(200, 'KES'),
        tax: Money.create(100, 'KES'),
        discount: Money.create(300, 'KES'),
      });
      expect(result.amount).toBe(2000); // 2000 + 200 + 100 - 300
    });

    it('should return zero when discount exceeds subtotal + shipping + tax', () => {
      const result = service.calculateTotal({
        subtotal: Money.create(100, 'KES'),
        shipping: Money.create(50, 'KES'),
        tax: Money.create(0, 'KES'),
        discount: Money.create(9999, 'KES'),
      });
      expect(result.amount).toBe(0);
    });

    it('should calculate total with no discount', () => {
      const result = service.calculateTotal({
        subtotal: Money.create(1500, 'KES'),
        shipping: Money.create(200, 'KES'),
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
      });
      expect(result.amount).toBe(1700);
    });

    it('should calculate total with no tax and no discount', () => {
      const result = service.calculateTotal({
        subtotal: Money.create(1000, 'KES'),
        shipping: Money.create(0, 'KES'),
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
      });
      expect(result.amount).toBe(1000);
    });

    it('should preserve the currency from subtotal', () => {
      const result = service.calculateTotal({
        subtotal: Money.create(1000, 'USD'),
        shipping: Money.create(100, 'USD'),
        tax: Money.create(0, 'USD'),
        discount: Money.create(0, 'USD'),
      });
      expect(result.currency).toBe('USD');
    });
  });

  // ─── End-to-end pricing scenario ──────────────────────────────────────────

  describe('full pricing scenario', () => {
    it('should compute correct totals for a typical order with a percentage discount', () => {
      const lines = [
        makeLine('1', 1000, 2), // 2000
        makeLine('2', 500, 1),  // 500
      ];
      const subtotal = service.calculateSubtotal(lines);
      expect(subtotal.amount).toBe(2500);

      const shipping = Money.create(200, 'KES');
      const campaign: CampaignDiscount = {
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 200,
      };
      const discount = service.applyDiscount({ subtotal, shipping, campaign });
      expect(discount.amount).toBe(200); // 10% of 2500 = 250, capped at 200

      const total = service.calculateTotal({
        subtotal,
        shipping,
        tax: Money.create(0, 'KES'),
        discount,
      });
      expect(total.amount).toBe(2500); // 2500 + 200 + 0 - 200
    });
  });

  // ─── applyDDDCampaignDiscount ─────────────────────────────────────────────

  describe('applyDDDCampaignDiscount', () => {
    const subtotal = Money.create(2000, 'KES');
    const shipping = Money.create(200, 'KES');

    it('should return zero discount when no campaign is provided', () => {
      const result = service.applyDDDCampaignDiscount({ subtotal, shipping });
      expect(result.amount).toBe(0);
    });

    it('should apply percentage discount from Campaign aggregate', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      });

      const result = service.applyDDDCampaignDiscount({ subtotal, shipping, campaign });
      expect(result.amount).toBe(200); // 10% of 2000
    });

    it('should apply fixed amount discount from Campaign aggregate', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 500,
      });

      const result = service.applyDDDCampaignDiscount({ subtotal, shipping, campaign });
      expect(result.amount).toBe(500);
    });

    it('should apply free shipping discount from Campaign aggregate', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.FREE_SHIPPING,
        discountValue: 0,
      });

      const result = service.applyDDDCampaignDiscount({ subtotal, shipping, campaign });
      expect(result.amount).toBe(200); // equals shipping cost
    });

    it('should respect max discount amount from Campaign aggregate', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 50,
        maxDiscountAmount: Money.create(300, 'KES'),
      });

      const result = service.applyDDDCampaignDiscount({ subtotal, shipping, campaign });
      expect(result.amount).toBe(300); // 50% of 2000 = 1000, capped at 300
    });

    it('should cap discount at subtotal + shipping', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 99999,
      });

      const result = service.applyDDDCampaignDiscount({ subtotal, shipping, campaign });
      expect(result.amount).toBe(2200); // subtotal(2000) + shipping(200)
    });
  });
});
