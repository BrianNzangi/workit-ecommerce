import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/infrastructure/events/EventBus.js';
import { OrderPlacedHandler } from '../../src/application/marketing/event-handlers/OrderPlacedHandler.js';
import { OrderPlaced } from '../../src/domain/order-management/events/OrderPlaced.js';
import { Campaign, DiscountType } from '../../src/domain/marketing/aggregates/Campaign.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';
import { PricingService } from '../../src/domain/order-management/services/PricingService.js';

describe('Marketing-Order Integration Tests', () => {
  let eventBus: EventBus;
  let orderPlacedHandler: OrderPlacedHandler;
  let pricingService: PricingService;

  beforeEach(() => {
    eventBus = new EventBus();
    orderPlacedHandler = new OrderPlacedHandler(eventBus);
    pricingService = new PricingService();
  });

  describe('Campaign Application During Order Placement', () => {
    it('should apply percentage discount campaign to order', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Summer Sale',
        couponCode: 'SUMMER20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
      });

      const subtotal = Money.create(10000);
      const shipping = Money.create(500);

      const discount = pricingService.applyDDDCampaignDiscount({
        subtotal,
        shipping,
        campaign,
      });

      expect(discount.amount).toBe(2000); // 20% of 10000
    });

    it('should apply fixed amount discount campaign to order', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Fixed Discount',
        couponCode: 'FIXED1000',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 1000,
      });

      const subtotal = Money.create(10000);
      const shipping = Money.create(500);

      const discount = pricingService.applyDDDCampaignDiscount({
        subtotal,
        shipping,
        campaign,
      });

      expect(discount.amount).toBe(1000);
    });

    it('should apply free shipping campaign to order', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Free Shipping',
        couponCode: 'FREESHIP',
        discountType: DiscountType.FREE_SHIPPING,
        discountValue: 0,
      });

      const subtotal = Money.create(10000);
      const shipping = Money.create(500);

      const discount = pricingService.applyDDDCampaignDiscount({
        subtotal,
        shipping,
        campaign,
      });

      expect(discount.amount).toBe(500); // equals shipping cost
    });

    it('should respect campaign eligibility rules', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Minimum Purchase Campaign',
        couponCode: 'MIN5000',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minPurchaseAmount: Money.create(5000),
      });

      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId: 'customer-1',
        customerUsageCount: 0,
      });

      expect(isEligible).toBe(true);
    });

    it('should reject campaign when minimum purchase not met', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Minimum Purchase Campaign',
        couponCode: 'MIN5000',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minPurchaseAmount: Money.create(5000),
      });

      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(3000),
        customerId: 'customer-1',
        customerUsageCount: 0,
      });

      expect(isEligible).toBe(false);
    });
  });

  describe('Campaign Redemption Event Publishing', () => {
    it('should publish CampaignRedeemed event when campaign is redeemed', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      });

      campaign.redeem('customer-1', 'order-1');

      const events = campaign.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('CampaignRedeemed');
    });

    it('should track campaign usage count after redemption', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      });

      expect(campaign.currentUsageCount).toBe(0);

      campaign.redeem('customer-1', 'order-1');

      expect(campaign.currentUsageCount).toBe(1);
    });

    it('should allow multiple redemptions', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      });

      campaign.redeem('customer-1', 'order-1');
      campaign.redeem('customer-2', 'order-2');
      campaign.redeem('customer-1', 'order-3');

      expect(campaign.currentUsageCount).toBe(3);
      expect(campaign.domainEvents).toHaveLength(3);
    });
  });

  describe('OrderPlaced Event Handling in Marketing Context', () => {
    it('should register OrderPlaced event handler', () => {
      let handlerCalled = false;

      // Override the subscribe method to track calls
      const originalSubscribe = eventBus.subscribe.bind(eventBus);
      eventBus.subscribe = (eventType: string, handler: any) => {
        if (eventType === 'OrderPlaced') {
          handlerCalled = true;
        }
        originalSubscribe(eventType, handler);
      };

      orderPlacedHandler.register();

      expect(handlerCalled).toBe(true);
    });

    it('should handle OrderPlaced event', async () => {
      orderPlacedHandler.register();

      const event = new OrderPlaced('order-1', 'customer-1', 5000, 'KES');

      // Publish the event
      await eventBus.publish([event]);

      // Event should be handled without errors
      expect(true).toBe(true);
    });

    it('should process multiple OrderPlaced events', async () => {
      orderPlacedHandler.register();

      const events = [
        new OrderPlaced('order-1', 'customer-1', 5000, 'KES'),
        new OrderPlaced('order-2', 'customer-2', 7500, 'KES'),
        new OrderPlaced('order-3', 'customer-1', 3000, 'KES'),
      ];

      await eventBus.publish(events);

      // All events should be handled without errors
      expect(true).toBe(true);
    });
  });

  describe('Campaign Eligibility and Discount Calculation', () => {
    it('should calculate correct discount for eligible campaign', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Test Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
        minPurchaseAmount: Money.create(5000),
      });

      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId: 'customer-1',
        customerUsageCount: 0,
      });

      expect(isEligible).toBe(true);

      const discount = campaign.calculateDiscount(Money.create(10000), Money.create(500));
      expect(discount.amount).toBe(1500); // 15% of 10000
    });

    it('should handle campaign with usage limits', () => {
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Limited Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        usageLimit: 5,
        usagePerCustomer: 2,
      });

      // First customer, first use
      let isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId: 'customer-1',
        customerUsageCount: 0,
      });
      expect(isEligible).toBe(true);

      // First customer, second use
      isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId: 'customer-1',
        customerUsageCount: 1,
      });
      expect(isEligible).toBe(true);

      // First customer, third use (exceeds per-customer limit)
      isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId: 'customer-1',
        customerUsageCount: 2,
      });
      expect(isEligible).toBe(false);
    });

    it('should handle campaign with date restrictions', () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 86400000); // 1 day ago
      const endDate = new Date(now.getTime() + 86400000); // 1 day from now

      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Time-Limited Campaign',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        startDate,
        endDate,
      });

      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId: 'customer-1',
        customerUsageCount: 0,
      });

      expect(isEligible).toBe(true);
    });
  });

  describe('End-to-End Marketing-Order Workflow', () => {
    it('should complete full order with campaign discount workflow', async () => {
      // 1. Create campaign
      const campaign = Campaign.create({
        id: 'campaign-1',
        name: 'Summer Sale',
        couponCode: 'SUMMER20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
      });

      // 2. Check eligibility
      const isEligible = campaign.isEligible({
        orderSubtotal: Money.create(10000),
        customerId: 'customer-1',
        customerUsageCount: 0,
      });
      expect(isEligible).toBe(true);

      // 3. Calculate discount
      const discount = pricingService.applyDDDCampaignDiscount({
        subtotal: Money.create(10000),
        shipping: Money.create(500),
        campaign,
      });
      expect(discount.amount).toBe(2000);

      // 4. Calculate total
      const total = pricingService.calculateTotal({
        subtotal: Money.create(10000),
        shipping: Money.create(500),
        tax: Money.create(0),
        discount,
      });
      expect(total.amount).toBe(8500); // 10000 + 500 - 2000

      // 5. Redeem campaign
      campaign.redeem('customer-1', 'order-1');
      expect(campaign.currentUsageCount).toBe(1);

      // 6. Publish OrderPlaced event
      const event = new OrderPlaced('order-1', 'customer-1', total.amount, 'KES');
      orderPlacedHandler.register();
      await eventBus.publish([event]);

      // Workflow completed successfully
      expect(true).toBe(true);
    });
  });
});
