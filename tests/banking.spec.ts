import { test, expect } from '@playwright/test';

// --- SANITY TEST (Runs in 10 seconds. Like a Unit Test for Devs) ---
test('Sanity: Valid login redirects to dashboard', { tag: ['@sanity'] }, async ({ page }) => {
  await page.goto('/');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'password123');
  await page.click('#login-btn'); // <-- We will break this ID later!

  // Assert we are on dashboard
  await expect(page.locator('#dashboard-view')).toBeVisible();
  await expect(page.locator('#welcome-msg')).toHaveText('Hello, admin');
});

// --- REGRESSION TEST (Runs only on main branch merges. Takes longer) ---
test('Regression: Verify account balance is displayed', { tag: ['@regression'] }, async ({ page }) => {
  await page.goto('/');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'password123');
  await page.click('#login-btn');

  // Assert financial data
  await expect(page.locator('#account-balance')).toContainText('$50,000');
});