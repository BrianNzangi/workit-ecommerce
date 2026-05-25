/**
 * Raised when a stock reservation is attempted but there is not enough
 * stock on hand to fulfil the requested quantity.
 *
 * Example: reserving 5 units when only 3 are available.
 */
export class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientStockError';
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, InsufficientStockError.prototype);
  }
}
