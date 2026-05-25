import { Money } from '../value-objects/Money.js';
import { OrderLine } from '../entities/OrderLine.js';
import { Campaign } from '../../marketing/aggregates/Campaign.js';
import { ShippingMethod } from '../../fulfillment/entities/ShippingMethod.js';

export interface CampaignDiscount {
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y' | 'NONE';
  /** Discount value: percentage (0-100) for PERCENTAGE, amount for FIXED_AMOUNT, quantity for BUY_X_GET_Y. */
  discountValue: number;
  /** Minimum subtotal required to apply this discount (in major units). */
  minPurchaseAmount?: number;
  /** Maximum discount amount allowed (in major units). */
  maxDiscountAmount?: number;
}

/**
 * Domain service for calculating order pricing.
 *
 * Responsibilities:
 * - Calculate subtotal from order lines
 * - Apply campaign discounts
 * - Calculate the final order total
 *
 * This service is stateless and contains no infrastructure dependencies.
 */
export class PricingService {
  /**
   * Calculate the subtotal from a list of order lines.
   * Returns Money.create(0) for an empty list.
   */
  calculateSubtotal(lines: OrderLine[], currency = 'KES'): Money {
    if (lines.length === 0) {
      return Money.create(0, currency);
    }
    const total = lines.reduce((sum, line) => sum + line.totalPrice.amount, 0);
    return Money.create(total, lines[0].unitPrice.currency);
  }

  /**
   * Calculate the discount amount to apply given a campaign.
   *
   * @param subtotal - The order subtotal before discounts
   * @param shipping - The shipping cost
   * @param campaign - The campaign to apply, or undefined for no discount
   * @returns The discount amount (never exceeds subtotal + shipping)
   */
  applyDiscount(params: {
    subtotal: Money;
    shipping: Money;
    campaign?: CampaignDiscount;
  }): Money {
    const { subtotal, shipping, campaign } = params;

    if (!campaign || campaign.discountType === 'NONE') {
      return Money.create(0, subtotal.currency);
    }

    // Enforce minimum purchase amount
    if (
      campaign.minPurchaseAmount !== undefined &&
      subtotal.amount < campaign.minPurchaseAmount
    ) {
      return Money.create(0, subtotal.currency);
    }

    let discountAmount = 0;

    switch (campaign.discountType) {
      case 'PERCENTAGE': {
        discountAmount = (subtotal.amount * campaign.discountValue) / 100;
        if (campaign.maxDiscountAmount !== undefined && campaign.maxDiscountAmount > 0) {
          discountAmount = Math.min(discountAmount, campaign.maxDiscountAmount);
        }
        break;
      }

      case 'FIXED_AMOUNT': {
        discountAmount = campaign.discountValue;
        break;
      }

      case 'FREE_SHIPPING': {
        discountAmount = shipping.amount;
        break;
      }

      case 'BUY_X_GET_Y': {
        // BUY_X_GET_Y is handled at the application layer where product prices are available.
        // The domain service returns 0 for this type; callers should pre-compute the discount.
        discountAmount = 0;
        break;
      }

      default:
        discountAmount = 0;
    }

    // Discount cannot exceed the total of subtotal + shipping
    const maxDiscount = subtotal.amount + shipping.amount;
    discountAmount = Math.min(discountAmount, maxDiscount);

    return Money.create(Math.max(0, discountAmount), subtotal.currency);
  }

  /**
   * Calculate the discount amount to apply given a Campaign aggregate.
   *
   * Delegates to the Campaign aggregate's calculateDiscount method.
   *
   * @param subtotal - The order subtotal before discounts
   * @param shipping - The shipping cost
   * @param campaign - The Campaign aggregate to apply, or undefined for no discount
   * @returns The discount amount (never exceeds subtotal + shipping)
   */
  applyDDDCampaignDiscount(params: {
    subtotal: Money;
    shipping: Money;
    campaign?: Campaign;
  }): Money {
    const { subtotal, shipping, campaign } = params;

    if (!campaign) {
      return Money.create(0, subtotal.currency);
    }

    // Use the Campaign aggregate's calculateDiscount method
    return campaign.calculateDiscount(subtotal, shipping);
  }

  /**
   * Calculate the final order total.
   *
   * total = subtotal + shipping + tax - discount (minimum 0)
   */
  calculateTotal(params: {
    subtotal: Money;
    shipping: Money;
    tax: Money;
    discount: Money;
  }): Money {
    const { subtotal, shipping, tax, discount } = params;
    const total =
      subtotal.amount + shipping.amount + tax.amount - discount.amount;
    return Money.create(Math.max(0, total), subtotal.currency);
  }

  /**
   * Calculate shipping cost using a ShippingMethod entity.
   *
   * @param shippingMethod - The ShippingMethod to use for calculation
   * @param params - Order details for cost calculation
   * @returns The calculated shipping cost
   */
  calculateShippingCost(
    shippingMethod: ShippingMethod,
    params: {
      orderSubtotal: Money;
      destinationCounty?: string;
      isExpress?: boolean;
    },
  ): Money {
    return shippingMethod.calculateCost({
      orderSubtotal: params.orderSubtotal,
      destinationCounty: params.destinationCounty,
      isExpress: params.isExpress,
      currency: params.orderSubtotal.currency,
    });
  }
}
