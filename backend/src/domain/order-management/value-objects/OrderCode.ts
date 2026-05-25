import { ValueObject } from '../../shared/ValueObject.js';

interface OrderCodeProps {
  value: string;
}

/**
 * Value object representing a human-readable order code.
 *
 * Format: ORD-{6-digit-timestamp-suffix}-{3-digit-random}
 * Example: ORD-123456-789
 *
 * Invariants:
 * - Must match the pattern /^ORD-\d{6}-\d{3}$/
 */
export class OrderCode extends ValueObject<OrderCodeProps> {
  /** Regex that all valid order codes must satisfy. */
  static readonly FORMAT = /^ORD-\d{6}-\d{3}$/;

  private constructor(props: OrderCodeProps) {
    super(props);
  }

  /**
   * Create an OrderCode from an existing string value (e.g. loaded from DB).
   * @throws {Error} if the value does not match the expected format
   */
  static create(value: string): OrderCode {
    if (!value || typeof value !== 'string') {
      throw new Error('OrderCode value must be a non-empty string');
    }
    const trimmed = value.trim();
    if (!OrderCode.FORMAT.test(trimmed)) {
      throw new Error(
        `Invalid OrderCode format: "${trimmed}". Expected pattern: ORD-XXXXXX-XXX`,
      );
    }
    return new OrderCode({ value: trimmed });
  }

  /**
   * Generate a new unique OrderCode.
   * Uses the last 6 digits of the current timestamp and a 3-digit random suffix.
   */
  static generate(): OrderCode {
    const timestampSuffix = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return new OrderCode({ value: `ORD-${timestampSuffix}-${random}` });
  }

  /** The string representation of this order code. */
  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
