import { describe, it, expect, beforeEach } from 'vitest';
import { CampaignMapper } from '../../../src/infrastructure/persistence/mappers/CampaignMapper.js';
import { Campaign, DiscountType } from '../../../src/domain/marketing/aggregates/Campaign.js';
import { Money } from '../../../src/domain/order-management/value-objects/Money.js';

describe('CampaignMapper', () => {
  let mapper: CampaignMapper;

  beforeEach(() => {
    mapper = new CampaignMapper();
  });

  describe('toDomain', () => {
    it('should map basic campaign data from database to domain', () => {
      const raw = {
        id: 'campaign-1',
        name: 'Summer Sale',
        couponCode: 'SUMMER20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minPurchaseAmount: null,
        maxDiscountAmount: null,
        startDate: null,
        endDate: null,
        usageLimit: null,
        usagePerCustomer: null,
        currentUsageCount: 0,
        status: 'ACTIVE',
        currencyCode: 'KES'
      };

      const campaign = mapper.toDomain(raw);

      expect(campaign.id).toBe('campaign-1');
      expect(campaign.name).toBe('Summer Sale');
      expect(campaign.couponCode).toBe('SUMMER20');
      expect(campaign.discountType).toBe(DiscountType.PERCENTAGE);
      expect(campaign.discountValue).toBe(20);
      expect(campaign.currentUsageCount).toBe(0);
      expect(campaign.status).toBe('ACTIVE');
    });

    it('should map campaign with all optional fields', () => {
      const startDate = new Date('2026-06-01');
      const endDate = new Date('2026-08-31');

      const raw = {
        id: 'campaign-1',
        name: 'Full Campaign',
        couponCode: 'FULL20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minPurchaseAmount: 5000,
        maxDiscountAmount: 2000,
        startDate,
        endDate,
        usageLimit: 100,
        usagePerCustomer: 2,
        currentUsageCount: 25,
        status: 'ACTIVE',
        currencyCode: 'KES'
      };

      const campaign = mapper.toDomain(raw);

      expect(campaign.minPurchaseAmount?.amount).toBe(5000);
      expect(campaign.maxDiscountAmount?.amount).toBe(2000);
      expect(campaign.startDate).toEqual(startDate);
      expect(campaign.endDate).toEqual(endDate);
      expect(campaign.usageLimit).toBe(100);
      expect(campaign.usagePerCustomer).toBe(2);
      expect(campaign.currentUsageCount).toBe(25);
    });

    it('should convert Money amounts to Money value objects', () => {
      const raw = {
        id: 'campaign-1',
        name: 'Money Campaign',
        couponCode: null,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 1000,
        minPurchaseAmount: 5000,
        maxDiscountAmount: 2000,
        startDate: null,
        endDate: null,
        usageLimit: null,
        usagePerCustomer: null,
        currentUsageCount: 0,
        status: 'ACTIVE',
        currencyCode: 'KES'
      };

      const campaign = mapper.toDomain(raw);

      expect(campaign.minPurchaseAmount).toBeDefined();
      expect(campaign.minPurchaseAmount?.amount).toBe(5000);
      expect(campaign.minPurchaseAmount?.currency).toBe('KES');
      expect(campaign.maxDiscountAmount).toBeDefined();
      expect(campaign.maxDiscountAmount?.amount).toBe(2000);
      expect(campaign.maxDiscountAmount?.currency).toBe('KES');
    });

    it('should handle different discount types', () => {
      const discountTypes = [
        DiscountType.PERCENTAGE,
        DiscountType.FIXED_AMOUNT,
        DiscountType.FREE_SHIPPING,
        DiscountType.BUY_X_GET_Y
      ];

      discountTypes.forEach(discountType => {
        const raw = {
          id: 'campaign-1',
          name: 'Test Campaign',
          couponCode: null,
          discountType,
          discountValue: 10,
          minPurchaseAmount: null,
          maxDiscountAmount: null,
          startDate: null,
          endDate: null,
          usageLimit: null,
          usagePerCustomer: null,
          currentUsageCount: 0,
          status: 'ACTIVE',
          currencyCode: 'KES'
        };

        const campaign = mapper.toDomain(raw);

        expect(campaign.discountType).toBe(discountType);
      });
    });

    it('should handle inactive campaigns', () => {
      const raw = {
        id: 'campaign-1',
        name: 'Inactive Campaign',
        couponCode: null,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minPurchaseAmount: null,
        maxDiscountAmount: null,
        startDate: null,
        endDate: null,
        usageLimit: null,
        usagePerCustomer: null,
        currentUsageCount: 0,
        status: 'INACTIVE',
        currencyCode: 'KES'
      };

      const campaign = mapper.toDomain(raw);

      expect(campaign.status).toBe('INACTIVE');
    });

    it('should use default currency when not specified', () => {
      const raw = {
        id: 'campaign-1',
        name: 'Default Currency Campaign',
        couponCode: null,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minPurchaseAmount: 5000,
        maxDiscountAmount: null,
        startDate: null,
        endDate: null,
        usageLimit: null,
        usagePerCustomer: null,
        currentUsageCount: 0,
        status: 'ACTIVE'
        // currencyCode not specified
      };

      const campaign = mapper.toDomain(raw);

      expect(campaign.minPurchaseAmount?.currency).toBe('KES');
    });
  });

  describe('toPersistence', () => {
    it('should map basic campaign from domain to database format', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Summer Sale',
        couponCode: 'SUMMER20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20
      });

      const persistence = mapper.toPersistence(campaign);

      expect(persistence.id).toBe('campaign-1');
      expect(persistence.name).toBe('Summer Sale');
      expect(persistence.couponCode).toBe('SUMMER20');
      expect(persistence.discountType).toBe(DiscountType.PERCENTAGE);
      expect(persistence.discountValue).toBe(20);
      expect(persistence.currentUsageCount).toBe(0);
      expect(persistence.status).toBe('ACTIVE');
    });

    it('should map campaign with all optional fields', () => {
      const startDate = new Date('2026-06-01');
      const endDate = new Date('2026-08-31');
      const minPurchase = Money.create(5000);
      const maxDiscount = Money.create(2000);

      const campaign = Campaign.create({
        id: 'campaign-1',
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

      const persistence = mapper.toPersistence(campaign);

      expect(persistence.minPurchaseAmount).toBe(5000);
      expect(persistence.maxDiscountAmount).toBe(2000);
      expect(persistence.startDate).toEqual(startDate);
      expect(persistence.endDate).toEqual(endDate);
      expect(persistence.usageLimit).toBe(100);
      expect(persistence.usagePerCustomer).toBe(2);
    });

    it('should extract Money amounts for persistence', () => {
      const minPurchase = Money.create(5000);
      const maxDiscount = Money.create(2000);

      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Money Campaign',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 1000,
        minPurchaseAmount: minPurchase,
        maxDiscountAmount: maxDiscount
      });

      const persistence = mapper.toPersistence(campaign);

      expect(persistence.minPurchaseAmount).toBe(5000);
      expect(persistence.maxDiscountAmount).toBe(2000);
      expect(persistence.currencyCode).toBe('KES');
    });

    it('should handle null optional fields', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Simple Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10
      });

      const persistence = mapper.toPersistence(campaign);

      expect(persistence.couponCode).toBeUndefined();
      expect(persistence.minPurchaseAmount).toBeUndefined();
      expect(persistence.maxDiscountAmount).toBeUndefined();
      expect(persistence.startDate).toBeUndefined();
      expect(persistence.endDate).toBeUndefined();
      expect(persistence.usageLimit).toBeUndefined();
      expect(persistence.usagePerCustomer).toBeUndefined();
    });
  });

  describe('Round-trip Mapping', () => {
    it('should preserve campaign data through toDomain and toPersistence', () => {
      const startDate = new Date('2026-06-01');
      const endDate = new Date('2026-08-31');
      const minPurchase = Money.create(5000);
      const maxDiscount = Money.create(2000);

      const originalCampaign = Campaign.create({
        id: 'campaign-1',
        name: 'Round-trip Campaign',
        couponCode: 'ROUNDTRIP',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
        minPurchaseAmount: minPurchase,
        maxDiscountAmount: maxDiscount,
        startDate,
        endDate,
        usageLimit: 50,
        usagePerCustomer: 1
      });

      // Simulate persistence and retrieval
      const persistence = mapper.toPersistence(originalCampaign);
      const retrievedCampaign = mapper.toDomain(persistence);

      expect(retrievedCampaign.id).toBe(originalCampaign.id);
      expect(retrievedCampaign.name).toBe(originalCampaign.name);
      expect(retrievedCampaign.couponCode).toBe(originalCampaign.couponCode);
      expect(retrievedCampaign.discountType).toBe(originalCampaign.discountType);
      expect(retrievedCampaign.discountValue).toBe(originalCampaign.discountValue);
      expect(retrievedCampaign.minPurchaseAmount?.amount).toBe(originalCampaign.minPurchaseAmount?.amount);
      expect(retrievedCampaign.maxDiscountAmount?.amount).toBe(originalCampaign.maxDiscountAmount?.amount);
      expect(retrievedCampaign.usageLimit).toBe(originalCampaign.usageLimit);
      expect(retrievedCampaign.usagePerCustomer).toBe(originalCampaign.usagePerCustomer);
    });
  });
});
