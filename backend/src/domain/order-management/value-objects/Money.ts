import { ValueObject } from '../../shared/ValueObject.js';
import { InvalidMoneyOperationError } from '../errors/InvalidMoneyOperationError.js';

interface MoneyProps {
  /** Amount in minor units (e.g. cents/fils). Must be non-negative. */
  amount: number;
  /** ISO 4217 currency code, e.g. "KES", "USD". */
  currency: string;
}

/**
 * Value object representing a monetary amount with a currency.
 *
 * Amounts are stored as plain numbers (not minor units) to match the existing
 * database schema which stores prices as doubles/integers in the major unit
 * (e.g. KES 1500 is stored as 1500, not 150000).
 *
 * Invariants:
 * - amount must be >= 0
 * - currency must be a non-empty string
 * - arithmetic operations require matching currencies
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  /**
   * Create a Money value object.
   * @throws {InvalidMoneyOperationError} if amount is negative or currency is empty
   */
  static create(amount: number, currency = 'KES'): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new InvalidMoneyOperationError(
        `Money amount must be a non-negative finite number, got: ${amount}`,
      );
    }
    if (!currency || typeof currency !== 'string' || currency.trim().length === 0) {
      throw new InvalidMoneyOperationError('Money currency must be a non-empty string');
    }
    return new Money({ amount, currency: currency.trim().toUpperCase() });
  }

  /** The monetary amount. */
  get amount(): number {
    return this.props.amount;
  }

  /** The ISO 4217 currency code. */
  get currency(): string {
    return this.props.currency;
  }

  /**
   * Add another Money value to this one.
   * @throws {InvalidMoneyOperationError} if currencies differ
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract another Money value from this one.
   * Result is clamped to 0 to prevent negative amounts.
   * @throws {InvalidMoneyOperationError} if currencies differ
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(Math.max(0, this.amount - other.amount), this.currency);
  }

  /**
   * Multiply this Money value by a scalar factor.
   * @throws {InvalidMoneyOperationError} if factor is negative
   */
  multiply(factor: number): Money {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new InvalidMoneyOperationError(
        `Multiplication factor must be a non-negative finite number, got: ${factor}`,
      );
    }
    return Money.create(this.amount * factor, this.currency);
  }

  /** Returns true if this amount is zero. */
  isZero(): boolean {
    return this.amount === 0;
  }

  /** Returns true if this amount is greater than the other. */
  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  /** Returns true if this amount is less than the other. */
  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new InvalidMoneyOperationError(
        `Currency mismatch: cannot operate on ${this.currency} and ${other.currency}`,
      );
    }
  }
}
