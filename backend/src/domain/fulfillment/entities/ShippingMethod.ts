import { Entity } from '../../shared/Entity.js';
import { Money } from '../../order-management/value-objects/Money.js';

interface ShippingMethodProps {
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
  isExpress: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ShippingMethod Entity in the Fulfillment Context.
 *
 * Represents a shipping method available for orders.
 * Responsible for calculating shipping costs based on order details.
 *
 * Business Rules:
 * - Code must be unique and non-empty
 * - Name must be non-empty
 * - Only enabled methods can be used for orders
 * - Shipping cost is calculated based on order details (weight, destination, etc.)
 */
export class ShippingMethod extends Entity<string> {
  private props: ShippingMethodProps;

  private constructor(id: string, props: ShippingMethodProps) {
    super(id);
    this.props = props;
    this.validateInvariants();
  }

  /**
   * Create a new ShippingMethod.
   */
  static create(params: {
    id: string;
    code: string;
    name: string;
    description?: string;
    enabled: boolean;
    isExpress: boolean;
  }): ShippingMethod {
    return new ShippingMethod(params.id, {
      code: params.code,
      name: params.name,
      description: params.description,
      enabled: params.enabled,
      isExpress: params.isExpress,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstitute a ShippingMethod from persisted data.
   */
  static reconstitute(params: {
    id: string;
    code: string;
    name: string;
    description?: string;
    enabled: boolean;
    isExpress: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ShippingMethod {
    return new ShippingMethod(params.id, { ...params });
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get isExpress(): boolean {
    return this.props.isExpress;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ─── Business Methods ────────────────────────────────────────────────────────

  /**
   * Calculate the shipping cost for an order.
   *
   * This is a simplified implementation that returns a fixed cost based on the shipping method.
   * In a real system, this would consider:
   * - Order weight/dimensions
   * - Destination zone/county
   * - Express vs standard delivery
   * - Special handling requirements
   *
   * @param params - Order details for cost calculation
   * @returns The calculated shipping cost as Money
   * @throws {Error} if the shipping method is not enabled
   */
  calculateCost(params: {
    orderSubtotal: Money;
    destinationCounty?: string;
    isExpress?: boolean;
    currency?: string;
  }): Money {
    if (!this.props.enabled) {
      throw new Error(`Shipping method '${this.props.name}' is not enabled`);
    }

    const currency = params.currency ?? 'KES';

    // Simplified cost calculation:
    // - Standard methods: fixed cost based on method
    // - Express methods: higher fixed cost
    // - Could be extended to use zone-based pricing from ShippingZone/ShippingCity tables

    // For now, return a base cost (in real system, would query ShippingZone/ShippingCity)
    // This is a placeholder that should be enhanced with zone-based pricing
    const baseCost = this.props.isExpress ? 500 : 300; // KES

    return Money.create(baseCost, currency);
  }

  /**
   * Check if this shipping method is available for use.
   */
  isAvailable(): boolean {
    return this.props.enabled;
  }

  /**
   * Enable this shipping method.
   */
  enable(): void {
    this.props.enabled = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Disable this shipping method.
   */
  disable(): void {
    this.props.enabled = false;
    this.props.updatedAt = new Date();
  }

  private validateInvariants(): void {
    if (!this.props.code || this.props.code.trim().length === 0) {
      throw new Error('ShippingMethod code cannot be empty');
    }

    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('ShippingMethod name cannot be empty');
    }
  }
}
