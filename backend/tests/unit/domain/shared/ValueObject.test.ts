import { describe, it, expect } from 'vitest';
import { ValueObject } from '../../../../src/domain/shared/ValueObject.js';

interface ColorProps {
  r: number;
  g: number;
  b: number;
}

class Color extends ValueObject<ColorProps> {
  constructor(props: ColorProps) {
    super(props);
  }

  get r() { return this.props.r; }
  get g() { return this.props.g; }
  get b() { return this.props.b; }
}

describe('ValueObject', () => {
  it('should be equal to another value object with the same props', () => {
    const a = new Color({ r: 255, g: 0, b: 0 });
    const b = new Color({ r: 255, g: 0, b: 0 });
    expect(a.equals(b)).toBe(true);
  });

  it('should not be equal to a value object with different props', () => {
    const a = new Color({ r: 255, g: 0, b: 0 });
    const b = new Color({ r: 0, g: 255, b: 0 });
    expect(a.equals(b)).toBe(false);
  });

  it('should not be equal to null', () => {
    const a = new Color({ r: 255, g: 0, b: 0 });
    expect(a.equals(null)).toBe(false);
  });

  it('should not be equal to undefined', () => {
    const a = new Color({ r: 255, g: 0, b: 0 });
    expect(a.equals(undefined)).toBe(false);
  });

  it('should be immutable - props should be frozen', () => {
    const color = new Color({ r: 255, g: 0, b: 0 });
    expect(() => {
      // @ts-expect-error testing immutability at runtime
      color.props.r = 100;
    }).toThrow();
  });

  it('should expose props as readonly', () => {
    const color = new Color({ r: 100, g: 150, b: 200 });
    expect(color.r).toBe(100);
    expect(color.g).toBe(150);
    expect(color.b).toBe(200);
  });
});
