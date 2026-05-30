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
   * Default: true (use DDD implementation)
   */
  useDDDOrderManagement: getFlag('USE_DDD_ORDER_MANAGEMENT', true),

  /**
   * USE_DDD_CATALOG
   *
   * When true, catalog operations use the new DDD Product aggregate.
   * When false, uses legacy implementation.
   *
   * Environment variable: USE_DDD_CATALOG
   * Default: true (use DDD implementation)
   */
  useDDDCatalog: getFlag('USE_DDD_CATALOG', true),

  /**
   * USE_DDD_CUSTOMER
   *
   * When true, customer management uses the new DDD Customer aggregate.
   * When false, uses legacy implementation.
   *
   * Environment variable: USE_DDD_CUSTOMER
   * Default: true (use DDD implementation)
   */
  useDDDCustomer: getFlag('USE_DDD_CUSTOMER', true),

  /**
   * USE_DDD_MARKETING
   *
   * When true, marketing operations use the new DDD Campaign aggregate.
   * When false, uses legacy implementation.
   *
   * Environment variable: USE_DDD_MARKETING
   * Default: true (use DDD implementation)
   */
  useDDDMarketing: getFlag('USE_DDD_MARKETING', true),

  /**
   * USE_DDD_FULFILLMENT
   *
   * When true, fulfillment operations use the new DDD implementation.
   * When false, uses legacy implementation.
   *
   * Environment variable: USE_DDD_FULFILLMENT
   * Default: true (use DDD implementation)
   */
  useDDDFulfillment: getFlag('USE_DDD_FULFILLMENT', true),

  /**
   * USE_DDD_PROMOTIONS
   *
   * When true, promotions operations use the new DDD aggregates.
   * When false, uses legacy Transaction Script implementation.
   *
   * Environment variable: USE_DDD_PROMOTIONS
   * Default: true (use DDD implementation)
   */
  useDDDPromotions: getFlag('USE_DDD_PROMOTIONS', true),
};

export function isRouteMigrationEnabled(flag: boolean): boolean {
  return featureFlags.v2OnlyMode || flag;
}


