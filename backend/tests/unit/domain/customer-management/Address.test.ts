import { describe, it, expect } from 'vitest';
import { Address } from '../../../../src/domain/customer-management/value-objects/Address.js';
import { ValidationError } from '../../../../src/domain/customer-management/errors/ValidationError.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAddress(overrides: Partial<Parameters<typeof Address.create>[0]> = {}): Address {
  return Address.create({
    fullName: 'Alice Wanjiru',
    streetLine1: '123 Moi Avenue',
    city: 'Nairobi',
    province: 'Nairobi County',
    phoneNumber: '+254712345678',
    country: 'KE',
    ...overrides,
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Address', () => {
  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a valid address with all required fields', () => {
      const address = makeAddress();
      expect(address.fullName).toBe('Alice Wanjiru');
      expect(address.streetLine1).toBe('123 Moi Avenue');
      expect(address.city).toBe('Nairobi');
      expect(address.province).toBe('Nairobi County');
      expect(address.phoneNumber).toBe('+254712345678');
      expect(address.country).toBe('KE');
    });

    it('should accept optional streetLine2', () => {
      const address = makeAddress({ streetLine2: 'Apt 4B' });
      expect(address.streetLine2).toBe('Apt 4B');
    });

    it('should accept optional postalCode', () => {
      const address = makeAddress({ postalCode: '00100' });
      expect(address.postalCode).toBe('00100');
    });

    it('should default country to KE when not provided', () => {
      const address = Address.create({
        fullName: 'Bob',
        streetLine1: '1 Main St',
        city: 'Nairobi',
        province: 'Nairobi',
        phoneNumber: '0712345678',
      });
      expect(address.country).toBe('KE');
    });

    it('should normalise country to uppercase', () => {
      const address = makeAddress({ country: 'ke' });
      expect(address.country).toBe('KE');
    });

    it('should trim whitespace from all fields', () => {
      const address = Address.create({
        fullName: '  Alice  ',
        streetLine1: '  123 Main St  ',
        city: '  Nairobi  ',
        province: '  Nairobi County  ',
        phoneNumber: '  +254712345678  ',
      });
      expect(address.fullName).toBe('Alice');
      expect(address.streetLine1).toBe('123 Main St');
      expect(address.city).toBe('Nairobi');
      expect(address.province).toBe('Nairobi County');
      expect(address.phoneNumber).toBe('+254712345678');
    });

    it('should set streetLine2 to undefined when empty string provided', () => {
      const address = makeAddress({ streetLine2: '' });
      expect(address.streetLine2).toBeUndefined();
    });

    it('should set postalCode to undefined when empty string provided', () => {
      const address = makeAddress({ postalCode: '' });
      expect(address.postalCode).toBeUndefined();
    });

    it('should throw ValidationError when fullName is missing', () => {
      expect(() => makeAddress({ fullName: '' })).toThrow(ValidationError);
    });

    it('should throw ValidationError when fullName is whitespace-only', () => {
      expect(() => makeAddress({ fullName: '   ' })).toThrow(ValidationError);
    });

    it('should throw ValidationError when streetLine1 is missing', () => {
      expect(() => makeAddress({ streetLine1: '' })).toThrow(ValidationError);
    });

    it('should throw ValidationError when city is missing', () => {
      expect(() => makeAddress({ city: '' })).toThrow(ValidationError);
    });

    it('should throw ValidationError when province is missing', () => {
      expect(() => makeAddress({ province: '' })).toThrow(ValidationError);
    });

    it('should throw ValidationError when phoneNumber is missing', () => {
      expect(() => makeAddress({ phoneNumber: '' })).toThrow(ValidationError);
    });
  });

  // ─── format() ────────────────────────────────────────────────────────────────

  describe('format', () => {
    it('should format a basic address without optional fields', () => {
      const address = makeAddress();
      const formatted = address.format();
      expect(formatted).toContain('Alice Wanjiru');
      expect(formatted).toContain('123 Moi Avenue');
      expect(formatted).toContain('Nairobi, Nairobi County');
      expect(formatted).toContain('KE');
      expect(formatted).toContain('+254712345678');
    });

    it('should include streetLine2 when provided', () => {
      const address = makeAddress({ streetLine2: 'Apt 4B' });
      const formatted = address.format();
      expect(formatted).toContain('Apt 4B');
    });

    it('should include postalCode in the city line when provided', () => {
      const address = makeAddress({ postalCode: '00100' });
      const formatted = address.format();
      expect(formatted).toContain('00100');
    });

    it('should not include postalCode in the city line when not provided', () => {
      const address = makeAddress({ postalCode: undefined });
      const formatted = address.format();
      // Should have "City, Province" without a trailing space or postal code
      expect(formatted).toContain('Nairobi, Nairobi County');
      expect(formatted).not.toMatch(/Nairobi County \d/);
    });

    it('should return the same result as toString()', () => {
      const address = makeAddress();
      expect(address.toString()).toBe(address.format());
    });

    it('should produce a multi-line string', () => {
      const address = makeAddress();
      const lines = address.format().split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ─── Equality ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('should be equal to another Address with the same fields', () => {
      const a = makeAddress();
      const b = makeAddress();
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal when city differs', () => {
      const a = makeAddress({ city: 'Nairobi' });
      const b = makeAddress({ city: 'Mombasa' });
      expect(a.equals(b)).toBe(false);
    });

    it('should not be equal when streetLine1 differs', () => {
      const a = makeAddress({ streetLine1: '123 Main St' });
      const b = makeAddress({ streetLine1: '456 Other St' });
      expect(a.equals(b)).toBe(false);
    });

    it('should not be equal to null', () => {
      const address = makeAddress();
      expect(address.equals(null)).toBe(false);
    });
  });

  // ─── Immutability ────────────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should be immutable - props should be frozen', () => {
      const address = makeAddress();
      expect(() => {
        // @ts-expect-error testing runtime immutability
        address.props.city = 'Modified';
      }).toThrow();
    });
  });
});
