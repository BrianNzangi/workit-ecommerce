/**
 * Raised when an invalid operation is attempted on a Money value object.
 *
 * Examples:
 * - Creating Money with a negative amount
 * - Adding Money values with different currencies
 * - Multiplying by a negative factor
 */
export class InvalidMoneyOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMoneyOperationError';
    Object.setPrototypeOf(this, InvalidMoneyOperationError.prototype);
  }
}
