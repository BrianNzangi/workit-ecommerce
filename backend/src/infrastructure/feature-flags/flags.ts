/**
 * Feature Flags for DDD Architecture Migration
 *
 * Controls which bounded contexts use the new DDD implementation vs. legacy code.
 * Allows for gradual rollout and instant rollback of the refactoring.
 */

/**
 * Get feature flag value from environment variable
 *
 * @param flagName Feature flag name
 * @param defaultValue Default value if not set
 * @returns Boolean flag value
 */
function getFlag(flagName: string, defaultValue: boolean = false): boolean {
  const value = process.env[flagName];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Feature Flags Object
 *
 * Each flag controls whether a bounded context uses the new DDD implementation.
 */
export const featureFlags = {
  /**
   * V2_ONLY
   *
   * When true, the active backend should prefer migrated v2/DDD route handlers wherever
   * they exist, while still allowing remaining legacy-only handlers to run until
   * their replacements are implemented.
   *
   * Environment variable: V2_ONLY
   * Default: false
   */
  v2OnlyMode: getFlag('V2_ONLY', false),

  /**
   * USE_DDD_ORDER_MANAGEMENT
   *
   * When true, order management operations use the new DDD Order aggregate.
   * When false, uses legacy Transaction Script implementation.
   *
   * Environment variable: USE_DDD_ORDER_MANAGEMENT
   * Default: false (use legacy implementation)
   */
  useDDDOrderManagement: getFlag('USE_DDD_ORDER_MANAGEMENT', false),

  /**
   * USE_DDD_CATALOG
   *
   * When true, catalog operations use the new DDD Product aggregate.
   * When false, uses legacy implementation.
   *
   * Environment variable: USE_DDD_CATALOG
   * Default: false (use legacy implementation)
   */
  useDDDCatalog: getFlag('USE_DDD_CATALOG', false),

  /**
   * USE_DDD_CUSTOMER
   *
   * When true, customer management uses the new DDD Customer aggregate.
   * When false, uses legacy implementation.
   *
   * Environment variable: USE_DDD_CUSTOMER
   * Default: false (use legacy implementation)
   */
  useDDDCustomer: getFlag('USE_DDD_CUSTOMER', false),

  /**
   * USE_DDD_MARKETING
   *
   * When true, marketing operations use the new DDD Campaign aggregate.
   * When false, uses legacy implementation.
   *
   * Environment variable: USE_DDD_MARKETING
   * Default: false (use legacy implementation)
   */
  useDDDMarketing: getFlag('USE_DDD_MARKETING', false),

  /**
   * USE_DDD_FULFILLMENT
   *
   * When true, fulfillment operations use the new DDD implementation.
   * When false, uses legacy implementation.
   *
   * Environment variable: USE_DDD_FULFILLMENT
   * Default: false (use legacy implementation)
   */
  useDDDFulfillment: getFlag('USE_DDD_FULFILLMENT', false),
};

/**
 * Check if all DDD contexts are enabled
 *
 * @returns true if all DDD contexts are enabled
 */
export function allDDDContextsEnabled(): boolean {
  return (
    featureFlags.useDDDOrderManagement &&
    featureFlags.useDDDCatalog &&
    featureFlags.useDDDCustomer &&
    featureFlags.useDDDMarketing &&
    featureFlags.useDDDFulfillment
  );
}

export function isRouteMigrationEnabled(flag: boolean): boolean {
  return featureFlags.v2OnlyMode || flag;
}

/**
 * Get a summary of feature flag status
 *
 * @returns Object with flag status
 */
export function getFeatureFlagStatus(): Record<string, boolean> {
  return {
    v2OnlyMode: featureFlags.v2OnlyMode,
    useDDDOrderManagement: featureFlags.useDDDOrderManagement,
    useDDDCatalog: featureFlags.useDDDCatalog,
    useDDDCustomer: featureFlags.useDDDCustomer,
    useDDDMarketing: featureFlags.useDDDMarketing,
    useDDDFulfillment: featureFlags.useDDDFulfillment,
  };
}
