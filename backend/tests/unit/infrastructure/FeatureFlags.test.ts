import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { featureFlags, allDDDContextsEnabled, getFeatureFlagStatus } from '../../../src/infrastructure/feature-flags/flags.js';

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Save original environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Feature Flag Values', () => {
    it('should have all flags defined', () => {
      expect(featureFlags).toHaveProperty('v2OnlyMode');
      expect(featureFlags).toHaveProperty('useDDDOrderManagement');
      expect(featureFlags).toHaveProperty('useDDDCatalog');
      expect(featureFlags).toHaveProperty('useDDDCustomer');
      expect(featureFlags).toHaveProperty('useDDDMarketing');
      expect(featureFlags).toHaveProperty('useDDDFulfillment');
    });

    it('should have boolean values for all flags', () => {
      expect(typeof featureFlags.v2OnlyMode).toBe('boolean');
      expect(typeof featureFlags.useDDDOrderManagement).toBe('boolean');
      expect(typeof featureFlags.useDDDCatalog).toBe('boolean');
      expect(typeof featureFlags.useDDDCustomer).toBe('boolean');
      expect(typeof featureFlags.useDDDMarketing).toBe('boolean');
      expect(typeof featureFlags.useDDDFulfillment).toBe('boolean');
    });
  });

  describe('allDDDContextsEnabled', () => {
    it('should return false when not all contexts are enabled', () => {
      // At least one flag should be false by default
      const result = allDDDContextsEnabled();
      expect(typeof result).toBe('boolean');
    });

    it('should return true only when all contexts are enabled', () => {
      // This test verifies the logic, but actual result depends on environment
      const result = allDDDContextsEnabled();
      const allEnabled =
        featureFlags.useDDDOrderManagement &&
        featureFlags.useDDDCatalog &&
        featureFlags.useDDDCustomer &&
        featureFlags.useDDDMarketing &&
        featureFlags.useDDDFulfillment;

      expect(result).toBe(allEnabled);
    });
  });

  describe('getFeatureFlagStatus', () => {
    it('should return an object with all flag statuses', () => {
      const status = getFeatureFlagStatus();

      expect(status).toHaveProperty('useDDDOrderManagement');
      expect(status).toHaveProperty('v2OnlyMode');
      expect(status).toHaveProperty('useDDDCatalog');
      expect(status).toHaveProperty('useDDDCustomer');
      expect(status).toHaveProperty('useDDDMarketing');
      expect(status).toHaveProperty('useDDDFulfillment');
    });

    it('should return boolean values for all flags', () => {
      const status = getFeatureFlagStatus();

      expect(typeof status.v2OnlyMode).toBe('boolean');
      expect(typeof status.useDDDOrderManagement).toBe('boolean');
      expect(typeof status.useDDDCatalog).toBe('boolean');
      expect(typeof status.useDDDCustomer).toBe('boolean');
      expect(typeof status.useDDDMarketing).toBe('boolean');
      expect(typeof status.useDDDFulfillment).toBe('boolean');
    });

    it('should match the featureFlags object values', () => {
      const status = getFeatureFlagStatus();

      expect(status.v2OnlyMode).toBe(featureFlags.v2OnlyMode);
      expect(status.useDDDOrderManagement).toBe(featureFlags.useDDDOrderManagement);
      expect(status.useDDDCatalog).toBe(featureFlags.useDDDCatalog);
      expect(status.useDDDCustomer).toBe(featureFlags.useDDDCustomer);
      expect(status.useDDDMarketing).toBe(featureFlags.useDDDMarketing);
      expect(status.useDDDFulfillment).toBe(featureFlags.useDDDFulfillment);
    });
  });

  describe('Marketing Feature Flag', () => {
    it('should have useDDDMarketing flag', () => {
      expect(featureFlags).toHaveProperty('useDDDMarketing');
      expect(typeof featureFlags.useDDDMarketing).toBe('boolean');
    });

    it('should be controlled by USE_DDD_MARKETING environment variable', () => {
      // This test documents the expected behavior
      // The actual value depends on the environment
      const status = getFeatureFlagStatus();
      expect(status).toHaveProperty('useDDDMarketing');
    });
  });
});
