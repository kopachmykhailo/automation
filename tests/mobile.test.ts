import { describe, expect, it } from 'vitest';

import { calculateMobileBill } from '../src/mobile';

describe('calculateMobileBill', () => {
  it('charges the monthly subscription when there is no usage', () => {
    expect(calculateMobileBill(0, 0)).toBe(150);
  });

  it('charges for the first domestic minute after the included allowance', () => {
    expect(calculateMobileBill(101, 0)).toBe(150.5);
  });

  it.each([
    [100, 150],
    [101, 150.5],
    [102, 151],
  ])('calculates the domestic threshold at %i minutes', (minutes, expected) => {
    expect(calculateMobileBill(minutes, 0)).toBe(expected);
  });
});
