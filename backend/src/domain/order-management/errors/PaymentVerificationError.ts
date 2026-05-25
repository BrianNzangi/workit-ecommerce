/**
 * Raised when payment verification fails for business-rule reasons.
 *
 * Examples:
 * - Payment amount does not match order total
 * - Payment currency does not match order currency
 * - Payment metadata references a different order
 * - External payment provider returns a failure status
 */
export class PaymentVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentVerificationError';
    Object.setPrototypeOf(this, PaymentVerificationError.prototype);
  }
}
