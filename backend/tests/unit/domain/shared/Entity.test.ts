import { describe, it, expect } from 'vitest';
import { Entity } from '../../../../src/domain/shared/Entity.js';

class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

describe('Entity', () => {
  it('should return the id', () => {
    const entity = new TestEntity('abc-123');
    expect(entity.id).toBe('abc-123');
  });

  it('should be equal to itself', () => {
    const entity = new TestEntity('abc-123');
    expect(entity.equals(entity)).toBe(true);
  });

  it('should be equal to another entity with the same id', () => {
    const a = new TestEntity('abc-123');
    const b = new TestEntity('abc-123');
    expect(a.equals(b)).toBe(true);
  });

  it('should not be equal to an entity with a different id', () => {
    const a = new TestEntity('abc-123');
    const b = new TestEntity('xyz-456');
    expect(a.equals(b)).toBe(false);
  });

  it('should not be equal to null', () => {
    const entity = new TestEntity('abc-123');
    expect(entity.equals(null)).toBe(false);
  });

  it('should not be equal to undefined', () => {
    const entity = new TestEntity('abc-123');
    expect(entity.equals(undefined)).toBe(false);
  });

  it('should support numeric ids', () => {
    class NumericEntity extends Entity<number> {
      constructor(id: number) { super(id); }
    }
    const a = new NumericEntity(1);
    const b = new NumericEntity(1);
    const c = new NumericEntity(2);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
