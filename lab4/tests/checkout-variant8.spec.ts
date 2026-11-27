import { expect, test, type Page } from '@playwright/test';
import { USERS } from './data';

async function openCheckout(page: Page, productName: string) {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(USERS.standard.username);
  await page.getByPlaceholder('Password').fill(USERS.standard.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);

  await page
    .locator('.inventory_item')
    .filter({ hasText: productName })
    .getByRole('button', { name: 'Add to cart' })
    .click();

  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL(/cart\.html/);

  await page.locator('[data-test="checkout"]').click();
  await expect(page).toHaveURL(/checkout-step-one\.html/);
}

test.describe('Варіант 8: оформлення замовлення', () => {
  test('порожнє прізвище показує помилку і не відкриває огляд', async ({
    page,
  }) => {
    await openCheckout(page, 'Sauce Labs Backpack');

    await page.locator('[data-test="firstName"]').fill('Mykhailo');
    await page.locator('[data-test="lastName"]').fill('');
    await page.locator('[data-test="postalCode"]').fill('79000');
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="error"]')).toContainText(
      /Last Name is required/i,
    );
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);
  });

  test('після помилки прізвище можна виправити і перейти до огляду', async ({
    page,
  }) => {
    await openCheckout(page, 'Sauce Labs Bike Light');

    await page.locator('[data-test="firstName"]').fill('Mykhailo');
    await page.locator('[data-test="postalCode"]').fill('79000');
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="error"]')).toContainText(
      /Last Name is required/i,
    );

    await page.locator('[data-test="lastName"]').fill('Kopach');
    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.getByText('Checkout: Overview')).toBeVisible();
  });
});
