/**
 * Raised when a value object or entity fails validation.
 *
 * Examples:
 * - Creating an Address with a missing required field
 * - Creating an Email with an invalid format
 * - Creating a PhoneNumber with an invalid format
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
