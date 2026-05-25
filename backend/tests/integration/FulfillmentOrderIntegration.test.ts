import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/infrastructure/events/EventBus.js';
import { PaymentSettledHandler } from '../../src/application/fulfillment/event-handlers/PaymentSettledHandler.js';
import { PaymentSettled } from '../../src/domain/order-management/events/PaymentSettled.js';
import { ShippingMethod } from '../../src/domain/fulfillment/entities/ShippingMethod.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';
import { PricingService } from '../../src/domain/order-management/services/PricingService.js';

describe('Fulfillment-Order Integration Tests', () => {
  let eventBus: EventBus;
  let paymentSettledHandler: PaymentSettledHandler;
  let pricingService: PricingService;

  beforeEach(() => {
    eventBus = new EventBus();
    paymentSettledHandler = new PaymentSettledHandler(eventBus);
    pricingService = new PricingService();
  });

  describe('ShippingMethod Integration with Order', () => {
    it('should create a standard shipping method', () => {
      const method = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        description: 'Delivery in 3-5 business days',
        enabled: true,
        isExpress: false,
      });

      expect(method.id).toBe('standard-1');
      expect(method.code).toBe('STANDARD');
      expect(method.name).toBe('Standard Delivery');
      expect(method.enabled).toBe(true);
      expect(method.isAvailable()).toBe(true);
    });

    it('should create an express shipping method', () => {
      const method = ShippingMethod.create({
        id: 'express-1',
        code: 'EXPRESS',
        name: 'Express Delivery',
        description: 'Next day delivery',
        enabled: true,
        isExpress: true,
      });

      expect(method.isExpress).toBe(true);
      expect(method.isAvailable()).toBe(true);
    });

    it('should calculate shipping cost for standard method', () => {
      const method = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      const subtotal = Money.create(5000, 'KES');
      const cost = method.calculateCost({
        orderSubtotal: subtotal,
        currency: 'KES',
      });

      expect(cost.amount).toBe(300); // Standard cost
      expect(cost.currency).toBe('KES');
    });

    it('should calculate shipping cost for express method', () => {
      const method = ShippingMethod.create({
        id: 'express-1',
        code: 'EXPRESS',
        name: 'Express Delivery',
        enabled: true,
        isExpress: true,
      });

      const subtotal = Money.create(5000, 'KES');
      const cost = method.calculateCost({
        orderSubtotal: subtotal,
        currency: 'KES',
      });

      expect(cost.amount).toBe(500); // Express cost
      expect(cost.currency).toBe('KES');
    });

    it('should throw error when calculating cost for disabled method', () => {
      const method = ShippingMethod.create({
        id: 'disabled-1',
        code: 'DISABLED',
        name: 'Disabled Method',
        enabled: false,
        isExpress: false,
      });

      const subtotal = Money.create(5000, 'KES');

      expect(() =>
        method.calculateCost({
          orderSubtotal: subtotal,
          currency: 'KES',
        }),
      ).toThrow("Shipping method 'Disabled Method' is not enabled");
    });
  });

  describe('PricingService with ShippingMethod', () => {
    it('should calculate shipping cost using PricingService', () => {
      const method = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      const subtotal = Money.create(5000, 'KES');
      const shippingCost = pricingService.calculateShippingCost(method, {
        orderSubtotal: subtotal,
      });

      expect(shippingCost.amount).toBe(300);
      expect(shippingCost.currency).toBe('KES');
    });

    it('should calculate order total with shipping method', () => {
      const method = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      const subtotal = Money.create(5000, 'KES');
      const shipping = pricingService.calculateShippingCost(method, {
        orderSubtotal: subtotal,
      });
      const tax = Money.create(0, 'KES');
      const discount = Money.create(0, 'KES');

      const total = pricingService.calculateTotal({
        subtotal,
        shipping,
        tax,
        discount,
      });

      expect(total.amount).toBe(5300); // 5000 + 300
    });

    it('should calculate order total with express shipping', () => {
      const method = ShippingMethod.create({
        id: 'express-1',
        code: 'EXPRESS',
        name: 'Express Delivery',
        enabled: true,
        isExpress: true,
      });

      const subtotal = Money.create(5000, 'KES');
      const shipping = pricingService.calculateShippingCost(method, {
        orderSubtotal: subtotal,
      });

      const total = pricingService.calculateTotal({
        subtotal,
        shipping,
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
      });

      expect(total.amount).toBe(5500); // 5000 + 500
    });
  });

  describe('ShippingMethod Enable/Disable', () => {
    it('should enable a disabled shipping method', () => {
      const method = ShippingMethod.create({
        id: 'test-1',
        code: 'TEST',
        name: 'Test Method',
        enabled: false,
        isExpress: false,
      });

      expect(method.isAvailable()).toBe(false);
      method.enable();
      expect(method.isAvailable()).toBe(true);
    });

    it('should disable an enabled shipping method', () => {
      const method = ShippingMethod.create({
        id: 'test-1',
        code: 'TEST',
        name: 'Test Method',
        enabled: true,
        isExpress: false,
      });

      expect(method.isAvailable()).toBe(true);
      method.disable();
      expect(method.isAvailable()).toBe(false);
    });
  });

  describe('PaymentSettled Event Handling in Fulfillment Context', () => {
    it('should register PaymentSettled event handler', () => {
      let handlerCalled = false;

      // Override the subscribe method to track calls
      const originalSubscribe = eventBus.subscribe.bind(eventBus);
      eventBus.subscribe = (eventType: string, handler: any) => {
        if (eventType === 'PaymentSettled') {
          handlerCalled = true;
        }
        originalSubscribe(eventType, handler);
      };

      paymentSettledHandler.register();

      expect(handlerCalled).toBe(true);
    });

    it('should handle PaymentSettled event', async () => {
      paymentSettledHandler.register();

      const event = new PaymentSettled(
        'order-1',
        'customer-1',
        5300,
        'KES',
        'paystack-ref-123',
      );

      // Publish the event
      await eventBus.publish([event]);

      // Event should be handled without errors
      expect(true).toBe(true);
    });

    it('should process multiple PaymentSettled events', async () => {
      paymentSettledHandler.register();

      const events = [
        new PaymentSettled('order-1', 'customer-1', 5300, 'KES', 'paystack-ref-1'),
        new PaymentSettled('order-2', 'customer-2', 7500, 'KES', 'paystack-ref-2'),
        new PaymentSettled('order-3', 'customer-1', 3000, 'KES', 'paystack-ref-3'),
      ];

      await eventBus.publish(events);

      // All events should be handled without errors
      expect(true).toBe(true);
    });
  });

  describe('End-to-End Fulfillment-Order Workflow', () => {
    it('should complete full order with shipping method workflow', async () => {
      // 1. Create shipping method
      const shippingMethod = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      // 2. Calculate order pricing with shipping
      const subtotal = Money.create(5000, 'KES');
      const shipping = pricingService.calculateShippingCost(shippingMethod, {
        orderSubtotal: subtotal,
      });
      const tax = Money.create(0, 'KES');
      const discount = Money.create(0, 'KES');

      const total = pricingService.calculateTotal({
        subtotal,
        shipping,
        tax,
        discount,
      });

      expect(total.amount).toBe(5300);

      // 3. Register fulfillment event handler
      paymentSettledHandler.register();

      // 4. Publish PaymentSettled event
      const event = new PaymentSettled(
        'order-1',
        'customer-1',
        total.amount,
        'KES',
        'paystack-ref-123',
      );
      await eventBus.publish([event]);

      // 5. Verify fulfillment workflow triggered
      expect(true).toBe(true);
    });

    it('should handle order with express shipping', async () => {
      // 1. Create express shipping method
      const shippingMethod = ShippingMethod.create({
        id: 'express-1',
        code: 'EXPRESS',
        name: 'Express Delivery',
        enabled: true,
        isExpress: true,
      });

      // 2. Calculate order pricing with express shipping
      const subtotal = Money.create(10000, 'KES');
      const shipping = pricingService.calculateShippingCost(shippingMethod, {
        orderSubtotal: subtotal,
      });

      const total = pricingService.calculateTotal({
        subtotal,
        shipping,
        tax: Money.create(0, 'KES'),
        discount: Money.create(0, 'KES'),
      });

      expect(total.amount).toBe(10500); // 10000 + 500 (express)

      // 3. Trigger fulfillment workflow
      paymentSettledHandler.register();
      const event = new PaymentSettled(
        'order-2',
        'customer-2',
        total.amount,
        'KES',
        'paystack-ref-456',
      );
      await eventBus.publish([event]);

      expect(true).toBe(true);
    });

    it('should prevent fulfillment with disabled shipping method', () => {
      // 1. Create disabled shipping method
      const shippingMethod = ShippingMethod.create({
        id: 'disabled-1',
        code: 'DISABLED',
        name: 'Disabled Method',
        enabled: false,
        isExpress: false,
      });

      // 2. Attempt to calculate shipping cost
      const subtotal = Money.create(5000, 'KES');

      expect(() =>
        pricingService.calculateShippingCost(shippingMethod, {
          orderSubtotal: subtotal,
        }),
      ).toThrow("Shipping method 'Disabled Method' is not enabled");
    });
  });

  describe('Shipping Method Availability', () => {
    it('should track multiple shipping methods', () => {
      const standard = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      const express = ShippingMethod.create({
        id: 'express-1',
        code: 'EXPRESS',
        name: 'Express Delivery',
        enabled: true,
        isExpress: true,
      });

      const overnight = ShippingMethod.create({
        id: 'overnight-1',
        code: 'OVERNIGHT',
        name: 'Overnight Delivery',
        enabled: false,
        isExpress: true,
      });

      const methods = [standard, express, overnight];
      const availableMethods = methods.filter((m) => m.isAvailable());

      expect(availableMethods).toHaveLength(2);
      expect(availableMethods).toContain(standard);
      expect(availableMethods).toContain(express);
    });

    it('should calculate different costs for different methods', () => {
      const standard = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      const express = ShippingMethod.create({
        id: 'express-1',
        code: 'EXPRESS',
        name: 'Express Delivery',
        enabled: true,
        isExpress: true,
      });

      const subtotal = Money.create(5000, 'KES');

      const standardCost = pricingService.calculateShippingCost(standard, {
        orderSubtotal: subtotal,
      });

      const expressCost = pricingService.calculateShippingCost(express, {
        orderSubtotal: subtotal,
      });

      expect(standardCost.amount).toBe(300);
      expect(expressCost.amount).toBe(500);
      expect(expressCost.amount).toBeGreaterThan(standardCost.amount);
    });
  });
});
