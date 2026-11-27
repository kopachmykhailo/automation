import { expect, test } from '@playwright/test';
import { USERS } from './data';

test.describe('Каталог товарів', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(USERS.standard.username);
    await page.getByPlaceholder('Password').fill(USERS.standard.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('сортування за зростанням ціни впорядковує список', async ({ page }) => {
    await page
      .locator('[data-test="product-sort-container"]')
      .selectOption('lohi');

    await expect
      .poll(async () => {
        const prices = await page
          .locator('.inventory_item_price')
          .allTextContents();
        const numbers = prices.map((text) => Number(text.replace('$', '')));
        return numbers.every(
          (price, index) => index === 0 || numbers[index - 1] <= price,
        );
      })
      .toEqual(true);
  });

  test('додавання товару оновлює лічильник кошика', async ({ page }) => {
    const badge = page.locator('.shopping_cart_badge');
    await expect(badge).toHaveCount(0);

    await page
      .locator('.inventory_item')
      .filter({ hasText: 'Sauce Labs Backpack' })
      .getByRole('button', { name: 'Add to cart' })
      .click();

    await expect(badge).toHaveText('1');
  });
});
