import { describe, it, expect } from 'vitest';
import { OrderCode } from '../../../../src/domain/order-management/value-objects/OrderCode.js';

describe('OrderCode', () => {
  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create an OrderCode from a valid string', () => {
      const code = OrderCode.create('ORD-123456-789');
      expect(code.value).toBe('ORD-123456-789');
    });

    it('should trim whitespace from the value', () => {
      const code = OrderCode.create('  ORD-123456-789  ');
      expect(code.value).toBe('ORD-123456-789');
    });

    it('should throw for an invalid format', () => {
      expect(() => OrderCode.create('INVALID')).toThrow();
    });

    it('should throw for a code missing the ORD prefix', () => {
      expect(() => OrderCode.create('123456-789')).toThrow();
    });

    it('should throw for a code with wrong digit counts', () => {
      expect(() => OrderCode.create('ORD-12345-789')).toThrow();   // 5 digits instead of 6
      expect(() => OrderCode.create('ORD-123456-78')).toThrow();   // 2 digits instead of 3
    });

    it('should throw for an empty string', () => {
      expect(() => OrderCode.create('')).toThrow();
    });

    it('should throw for a non-string value', () => {
      // @ts-expect-error testing runtime validation
      expect(() => OrderCode.create(null)).toThrow();
    });
  });

  // ─── generate ────────────────────────────────────────────────────────────────

  describe('generate', () => {
    it('should generate a valid OrderCode', () => {
      const code = OrderCode.generate();
      expect(OrderCode.FORMAT.test(code.value)).toBe(true);
    });

    it('should generate unique codes on successive calls', () => {
      const codes = new Set(Array.from({ length: 20 }, () => OrderCode.generate().value));
      // With random suffix, collisions are extremely unlikely in 20 calls
      expect(codes.size).toBeGreaterThan(1);
    });

    it('should generate codes that can be round-tripped through create', () => {
      const generated = OrderCode.generate();
      const recreated = OrderCode.create(generated.value);
      expect(recreated.value).toBe(generated.value);
    });
  });

  // ─── Equality ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('should be equal to another OrderCode with the same value', () => {
      const a = OrderCode.create('ORD-123456-789');
      const b = OrderCode.create('ORD-123456-789');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal to an OrderCode with a different value', () => {
      const a = OrderCode.create('ORD-123456-789');
      const b = OrderCode.create('ORD-654321-001');
      expect(a.equals(b)).toBe(false);
    });

    it('should not be equal to null', () => {
      const a = OrderCode.create('ORD-123456-789');
      expect(a.equals(null)).toBe(false);
    });
  });

  // ─── toString ────────────────────────────────────────────────────────────────

  describe('toString', () => {
    it('should return the string value', () => {
      const code = OrderCode.create('ORD-123456-789');
      expect(code.toString()).toBe('ORD-123456-789');
    });
  });

  // ─── FORMAT regex ────────────────────────────────────────────────────────────

  describe('FORMAT', () => {
    it('should match valid codes', () => {
      expect(OrderCode.FORMAT.test('ORD-000000-000')).toBe(true);
      expect(OrderCode.FORMAT.test('ORD-999999-999')).toBe(true);
    });

    it('should not match invalid codes', () => {
      expect(OrderCode.FORMAT.test('ORD-12345-789')).toBe(false);
      expect(OrderCode.FORMAT.test('ord-123456-789')).toBe(false);
      expect(OrderCode.FORMAT.test('ORD-123456-7890')).toBe(false);
      expect(OrderCode.FORMAT.test('')).toBe(false);
    });
  });
});
