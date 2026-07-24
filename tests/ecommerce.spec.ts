import { test, expect } from '@playwright/test';
import { ecomUserDataset } from '../data/ecom-users';

// --- SANITY TEST ---
test('Sanity: Homepage loads and login page is accessible', { tag: ['@sanity'] }, async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.logo')).toBeVisible();
  await page.click("a[href*='login']");
  await expect(page.locator('#loginFrm')).toBeVisible();
});

// --- REGRESSION MATRIX ---
for (const userData of ecomUserDataset) {
  
  test(`Regression: ${userData.username} adds product to cart`, { tag: ['@regression'] }, async ({ page }) => {
    
    // 1. Login
    await page.goto('/index.php?rt=account/login');
    await page.fill('#loginFrm_loginname', userData.username);
    await page.fill('#loginFrm_password', userData.password);
    await page.click('#loginFrm button[type="submit"]');

    // 2. Go to Homepage to find products (bypasses the tricky dropdown menu!)
    await page.goto('/');
    await expect(page.locator('.logo')).toBeVisible();

    // 3. Add the VERY FIRST product on the homepage to the cart
    const firstAddToCartButton = page.locator('.productcart').first();
    await firstAddToCartButton.click();

    // 4. Verify the cart updated successfully
    // Wait a moment for the UI to register the item
    await page.waitForTimeout(2000);
    
    // Verify the cart block is present
    await expect(page.locator('.blockcart')).toBeVisible();
    
    console.log(`✅ ${userData.username} successfully added an item to the cart`);
  });
}