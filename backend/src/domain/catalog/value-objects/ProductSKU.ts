import { ValueObject } from '../../shared/ValueObject.js';
import { InvalidSKUError } from '../errors/InvalidSKUError.js';

interface ProductSKUProps {
  value: string;
}

/**
 * Value object representing a product Stock Keeping Unit (SKU).
 *
 * A SKU is a unique identifier for a product variant used for inventory tracking.
 *
 * Format rules:
 * - Must be 2–100 characters long
 * - May contain uppercase letters, digits, hyphens, and underscores
 * - Must start with a letter or digit
 *
 * Examples: "SHOE-RED-42", "LAPTOP_PRO_16", "ABC123"
 *
 * Invariants:
 * - Must be a non-empty string matching the allowed format
 */
export class ProductSKU extends ValueObject<ProductSKUProps> {
  /** Regex that all valid SKUs must satisfy. */
  static readonly FORMAT = /^[A-Z0-9][A-Z0-9\-_]{1,99}$/;

  private constructor(props: ProductSKUProps) {
    super(props);
  }

  /**
   * Create a ProductSKU from a string value.
   * The value is normalised to uppercase before validation.
   *
   * @throws {InvalidSKUError} if the value does not match the expected format
   */
  static create(value: string): ProductSKU {
    if (!value || typeof value !== 'string') {
      throw new InvalidSKUError('ProductSKU value must be a non-empty string');
    }

    const normalised = value.trim().toUpperCase();

    if (normalised.length < 2) {
      throw new InvalidSKUError(
        `ProductSKU must be at least 2 characters long, got: "${normalised}"`,
      );
    }

    if (normalised.length > 100) {
      throw new InvalidSKUError(
        `ProductSKU must be at most 100 characters long, got length: ${normalised.length}`,
      );
    }

    if (!ProductSKU.FORMAT.test(normalised)) {
      throw new InvalidSKUError(
        `Invalid ProductSKU format: "${normalised}". ` +
          'SKUs may only contain uppercase letters, digits, hyphens, and underscores, ' +
          'and must start with a letter or digit.',
      );
    }

    return new ProductSKU({ value: normalised });
  }

  /** The normalised string representation of this SKU. */
  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
