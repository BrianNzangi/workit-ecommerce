import { describe, it, expect } from 'vitest';
import { Email } from '../../../../src/domain/customer-management/value-objects/Email.js';
import { ValidationError } from '../../../../src/domain/customer-management/errors/ValidationError.js';

describe('Email', () => {
  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('alice@example.com');
      expect(email.value).toBe('alice@example.com');
    });

    it('should normalise to lowercase', () => {
      const email = Email.create('Alice@Example.COM');
      expect(email.value).toBe('alice@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  bob@example.com  ');
      expect(email.value).toBe('bob@example.com');
    });

    it('should accept email with subdomain', () => {
      const email = Email.create('user@mail.company.co.uk');
      expect(email.value).toBe('user@mail.company.co.uk');
    });

    it('should accept email with plus tag', () => {
      const email = Email.create('user+tag@example.com');
      expect(email.value).toBe('user+tag@example.com');
    });

    it('should accept email with dots in local part', () => {
      const email = Email.create('first.last@example.com');
      expect(email.value).toBe('first.last@example.com');
    });

    it('should throw ValidationError for empty string', () => {
      expect(() => Email.create('')).toThrow(ValidationError);
    });

    it('should throw ValidationError for whitespace-only string', () => {
      expect(() => Email.create('   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing @', () => {
      expect(() => Email.create('notanemail')).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing domain', () => {
      expect(() => Email.create('user@')).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing local part', () => {
      expect(() => Email.create('@example.com')).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing dot in domain', () => {
      expect(() => Email.create('user@nodot')).toThrow(ValidationError);
    });

    it('should throw ValidationError for email with spaces', () => {
      expect(() => Email.create('user name@example.com')).toThrow(ValidationError);
    });

    it('should throw ValidationError for string exceeding 254 characters', () => {
      const longLocal = 'a'.repeat(245);
      expect(() => Email.create(`${longLocal}@example.com`)).toThrow(ValidationError);
    });
  });

  // ─── Equality ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('should be equal to another Email with the same value', () => {
      const a = Email.create('alice@example.com');
      const b = Email.create('alice@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should be equal regardless of input case (both normalised)', () => {
      const a = Email.create('Alice@Example.COM');
      const b = Email.create('alice@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal to a different email', () => {
      const a = Email.create('alice@example.com');
      const b = Email.create('bob@example.com');
      expect(a.equals(b)).toBe(false);
    });

    it('should not be equal to null', () => {
      const email = Email.create('alice@example.com');
      expect(email.equals(null)).toBe(false);
    });

    it('should not be equal to undefined', () => {
      const email = Email.create('alice@example.com');
      expect(email.equals(undefined)).toBe(false);
    });
  });

  // ─── Immutability ────────────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should be immutable - props should be frozen', () => {
      const email = Email.create('alice@example.com');
      expect(() => {
        // @ts-expect-error testing runtime immutability
        email.props.value = 'modified@example.com';
      }).toThrow();
    });
  });

  // ─── toString ────────────────────────────────────────────────────────────────

  describe('toString', () => {
    it('should return the email value as a string', () => {
      const email = Email.create('alice@example.com');
      expect(email.toString()).toBe('alice@example.com');
    });
  });
});
