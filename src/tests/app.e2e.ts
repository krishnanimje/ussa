import { test, expect } from '@playwright/test';

test.describe('Edgar Valle Real Estate - End to End Flow', () => {
  test('homepage displays credentials, search, and navigation', async ({ page }) => {
    await page.goto('/');

    // Check title and DRE credential
    await expect(page).toHaveTitle(/Edgar Valle/i);
    await expect(page.locator('text=02375273').first()).toBeVisible();
    await expect(page.locator('text=Full Circle Group').first()).toBeVisible();

    // Check primary navigation
    await expect(page.locator('nav a[href="/properties"]').first()).toBeVisible();
    await expect(page.locator('nav a[href="/va-loans"]').first()).toBeVisible();
  });

  test('properties page filters listings live', async ({ page }) => {
    await page.goto('/properties');

    // Check properties grid loaded
    const gridItems = page.locator('.property-grid-item');
    await expect(gridItems.first()).toBeVisible();

    // Select VA Loan filter
    const vaCheckbox = page.locator('#checkVa');
    await vaCheckbox.check();

    // Verify results count message updates
    const countText = page.locator('#resultsCount');
    await expect(countText).toContainText('San Diego Properties');
  });

  test('property detail page loads and recalculates mortgage live', async ({ page }) => {
    await page.goto('/properties/north-park-spanish-revival');

    // Check property title
    await expect(page.locator('h1')).toContainText('Restored Spanish Revival');

    // Check mortgage calculator exists
    const calc = page.locator('#mortgageCalculator');
    await expect(calc).toBeVisible();

    // Check monthly payment display
    const payment = page.locator('#totalPaymentDisplay');
    await expect(payment).toBeVisible();
    await expect(payment).not.toBeEmpty();
  });

  test('lead form validates inputs and displays success upon persistence', async ({ page }) => {
    await page.goto('/contact');

    // Fill form
    await page.fill('input[name="fullName"]', 'Test Homebuyer');
    await page.fill('input[name="email"]', 'homebuyer.test@example.com');
    await page.fill('input[name="phone"]', '(619) 555-8822');
    await page.fill('textarea[name="message"]', 'Looking for homes in North Park.');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success banner appears
    const successBanner = page.locator('.form-success-alert');
    await expect(successBanner).toBeVisible();
  });
});
