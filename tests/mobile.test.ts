import { describe, expect, it } from 'vitest';

import { calculateMobileBill } from '../src/mobile';

describe('calculateMobileBill', () => {
  it('charges the monthly subscription when there is no usage', () => {
    expect(calculateMobileBill(0, 0)).toBe(150);
  });

  it.each([
    [100, 150],
    [101, 150.5],
    [102, 151],
  ])('calculates the domestic threshold at %i minutes', (minutes, expected) => {
    expect(calculateMobileBill(minutes, 0)).toBe(expected);
  });

  it.each([
    [0, 1, 153],
    [0, 2, 156],
    [101, 2, 156.5],
  ])(
    'calculates %i domestic and %i international minutes',
    (domesticMinutes, internationalMinutes, expected) => {
      expect(calculateMobileBill(domesticMinutes, internationalMinutes)).toBe(
        expected,
      );
    },
  );

  it.each([
    [-1, 0],
    [0, -1],
  ])('rejects negative usage (%i, %i)', (domesticMinutes, internationalMinutes) => {
    expect(() =>
      calculateMobileBill(domesticMinutes, internationalMinutes),
    ).toThrow('INVALID_DURATION');
  });
});
