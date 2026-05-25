/**
 * Raised when an attempt is made to transition an Order to an invalid state.
 *
 * Example: trying to move from FULFILLED → CREATED is not allowed.
 */
export class InvalidStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStateTransitionError';
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, InvalidStateTransitionError.prototype);
  }
}
