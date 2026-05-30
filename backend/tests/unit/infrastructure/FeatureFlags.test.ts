import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { featureFlags } from '../../../src/infrastructure/feature-flags/flags.js';

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

  describe('Marketing Feature Flag', () => {
    it('should have useDDDMarketing flag', () => {
      expect(featureFlags).toHaveProperty('useDDDMarketing');
      expect(typeof featureFlags.useDDDMarketing).toBe('boolean');
    });

    it('should be controlled by USE_DDD_MARKETING environment variable', () => {
      expect(featureFlags).toHaveProperty('useDDDMarketing');
    });
  });
});
