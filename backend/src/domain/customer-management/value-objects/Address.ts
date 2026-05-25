import { ValueObject } from '../../shared/ValueObject.js';
import { ValidationError } from '../errors/ValidationError.js';

interface AddressProps {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
  phoneNumber: string;
}

/**
 * Value object representing a physical address used for shipping or billing.
 *
 * Required fields: fullName, streetLine1, city, province, phoneNumber, country.
 * Optional fields: streetLine2, postalCode.
 *
 * Invariants:
 * - fullName must be non-empty
 * - streetLine1 must be non-empty
 * - city must be non-empty
 * - province must be non-empty
 * - phoneNumber must be non-empty
 * - country defaults to 'KE' when not provided
 */
export class Address extends ValueObject<AddressProps> {
  private constructor(props: AddressProps) {
    super(props);
  }

  /**
   * Create an Address value object.
   *
   * @throws {ValidationError} if any required field is missing or empty
   */
  static create(params: {
    fullName: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province: string;
    postalCode?: string;
    country?: string;
    phoneNumber: string;
  }): Address {
    Address.validateRequired('fullName', params.fullName);
    Address.validateRequired('streetLine1', params.streetLine1);
    Address.validateRequired('city', params.city);
    Address.validateRequired('province', params.province);
    Address.validateRequired('phoneNumber', params.phoneNumber);

    return new Address({
      fullName: params.fullName.trim(),
      streetLine1: params.streetLine1.trim(),
      streetLine2: params.streetLine2?.trim() || undefined,
      city: params.city.trim(),
      province: params.province.trim(),
      postalCode: params.postalCode?.trim() || undefined,
      country: (params.country?.trim() || 'KE').toUpperCase(),
      phoneNumber: params.phoneNumber.trim(),
    });
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get fullName(): string {
    return this.props.fullName;
  }

  get streetLine1(): string {
    return this.props.streetLine1;
  }

  get streetLine2(): string | undefined {
    return this.props.streetLine2;
  }

  get city(): string {
    return this.props.city;
  }

  get province(): string {
    return this.props.province;
  }

  get postalCode(): string | undefined {
    return this.props.postalCode;
  }

  get country(): string {
    return this.props.country;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  // ─── Business Methods ────────────────────────────────────────────────────────

  /**
   * Returns a human-readable multi-line formatted address string.
   *
   * Example:
   * ```
   * Alice Wanjiru
   * 123 Moi Avenue, Apt 4B
   * Nairobi, Nairobi County
   * KE
   * +254712345678
   * ```
   */
  format(): string {
    const lines: string[] = [this.props.fullName, this.props.streetLine1];

    if (this.props.streetLine2) {
      lines.push(this.props.streetLine2);
    }

    const cityLine = this.props.postalCode
      ? `${this.props.city}, ${this.props.province} ${this.props.postalCode}`
      : `${this.props.city}, ${this.props.province}`;
    lines.push(cityLine);

    lines.push(this.props.country);
    lines.push(this.props.phoneNumber);

    return lines.join('\n');
  }

  toString(): string {
    return this.format();
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private static validateRequired(field: string, value: string | undefined): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError(`Address field '${field}' is required and must be non-empty`);
    }
  }
}
