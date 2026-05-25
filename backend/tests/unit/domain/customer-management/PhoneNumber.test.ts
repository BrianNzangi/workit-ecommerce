import { describe, it, expect } from 'vitest';
import { PhoneNumber } from '../../../../src/domain/customer-management/value-objects/PhoneNumber.js';
import { ValidationError } from '../../../../src/domain/customer-management/errors/ValidationError.js';

describe('PhoneNumber', () => {
  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a valid international phone number', () => {
      const phone = PhoneNumber.create('+254712345678');
      expect(phone.value).toBe('+254712345678');
    });

    it('should create a valid local phone number', () => {
      const phone = PhoneNumber.create('0712345678');
      expect(phone.value).toBe('0712345678');
    });

    it('should accept phone numbers with spaces', () => {
      const phone = PhoneNumber.create('+254 712 345 678');
      expect(phone.value).toBe('+254 712 345 678');
    });

    it('should accept phone numbers with hyphens', () => {
      const phone = PhoneNumber.create('+254-712-345-678');
      expect(phone.value).toBe('+254-712-345-678');
    });

    it('should accept phone numbers with parentheses', () => {
      const phone = PhoneNumber.create('(020) 123-4567');
      expect(phone.value).toBe('(020) 123-4567');
    });

    it('should trim leading and trailing whitespace', () => {
      const phone = PhoneNumber.create('  +254712345678  ');
      expect(phone.value).toBe('+254712345678');
    });

    it('should accept a 7-digit number (minimum)', () => {
      const phone = PhoneNumber.create('1234567');
      expect(phone.value).toBe('1234567');
    });

    it('should throw ValidationError for empty string', () => {
      expect(() => PhoneNumber.create('')).toThrow(ValidationError);
    });

    it('should throw ValidationError for whitespace-only string', () => {
      expect(() => PhoneNumber.create('   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError for fewer than 7 digits', () => {
      expect(() => PhoneNumber.create('12345')).toThrow(ValidationError);
    });

    it('should throw ValidationError for more than 15 digits', () => {
      expect(() => PhoneNumber.create('1234567890123456')).toThrow(ValidationError);
    });

    it('should throw ValidationError for letters in the number', () => {
      expect(() => PhoneNumber.create('abc1234567')).toThrow(ValidationError);
    });

    it('should throw ValidationError for special characters', () => {
      expect(() => PhoneNumber.create('+254@12345678')).toThrow(ValidationError);
    });
  });

  // ─── digits getter ───────────────────────────────────────────────────────────

  describe('digits', () => {
    it('should return only the digit characters', () => {
      const phone = PhoneNumber.create('+254 712 345 678');
      expect(phone.digits).toBe('254712345678');
    });

    it('should strip parentheses and hyphens', () => {
      const phone = PhoneNumber.create('(020) 123-4567');
      expect(phone.digits).toBe('0201234567');
    });
  });

  // ─── Equality ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('should be equal to another PhoneNumber with the same value', () => {
      const a = PhoneNumber.create('+254712345678');
      const b = PhoneNumber.create('+254712345678');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal to a different phone number', () => {
      const a = PhoneNumber.create('+254712345678');
      const b = PhoneNumber.create('+254700000000');
      expect(a.equals(b)).toBe(false);
    });

    it('should not be equal to null', () => {
      const phone = PhoneNumber.create('+254712345678');
      expect(phone.equals(null)).toBe(false);
    });
  });

  // ─── Immutability ────────────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should be immutable - props should be frozen', () => {
      const phone = PhoneNumber.create('+254712345678');
      expect(() => {
        // @ts-expect-error testing runtime immutability
        phone.props.value = '+000000000000';
      }).toThrow();
    });
  });

  // ─── toString ────────────────────────────────────────────────────────────────

  describe('toString', () => {
    it('should return the phone number value as a string', () => {
      const phone = PhoneNumber.create('+254712345678');
      expect(phone.toString()).toBe('+254712345678');
    });
  });
});
