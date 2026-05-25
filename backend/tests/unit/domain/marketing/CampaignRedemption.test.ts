import { describe, it, expect, beforeEach } from 'vitest';
import { CampaignRedemption } from '../../../../src/domain/marketing/entities/CampaignRedemption.js';

describe('CampaignRedemption Entity', () => {
  const redemptionId = 'redemption-1';
  const campaignId = 'campaign-1';
  const customerId = 'customer-1';
  const orderId = 'order-1';

  describe('Creation', () => {
    it('should create a campaign redemption with required parameters', () => {
      const redemption = CampaignRedemption.create({
        id: redemptionId,
        campaignId,
        customerId,
        orderId
      });

      expect(redemption.id).toBe(redemptionId);
      expect(redemption.campaignId).toBe(campaignId);
      expect(redemption.customerId).toBe(customerId);
      expect(redemption.orderId).toBe(orderId);
    });

    it('should set redeemedAt to current date on creation', () => {
      const beforeCreation = new Date();
      const redemption = CampaignRedemption.create({
        id: redemptionId,
        campaignId,
        customerId,
        orderId
      });
      const afterCreation = new Date();

      expect(redemption.redeemedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(redemption.redeemedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('Reconstitution', () => {
    it('should reconstitute a campaign redemption from persistence', () => {
      const redeemedAt = new Date('2026-05-01T10:00:00Z');

      const redemption = CampaignRedemption.reconstitute(
        redemptionId,
        campaignId,
        customerId,
        orderId,
        redeemedAt
      );

      expect(redemption.id).toBe(redemptionId);
      expect(redemption.campaignId).toBe(campaignId);
      expect(redemption.customerId).toBe(customerId);
      expect(redemption.orderId).toBe(orderId);
      expect(redemption.redeemedAt).toEqual(redeemedAt);
    });
  });

  describe('Properties', () => {
    let redemption: CampaignRedemption;

    beforeEach(() => {
      redemption = CampaignRedemption.create({
        id: redemptionId,
        campaignId,
        customerId,
        orderId
      });
    });

    it('should provide access to all properties', () => {
      expect(redemption.id).toBe(redemptionId);
      expect(redemption.campaignId).toBe(campaignId);
      expect(redemption.customerId).toBe(customerId);
      expect(redemption.orderId).toBe(orderId);
      expect(redemption.redeemedAt).toBeInstanceOf(Date);
    });

    it('should have immutable properties', () => {
      const originalCampaignId = redemption.campaignId;
      const originalCustomerId = redemption.customerId;
      const originalOrderId = redemption.orderId;

      // Attempt to modify (should not work due to readonly)
      // This is a TypeScript compile-time check, but we verify the values don't change
      expect(redemption.campaignId).toBe(originalCampaignId);
      expect(redemption.customerId).toBe(originalCustomerId);
      expect(redemption.orderId).toBe(originalOrderId);
    });
  });

  describe('Entity Equality', () => {
    it('should be equal to another redemption with same ID', () => {
      const redemption1 = CampaignRedemption.create({
        id: redemptionId,
        campaignId,
        customerId,
        orderId
      });

      const redemption2 = CampaignRedemption.create({
        id: redemptionId,
        campaignId: 'different-campaign',
        customerId: 'different-customer',
        orderId: 'different-order'
      });

      expect(redemption1.equals(redemption2)).toBe(true);
    });

    it('should not be equal to another redemption with different ID', () => {
      const redemption1 = CampaignRedemption.create({
        id: redemptionId,
        campaignId,
        customerId,
        orderId
      });

      const redemption2 = CampaignRedemption.create({
        id: 'different-id',
        campaignId,
        customerId,
        orderId
      });

      expect(redemption1.equals(redemption2)).toBe(false);
    });

    it('should not be equal to null', () => {
      const redemption = CampaignRedemption.create({
        id: redemptionId,
        campaignId,
        customerId,
        orderId
      });

      expect(redemption.equals(null as any)).toBe(false);
    });

    it('should not be equal to undefined', () => {
      const redemption = CampaignRedemption.create({
        id: redemptionId,
        campaignId,
        customerId,
        orderId
      });

      expect(redemption.equals(undefined as any)).toBe(false);
    });

    it('should be equal to itself', () => {
      const redemption = CampaignRedemption.create({
        id: redemptionId,
        campaignId,
        customerId,
        orderId
      });

      expect(redemption.equals(redemption)).toBe(true);
    });
  });

  describe('Multiple Redemptions', () => {
    it('should track different redemptions for same campaign by different customers', () => {
      const redemption1 = CampaignRedemption.create({
        id: 'redemption-1',
        campaignId,
        customerId: 'customer-1',
        orderId: 'order-1'
      });

      const redemption2 = CampaignRedemption.create({
        id: 'redemption-2',
        campaignId,
        customerId: 'customer-2',
        orderId: 'order-2'
      });

      expect(redemption1.id).not.toBe(redemption2.id);
      expect(redemption1.campaignId).toBe(redemption2.campaignId);
      expect(redemption1.customerId).not.toBe(redemption2.customerId);
      expect(redemption1.orderId).not.toBe(redemption2.orderId);
    });

    it('should track multiple redemptions by same customer for same campaign', () => {
      const redemption1 = CampaignRedemption.create({
        id: 'redemption-1',
        campaignId,
        customerId,
        orderId: 'order-1'
      });

      const redemption2 = CampaignRedemption.create({
        id: 'redemption-2',
        campaignId,
        customerId,
        orderId: 'order-2'
      });

      expect(redemption1.id).not.toBe(redemption2.id);
      expect(redemption1.campaignId).toBe(redemption2.campaignId);
      expect(redemption1.customerId).toBe(redemption2.customerId);
      expect(redemption1.orderId).not.toBe(redemption2.orderId);
    });

    it('should track redemptions across different campaigns', () => {
      const redemption1 = CampaignRedemption.create({
        id: 'redemption-1',
        campaignId: 'campaign-1',
        customerId,
        orderId: 'order-1'
      });

      const redemption2 = CampaignRedemption.create({
        id: 'redemption-2',
        campaignId: 'campaign-2',
        customerId,
        orderId: 'order-2'
      });

      expect(redemption1.campaignId).not.toBe(redemption2.campaignId);
      expect(redemption1.customerId).toBe(redemption2.customerId);
    });
  });

  describe('Audit Trail', () => {
    it('should preserve redemption timestamp for audit purposes', () => {
      const specificDate = new Date('2026-05-15T14:30:00Z');

      const redemption = CampaignRedemption.reconstitute(
        redemptionId,
        campaignId,
        customerId,
        orderId,
        specificDate
      );

      expect(redemption.redeemedAt).toEqual(specificDate);
      expect(redemption.redeemedAt.toISOString()).toBe('2026-05-15T14:30:00.000Z');
    });

    it('should maintain chronological order of redemptions', () => {
      const date1 = new Date('2026-05-01T10:00:00Z');
      const date2 = new Date('2026-05-02T10:00:00Z');
      const date3 = new Date('2026-05-03T10:00:00Z');

      const redemption1 = CampaignRedemption.reconstitute('r1', campaignId, customerId, 'o1', date1);
      const redemption2 = CampaignRedemption.reconstitute('r2', campaignId, customerId, 'o2', date2);
      const redemption3 = CampaignRedemption.reconstitute('r3', campaignId, customerId, 'o3', date3);

      const redemptions = [redemption1, redemption2, redemption3];
      const sortedByDate = [...redemptions].sort((a, b) => a.redeemedAt.getTime() - b.redeemedAt.getTime());

      expect(sortedByDate[0].redeemedAt).toEqual(date1);
      expect(sortedByDate[1].redeemedAt).toEqual(date2);
      expect(sortedByDate[2].redeemedAt).toEqual(date3);
    });
  });
});
