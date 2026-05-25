import { describe, it, expect } from 'vitest';
import { ShippingMethod } from '../../../../src/domain/fulfillment/entities/ShippingMethod.js';
import { Money } from '../../../../src/domain/order-management/value-objects/Money.js';

describe('ShippingMethod Entity', () => {
  describe('create', () => {
    it('should create a new shipping method', () => {
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
      expect(method.description).toBe('Delivery in 3-5 business days');
      expect(method.enabled).toBe(true);
      expect(method.isExpress).toBe(false);
    });

    it('should throw error if code is empty', () => {
      expect(() =>
        ShippingMethod.create({
          id: 'test-1',
          code: '',
          name: 'Test Method',
          enabled: true,
          isExpress: false,
        }),
      ).toThrow('ShippingMethod code cannot be empty');
    });

    it('should throw error if name is empty', () => {
      expect(() =>
        ShippingMethod.create({
          id: 'test-1',
          code: 'TEST',
          name: '',
          enabled: true,
          isExpress: false,
        }),
      ).toThrow('ShippingMethod name cannot be empty');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a shipping method from persisted data', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const method = ShippingMethod.reconstitute({
        id: 'express-1',
        code: 'EXPRESS',
        name: 'Express Delivery',
        description: 'Next day delivery',
        enabled: true,
        isExpress: true,
        createdAt,
        updatedAt,
      });

      expect(method.id).toBe('express-1');
      expect(method.code).toBe('EXPRESS');
      expect(method.name).toBe('Express Delivery');
      expect(method.enabled).toBe(true);
      expect(method.isExpress).toBe(true);
      expect(method.createdAt).toEqual(createdAt);
      expect(method.updatedAt).toEqual(updatedAt);
    });
  });

  describe('calculateCost', () => {
    it('should calculate standard shipping cost', () => {
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

    it('should calculate express shipping cost', () => {
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

    it('should use default currency if not provided', () => {
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
      });

      expect(cost.currency).toBe('KES');
    });

    it('should throw error if shipping method is disabled', () => {
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

  describe('isAvailable', () => {
    it('should return true if enabled', () => {
      const method = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      expect(method.isAvailable()).toBe(true);
    });

    it('should return false if disabled', () => {
      const method = ShippingMethod.create({
        id: 'disabled-1',
        code: 'DISABLED',
        name: 'Disabled Method',
        enabled: false,
        isExpress: false,
      });

      expect(method.isAvailable()).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should enable a disabled shipping method', () => {
      const method = ShippingMethod.create({
        id: 'test-1',
        code: 'TEST',
        name: 'Test Method',
        enabled: false,
        isExpress: false,
      });

      expect(method.enabled).toBe(false);
      method.enable();
      expect(method.enabled).toBe(true);
    });

    it('should disable an enabled shipping method', () => {
      const method = ShippingMethod.create({
        id: 'test-1',
        code: 'TEST',
        name: 'Test Method',
        enabled: true,
        isExpress: false,
      });

      expect(method.enabled).toBe(true);
      method.disable();
      expect(method.enabled).toBe(false);
    });

    it('should update updatedAt when enabling', () => {
      const method = ShippingMethod.create({
        id: 'test-1',
        code: 'TEST',
        name: 'Test Method',
        enabled: false,
        isExpress: false,
      });

      const originalUpdatedAt = method.updatedAt;
      method.enable();

      expect(method.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should update updatedAt when disabling', () => {
      const method = ShippingMethod.create({
        id: 'test-1',
        code: 'TEST',
        name: 'Test Method',
        enabled: true,
        isExpress: false,
      });

      const originalUpdatedAt = method.updatedAt;
      method.disable();

      expect(method.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('equality', () => {
    it('should be equal if IDs match', () => {
      const method1 = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      const method2 = ShippingMethod.create({
        id: 'standard-1',
        code: 'DIFFERENT',
        name: 'Different Name',
        enabled: false,
        isExpress: true,
      });

      expect(method1.equals(method2)).toBe(true);
    });

    it('should not be equal if IDs differ', () => {
      const method1 = ShippingMethod.create({
        id: 'standard-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      const method2 = ShippingMethod.create({
        id: 'express-1',
        code: 'STANDARD',
        name: 'Standard Delivery',
        enabled: true,
        isExpress: false,
      });

      expect(method1.equals(method2)).toBe(false);
    });
  });
});
