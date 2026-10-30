import { describe, expect, it } from 'vitest';

import { calculateMobileBill } from '../src/mobile';

describe('calculateMobileBill', () => {
  it('charges the monthly subscription when there is no usage', () => {
    expect(calculateMobileBill(0, 0)).toBe(150);
  });
});
