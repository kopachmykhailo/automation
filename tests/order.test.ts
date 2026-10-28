import { describe, expect, it } from 'vitest';
import {
  calcDiscountRate,
  calcOrderTotal,
  calcShipping,
  calcSubtotal,
  mergeItems,
  type OrderItem,
} from '../src/order';

const item = (sku: string, price: number, qty = 1): OrderItem => ({
  sku,
  price,
  qty,
});

describe('calcSubtotal', () => {
  it('підсумовує вартість позицій з урахуванням кількості', () => {
    expect(calcSubtotal([item('SKU-1', 100, 2), item('SKU-2', 50, 3)])).toBe(
      350,
    );
  });

  it('відхиляє порожнє замовлення', () => {
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER');
  });

  it('відхиляє від’ємну ціну', () => {
    expect(() => calcSubtotal([item('SKU-1', -1)])).toThrow('NEGATIVE_PRICE');
  });

  it.each([0, -1, 1.5])('відхиляє кількість %s', (qty) => {
    expect(() => calcSubtotal([item('SKU-1', 100, qty)])).toThrow(
      'INVALID_QTY',
    );
  });

  it('приймає нульову ціну для коректної кількості', () => {
    expect(calcSubtotal([item('SKU-1', 0)])).toBe(0);
  });
});

describe('calcDiscountRate', () => {
  it.each([
    { tier: 'basic' as const, subtotal: 500, expected: 0 },
    { tier: 'silver' as const, subtotal: 500, expected: 0.05 },
    { tier: 'gold' as const, subtotal: 500, expected: 0.1 },
    { tier: 'basic' as const, subtotal: 2000, expected: 0.05 },
    { tier: 'gold' as const, subtotal: 2000, expected: 0.15 },
  ])(
    'рівень $tier із сумою $subtotal дає ставку $expected',
    ({ tier, subtotal, expected }) => {
      expect(calcDiscountRate(tier, subtotal)).toBeCloseTo(expected, 4);
    },
  );

  it.each([
    { subtotal: 1999, expected: 0 },
    { subtotal: 2000, expected: 0.05 },
    { subtotal: 2001, expected: 0.05 },
  ])(
    'межа великого замовлення: $subtotal',
    ({ subtotal, expected }) => {
      expect(calcDiscountRate('basic', subtotal)).toBeCloseTo(expected, 4);
    },
  );

  it('додає промокод до ставки рівня', () => {
    expect(calcDiscountRate('silver', 500, 0.1)).toBeCloseTo(0.15, 4);
  });

  it('обмежує сумарну знижку максимальним значенням', () => {
    expect(calcDiscountRate('gold', 2000, 0.5)).toBe(0.25);
  });

  it('відхиляє від’ємний промокод', () => {
    expect(() => calcDiscountRate('basic', 500, -0.1)).toThrow(
      'INVALID_PROMO',
    );
  });
});

describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('сума %i → доставка %i', (amount, expected) => {
    expect(calcShipping(amount)).toBe(expected);
  });
});

describe('calcOrderTotal', () => {
  it('додає доставку до замовлення нижче порога', () => {
    expect(calcOrderTotal([item('SKU-1', 500)], 'basic')).toBeCloseTo(560, 2);
  });

  it('не додає доставку, якщо сума після знижки сягає порога', () => {
    expect(calcOrderTotal([item('SKU-1', 1200)], 'gold')).toBeCloseTo(1080, 2);
  });

  it('додає доставку, якщо знижка опускає суму нижче порога', () => {
    expect(calcOrderTotal([item('SKU-1', 1050)], 'gold')).toBeCloseTo(1005, 2);
  });

  it('округлює суму після знижки до копійок', () => {
    expect(calcOrderTotal([item('SKU-1', 10.01)], 'gold')).toBeCloseTo(
      69.01,
      2,
    );
  });

  it('передає виняток із нижнього рівня', () => {
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER');
  });
});

describe('mergeItems', () => {
  it('об’єднує позиції з однаковим SKU та зберігає порядок', () => {
    const items = [
      item('SKU-1', 100, 2),
      item('SKU-2', 50, 1),
      item('SKU-1', 100, 3),
    ];

    expect(mergeItems(items)).toEqual([
      item('SKU-1', 100, 5),
      item('SKU-2', 50, 1),
    ]);
  });

  it('повертає порожній список для порожнього вводу', () => {
    expect(mergeItems([])).toEqual([]);
  });

  it('не змінює вхідний список і його позиції', () => {
    const items = [item('SKU-1', 100, 1), item('SKU-1', 100, 2)];
    const originalItems = items.map((entry) => ({ ...entry }));

    mergeItems(items);

    expect(items).toEqual(originalItems);
  });

  it.each([
    [0, null],
    [1, 1],
    [2, 2],
  ] as const)(
    'перевіряє межу кількості: %i одиниць',
    (qty, expectedQty) => {
      if (expectedQty === null) {
        expect(() => mergeItems([item('SKU-1', 100, qty)])).toThrow(
          'INVALID_ITEM',
        );
        return;
      }

      expect(mergeItems([item('SKU-1', 100, qty)])).toEqual([
        item('SKU-1', 100, expectedQty),
      ]);
    },
  );

  it.each([
    item('', 100),
    item('   ', 100),
    item('SKU-1', -1),
    item('SKU-1', Number.POSITIVE_INFINITY),
    item('SKU-1', 100, -1),
    item('SKU-1', 100, 1.5),
  ])('відхиляє некоректну позицію', (invalidItem) => {
    expect(() => mergeItems([invalidItem])).toThrow('INVALID_ITEM');
  });

  it('відхиляє однаковий SKU з різними цінами', () => {
    expect(() =>
      mergeItems([item('SKU-1', 100), item('SKU-1', 101)]),
    ).toThrow('SKU_PRICE_MISMATCH');
  });
});
