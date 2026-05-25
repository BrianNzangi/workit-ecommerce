import { describe, it, expect } from 'vitest';
import { Money } from '../../../../src/domain/order-management/value-objects/Money.js';
import { InvalidMoneyOperationError } from '../../../../src/domain/order-management/errors/InvalidMoneyOperationError.js';

describe('Money', () => {
  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a Money value object with valid amount and currency', () => {
      const money = Money.create(1500, 'KES');
      expect(money.amount).toBe(1500);
      expect(money.currency).toBe('KES');
    });

    it('should default to KES currency when not specified', () => {
      const money = Money.create(100);
      expect(money.currency).toBe('KES');
    });

    it('should create a zero-amount Money', () => {
      const money = Money.create(0, 'USD');
      expect(money.amount).toBe(0);
      expect(money.isZero()).toBe(true);
    });

    it('should normalise currency to uppercase', () => {
      const money = Money.create(100, 'kes');
      expect(money.currency).toBe('KES');
    });

    it('should trim whitespace from currency', () => {
      const money = Money.create(100, '  USD  ');
      expect(money.currency).toBe('USD');
    });

    it('should throw InvalidMoneyOperationError for negative amounts', () => {
      expect(() => Money.create(-1, 'KES')).toThrow(InvalidMoneyOperationError);
    });

    it('should throw InvalidMoneyOperationError for NaN amount', () => {
      expect(() => Money.create(NaN, 'KES')).toThrow(InvalidMoneyOperationError);
    });

    it('should throw InvalidMoneyOperationError for Infinity amount', () => {
      expect(() => Money.create(Infinity, 'KES')).toThrow(InvalidMoneyOperationError);
    });

    it('should throw InvalidMoneyOperationError for empty currency', () => {
      expect(() => Money.create(100, '')).toThrow(InvalidMoneyOperationError);
    });

    it('should throw InvalidMoneyOperationError for whitespace-only currency', () => {
      expect(() => Money.create(100, '   ')).toThrow(InvalidMoneyOperationError);
    });
  });

  // ─── Equality ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('should be equal to another Money with the same amount and currency', () => {
      const a = Money.create(1500, 'KES');
      const b = Money.create(1500, 'KES');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal when amounts differ', () => {
      const a = Money.create(1500, 'KES');
      const b = Money.create(2000, 'KES');
      expect(a.equals(b)).toBe(false);
    });

    it('should not be equal when currencies differ', () => {
      const a = Money.create(1500, 'KES');
      const b = Money.create(1500, 'USD');
      expect(a.equals(b)).toBe(false);
    });

    it('should not be equal to null', () => {
      const a = Money.create(1500, 'KES');
      expect(a.equals(null)).toBe(false);
    });
  });

  // ─── Arithmetic ──────────────────────────────────────────────────────────────

  describe('add', () => {
    it('should add two Money values with the same currency', () => {
      const a = Money.create(1000, 'KES');
      const b = Money.create(500, 'KES');
      const result = a.add(b);
      expect(result.amount).toBe(1500);
      expect(result.currency).toBe('KES');
    });

    it('should return a new Money instance (immutability)', () => {
      const a = Money.create(1000, 'KES');
      const b = Money.create(500, 'KES');
      const result = a.add(b);
      expect(result).not.toBe(a);
      expect(a.amount).toBe(1000); // original unchanged
    });

    it('should throw InvalidMoneyOperationError when currencies differ', () => {
      const a = Money.create(1000, 'KES');
      const b = Money.create(500, 'USD');
      expect(() => a.add(b)).toThrow(InvalidMoneyOperationError);
    });
  });

  describe('subtract', () => {
    it('should subtract two Money values with the same currency', () => {
      const a = Money.create(1500, 'KES');
      const b = Money.create(500, 'KES');
      const result = a.subtract(b);
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe('KES');
    });

    it('should clamp result to 0 when subtracting more than available', () => {
      const a = Money.create(100, 'KES');
      const b = Money.create(500, 'KES');
      const result = a.subtract(b);
      expect(result.amount).toBe(0);
    });

    it('should throw InvalidMoneyOperationError when currencies differ', () => {
      const a = Money.create(1000, 'KES');
      const b = Money.create(500, 'USD');
      expect(() => a.subtract(b)).toThrow(InvalidMoneyOperationError);
    });
  });

  describe('multiply', () => {
    it('should multiply by a positive factor', () => {
      const money = Money.create(100, 'KES');
      const result = money.multiply(3);
      expect(result.amount).toBe(300);
      expect(result.currency).toBe('KES');
    });

    it('should multiply by a fractional factor', () => {
      const money = Money.create(200, 'KES');
      const result = money.multiply(0.5);
      expect(result.amount).toBe(100);
    });

    it('should multiply by zero to get zero', () => {
      const money = Money.create(500, 'KES');
      const result = money.multiply(0);
      expect(result.amount).toBe(0);
    });

    it('should throw InvalidMoneyOperationError for negative factor', () => {
      const money = Money.create(100, 'KES');
      expect(() => money.multiply(-1)).toThrow(InvalidMoneyOperationError);
    });

    it('should throw InvalidMoneyOperationError for NaN factor', () => {
      const money = Money.create(100, 'KES');
      expect(() => money.multiply(NaN)).toThrow(InvalidMoneyOperationError);
    });
  });

  // ─── Comparison ──────────────────────────────────────────────────────────────

  describe('isGreaterThan', () => {
    it('should return true when this amount is greater', () => {
      const a = Money.create(1500, 'KES');
      const b = Money.create(1000, 'KES');
      expect(a.isGreaterThan(b)).toBe(true);
    });

    it('should return false when this amount is equal', () => {
      const a = Money.create(1000, 'KES');
      const b = Money.create(1000, 'KES');
      expect(a.isGreaterThan(b)).toBe(false);
    });

    it('should return false when this amount is less', () => {
      const a = Money.create(500, 'KES');
      const b = Money.create(1000, 'KES');
      expect(a.isGreaterThan(b)).toBe(false);
    });

    it('should throw when currencies differ', () => {
      const a = Money.create(1500, 'KES');
      const b = Money.create(1000, 'USD');
      expect(() => a.isGreaterThan(b)).toThrow(InvalidMoneyOperationError);
    });
  });

  describe('isLessThan', () => {
    it('should return true when this amount is less', () => {
      const a = Money.create(500, 'KES');
      const b = Money.create(1000, 'KES');
      expect(a.isLessThan(b)).toBe(true);
    });

    it('should return false when this amount is equal', () => {
      const a = Money.create(1000, 'KES');
      const b = Money.create(1000, 'KES');
      expect(a.isLessThan(b)).toBe(false);
    });
  });

  // ─── Immutability ────────────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should be immutable - props should be frozen', () => {
      const money = Money.create(1000, 'KES');
      expect(() => {
        // @ts-expect-error testing runtime immutability
        money.props.amount = 9999;
      }).toThrow();
    });
  });

  // ─── toString ────────────────────────────────────────────────────────────────

  describe('toString', () => {
    it('should return a formatted string', () => {
      const money = Money.create(1500, 'KES');
      expect(money.toString()).toBe('KES 1500.00');
    });
  });
});
