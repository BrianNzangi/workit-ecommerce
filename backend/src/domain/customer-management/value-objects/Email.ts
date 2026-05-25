import { ValueObject } from '../../shared/ValueObject.js';
import { ValidationError } from '../errors/ValidationError.js';

interface EmailProps {
  value: string;
}

/**
 * Value object representing a validated email address.
 *
 * The value is normalised to lowercase before validation.
 *
 * Format rules:
 * - Must contain exactly one '@' character
 * - Local part (before '@') must be non-empty
 * - Domain part (after '@') must contain at least one '.' and non-empty segments
 * - Overall length must be between 3 and 254 characters (RFC 5321)
 *
 * Examples: "alice@example.com", "bob.smith+tag@company.co.uk"
 *
 * Invariants:
 * - Must be a non-empty string matching the allowed format
 */
export class Email extends ValueObject<EmailProps> {
  /**
   * Regex for basic email format validation.
   * Covers the vast majority of real-world email addresses.
   */
  static readonly FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  /**
   * Create an Email value object from a string.
   * The value is normalised to lowercase before validation.
   *
   * @throws {ValidationError} if the value is not a valid email address
   */
  static create(value: string): Email {
    if (!value || typeof value !== 'string') {
      throw new ValidationError('Email must be a non-empty string');
    }

    const normalised = value.trim().toLowerCase();

    if (normalised.length < 3) {
      throw new ValidationError(
        `Email is too short: "${normalised}"`,
      );
    }

    if (normalised.length > 254) {
      throw new ValidationError(
        `Email exceeds maximum length of 254 characters`,
      );
    }

    if (!Email.FORMAT.test(normalised)) {
      throw new ValidationError(
        `Invalid email format: "${normalised}". ` +
          'Email must contain a local part, "@", and a domain with at least one ".".',
      );
    }

    return new Email({ value: normalised });
  }

  /** The normalised (lowercase) email address string. */
  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
