import { describe, it, expect } from 'vitest';
import { ProductSKU } from '../../../../src/domain/catalog/value-objects/ProductSKU.js';
import { InvalidSKUError } from '../../../../src/domain/catalog/errors/InvalidSKUError.js';

describe('ProductSKU', () => {
  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a valid SKU from an uppercase alphanumeric string', () => {
      const sku = ProductSKU.create('SHOE123');
      expect(sku.value).toBe('SHOE123');
    });

    it('should normalise lowercase input to uppercase', () => {
      const sku = ProductSKU.create('shoe-red-42');
      expect(sku.value).toBe('SHOE-RED-42');
    });

    it('should trim whitespace before validation', () => {
      const sku = ProductSKU.create('  ABC-123  ');
      expect(sku.value).toBe('ABC-123');
    });

    it('should accept SKUs with hyphens', () => {
      const sku = ProductSKU.create('LAPTOP-PRO-16');
      expect(sku.value).toBe('LAPTOP-PRO-16');
    });

    it('should accept SKUs with underscores', () => {
      const sku = ProductSKU.create('LAPTOP_PRO_16');
      expect(sku.value).toBe('LAPTOP_PRO_16');
    });

    it('should accept a 2-character SKU (minimum length)', () => {
      const sku = ProductSKU.create('AB');
      expect(sku.value).toBe('AB');
    });

    it('should accept a 100-character SKU (maximum length)', () => {
      const longSku = 'A' + 'B'.repeat(99);
      const sku = ProductSKU.create(longSku);
      expect(sku.value).toBe(longSku);
    });

    it('should accept SKUs starting with a digit', () => {
      const sku = ProductSKU.create('1ABC');
      expect(sku.value).toBe('1ABC');
    });

    it('should throw InvalidSKUError for an empty string', () => {
      expect(() => ProductSKU.create('')).toThrow(InvalidSKUError);
    });

    it('should throw InvalidSKUError for a whitespace-only string', () => {
      expect(() => ProductSKU.create('   ')).toThrow(InvalidSKUError);
    });

    it('should throw InvalidSKUError for a single character (below minimum length)', () => {
      expect(() => ProductSKU.create('A')).toThrow(InvalidSKUError);
    });

    it('should throw InvalidSKUError for a SKU exceeding 100 characters', () => {
      const tooLong = 'A'.repeat(101);
      expect(() => ProductSKU.create(tooLong)).toThrow(InvalidSKUError);
    });

    it('should throw InvalidSKUError for SKUs with spaces', () => {
      expect(() => ProductSKU.create('SKU 123')).toThrow(InvalidSKUError);
    });

    it('should throw InvalidSKUError for SKUs with special characters', () => {
      expect(() => ProductSKU.create('SKU@123')).toThrow(InvalidSKUError);
      expect(() => ProductSKU.create('SKU.123')).toThrow(InvalidSKUError);
      expect(() => ProductSKU.create('SKU/123')).toThrow(InvalidSKUError);
    });

    it('should throw InvalidSKUError for SKUs starting with a hyphen', () => {
      expect(() => ProductSKU.create('-SKU123')).toThrow(InvalidSKUError);
    });

    it('should throw InvalidSKUError for SKUs starting with an underscore', () => {
      expect(() => ProductSKU.create('_SKU123')).toThrow(InvalidSKUError);
    });
  });

  // ─── Equality ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('should be equal to another SKU with the same value', () => {
      const a = ProductSKU.create('SHOE-RED-42');
      const b = ProductSKU.create('SHOE-RED-42');
      expect(a.equals(b)).toBe(true);
    });

    it('should be equal regardless of input case (both normalised to uppercase)', () => {
      const a = ProductSKU.create('shoe-red-42');
      const b = ProductSKU.create('SHOE-RED-42');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal to a SKU with a different value', () => {
      const a = ProductSKU.create('SHOE-RED-42');
      const b = ProductSKU.create('SHOE-BLUE-42');
      expect(a.equals(b)).toBe(false);
    });

    it('should not be equal to null', () => {
      const sku = ProductSKU.create('SHOE-RED-42');
      expect(sku.equals(null)).toBe(false);
    });

    it('should not be equal to undefined', () => {
      const sku = ProductSKU.create('SHOE-RED-42');
      expect(sku.equals(undefined)).toBe(false);
    });
  });

  // ─── Immutability ────────────────────────────────────────────────────────────

  describe('immutability', () => {
    it('should be immutable - props should be frozen', () => {
      const sku = ProductSKU.create('SHOE-RED-42');
      expect(() => {
        // @ts-expect-error testing runtime immutability
        sku.props.value = 'MODIFIED';
      }).toThrow();
    });
  });

  // ─── toString ────────────────────────────────────────────────────────────────

  describe('toString', () => {
    it('should return the SKU value as a string', () => {
      const sku = ProductSKU.create('SHOE-RED-42');
      expect(sku.toString()).toBe('SHOE-RED-42');
    });
  });
});
