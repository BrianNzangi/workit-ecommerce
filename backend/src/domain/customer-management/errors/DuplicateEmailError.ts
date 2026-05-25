/**
 * Raised when attempting to register a customer with an email address that
 * already belongs to an existing account.
 */
export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`A customer with email '${email}' already exists`);
    this.name = 'DuplicateEmailError';
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, DuplicateEmailError.prototype);
  }
}
