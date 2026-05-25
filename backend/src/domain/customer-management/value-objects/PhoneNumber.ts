import { ValueObject } from '../../shared/ValueObject.js';
import { ValidationError } from '../errors/ValidationError.js';

interface PhoneNumberProps {
  value: string;
}

/**
 * Value object representing a validated phone number.
 *
 * Accepts international and local formats. The value is stored as-is after
 * stripping leading/trailing whitespace.
 *
 * Format rules:
 * - May start with an optional '+' for international prefix
 * - Must contain 7 to 15 digits (ITU-T E.164 range)
 * - May contain spaces, hyphens, and parentheses as separators
 * - Must have at least 7 digits when separators are removed
 *
 * Examples: "+254712345678", "0712 345 678", "(020) 123-4567"
 *
 * Invariants:
 * - Must be a non-empty string matching the allowed format
 */
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  /**
   * Regex that all valid phone numbers must satisfy.
   * Allows optional leading '+', digits, spaces, hyphens, and parentheses.
   */
  static readonly FORMAT = /^\+?[\d\s\-().]{7,20}$/;

  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  /**
   * Create a PhoneNumber value object from a string.
   *
   * @throws {ValidationError} if the value is not a valid phone number
   */
  static create(value: string): PhoneNumber {
    if (!value || typeof value !== 'string') {
      throw new ValidationError('PhoneNumber must be a non-empty string');
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new ValidationError('PhoneNumber must be a non-empty string');
    }

    if (!PhoneNumber.FORMAT.test(trimmed)) {
      throw new ValidationError(
        `Invalid phone number format: "${trimmed}". ` +
          'Phone numbers may contain digits, spaces, hyphens, parentheses, and an optional leading "+".',
      );
    }

    // Count digits only — must be between 7 and 15
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      throw new ValidationError(
        `Phone number must contain at least 7 digits, got ${digitsOnly.length}: "${trimmed}"`,
      );
    }
    if (digitsOnly.length > 15) {
      throw new ValidationError(
        `Phone number must contain at most 15 digits (E.164), got ${digitsOnly.length}: "${trimmed}"`,
      );
    }

    return new PhoneNumber({ value: trimmed });
  }

  /** The phone number string as provided (trimmed). */
  get value(): string {
    return this.props.value;
  }

  /** Returns only the digit characters from the phone number. */
  get digits(): string {
    return this.props.value.replace(/\D/g, '');
  }

  toString(): string {
    return this.props.value;
  }
}
