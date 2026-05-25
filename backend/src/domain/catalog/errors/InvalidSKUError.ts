/**
 * Raised when a ProductSKU is created with an invalid format.
 *
 * Example: empty string, special characters, or exceeding length limits.
 */
export class InvalidSKUError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSKUError';
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, InvalidSKUError.prototype);
  }
}
