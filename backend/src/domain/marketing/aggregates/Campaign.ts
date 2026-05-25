import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { Money } from '../../order-management/value-objects/Money.js';
import { CampaignRedeemed } from '../events/CampaignRedeemed.js';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y'
}

interface CampaignProps {
  name: string;
  couponCode?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: Money;
  maxDiscountAmount?: Money;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number;
  usagePerCustomer?: number;
  currentUsageCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * Campaign Aggregate Root
 *
 * Represents a marketing campaign with discount rules, eligibility criteria, and usage tracking.
 * Enforces business rules for campaign eligibility and discount calculation.
 *
 * Business Rules:
 * - A campaign must be ACTIVE to be eligible
 * - Eligibility is determined by date range, usage limits, and minimum purchase amount
 * - Discount calculation respects maximum discount limits
 * - Campaign usage is tracked globally and per-customer
 */
export class Campaign extends AggregateRoot<string> {
  private props: CampaignProps;

  private constructor(id: string, props: CampaignProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a new campaign
   *
   * @param params Campaign creation parameters
   * @returns New Campaign aggregate
   */
  static create(params: {
    id: string;
    name: string;
    couponCode?: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount?: Money;
    maxDiscountAmount?: Money;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    usagePerCustomer?: number;
  }): Campaign {
    return new Campaign(params.id, {
      ...params,
      currentUsageCount: 0,
      status: 'ACTIVE'
    });
  }

  /**
   * Reconstitute a campaign from persistence
   *
   * @param props Campaign properties from database
   * @returns Campaign aggregate
   */
  static reconstitute(id: string, props: CampaignProps): Campaign {
    return new Campaign(id, props);
  }

  // Getters for campaign properties
  get name(): string {
    return this.props.name;
  }

  get couponCode(): string | undefined {
    return this.props.couponCode;
  }

  get discountType(): DiscountType {
    return this.props.discountType;
  }

  get discountValue(): number {
    return this.props.discountValue;
  }

  get minPurchaseAmount(): Money | undefined {
    return this.props.minPurchaseAmount;
  }

  get maxDiscountAmount(): Money | undefined {
    return this.props.maxDiscountAmount;
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get usageLimit(): number | undefined {
    return this.props.usageLimit;
  }

  get usagePerCustomer(): number | undefined {
    return this.props.usagePerCustomer;
  }

  get currentUsageCount(): number {
    return this.props.currentUsageCount;
  }

  get status(): 'ACTIVE' | 'INACTIVE' {
    return this.props.status;
  }

  /**
   * Check if campaign is eligible for use
   *
   * Validates:
   * - Campaign is active
   * - Current date is within campaign date range (if specified)
   * - Global usage limit not exceeded (if specified)
   * - Per-customer usage limit not exceeded (if specified)
   * - Order subtotal meets minimum purchase requirement (if specified)
   *
   * @param params Eligibility check parameters
   * @returns true if campaign is eligible, false otherwise
   */
  isEligible(params: {
    orderSubtotal: Money;
    customerId: string;
    customerUsageCount: number;
  }): boolean {
    const now = new Date();

    // Check campaign status
    if (this.props.status !== 'ACTIVE') {
      return false;
    }

    // Check date range
    if (this.props.startDate && this.props.startDate > now) {
      return false;
    }
    if (this.props.endDate && this.props.endDate < now) {
      return false;
    }

    // Check usage limits
    if (this.props.usageLimit && this.props.currentUsageCount >= this.props.usageLimit) {
      return false;
    }
    if (this.props.usagePerCustomer && params.customerUsageCount >= this.props.usagePerCustomer) {
      return false;
    }

    // Check minimum purchase
    if (this.props.minPurchaseAmount && params.orderSubtotal.amount < this.props.minPurchaseAmount.amount) {
      return false;
    }

    return true;
  }

  /**
   * Calculate discount amount based on campaign rules
   *
   * Supports multiple discount types:
   * - PERCENTAGE: Percentage of order subtotal (respects max discount limit)
   * - FIXED_AMOUNT: Fixed discount amount
   * - FREE_SHIPPING: Discount equal to shipping cost
   * - BUY_X_GET_Y: Placeholder for future implementation
   *
   * Discount is capped at order subtotal + shipping cost
   *
   * @param orderSubtotal Order subtotal before discount
   * @param shippingCost Shipping cost
   * @returns Discount amount as Money value object
   */
  calculateDiscount(orderSubtotal: Money, shippingCost: Money): Money {
    let discountAmount = 0;

    switch (this.props.discountType) {
      case DiscountType.PERCENTAGE:
        discountAmount = (orderSubtotal.amount * this.props.discountValue) / 100;
        if (this.props.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, this.props.maxDiscountAmount.amount);
        }
        break;

      case DiscountType.FIXED_AMOUNT:
        discountAmount = this.props.discountValue;
        break;

      case DiscountType.FREE_SHIPPING:
        discountAmount = shippingCost.amount;
        break;

      case DiscountType.BUY_X_GET_Y:
        // Placeholder for future implementation
        discountAmount = 0;
        break;

      default:
        discountAmount = 0;
    }

    // Cap discount at order total + shipping
    const maxDiscount = orderSubtotal.amount + shippingCost.amount;
    const finalDiscount = Math.min(discountAmount, maxDiscount);

    return Money.create(finalDiscount, orderSubtotal.currency);
  }

  /**
   * Redeem campaign for an order
   *
   * Increments usage counters and raises CampaignRedeemed domain event.
   * Should only be called after eligibility has been verified.
   *
   * @param customerId Customer redeeming the campaign
   * @param orderId Order the campaign is being redeemed for
   */
  redeem(customerId: string, orderId: string): void {
    this.props.currentUsageCount++;
    this.addDomainEvent(new CampaignRedeemed(this.id, customerId, orderId));
  }
}
