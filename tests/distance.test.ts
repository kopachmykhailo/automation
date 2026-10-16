
import { describe, it, expect } from 'vitest';
import { calculateDistance } from '../src/distance';

describe('calculateDistance', () => {
  it('обчислює відстань між точками (0, 0) і (3, 4)', () => {
    expect(calculateDistance(0, 0, 3, 4)).toBe(5);
  });

  it('обчислює відстань для від’ємних координат', () => {
    expect(calculateDistance(-1, -1, 2, 3)).toBe(5);
  });

  it('повертає нуль для однакових точок', () => {
    expect(calculateDistance(2, 3, 2, 3)).toBe(0);
  });

  it('обчислює відстань для точок на одній прямій', () => {
    expect(calculateDistance(1, 0, 6, 0)).toBe(5);
  });

  it('відхиляє координату NaN', () => {
    expect(() => calculateDistance(NaN, 0, 3, 4))
      .toThrow('INVALID_COORDINATE');
  });

  it('відхиляє нескінченну координату', () => {
    expect(() => calculateDistance(0, 0, Infinity, 4))
      .toThrow('INVALID_COORDINATE');
  });
});
