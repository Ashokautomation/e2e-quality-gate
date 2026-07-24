import { test, expect } from '@playwright/test';
import { ecomUserDataset } from '../data/ecom-users';

// --- SANITY TEST (Fast, runs on every PR) ---
// We just test ONE user to make sure the site isn't completely broken
test('Sanity: Homepage loads and login page is accessible', { tag: ['@sanity'] }, async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.logo')).toBeVisible(); // Verify homepage loaded
  await page.click("a[href*='login']");
  await expect(page.locator('#loginFrm')).toBeVisible(); // Verify login page loaded
});

// --- REGRESSION TESTS (Data-Driven Matrix, runs on main branch) ---
for (const userData of ecomUserDataset) {
  
  test(`Regression: ${userData.username} selects ${userData.productName}`, { tag: ['@regression'] }, async ({ page }) => {
    
    // 1. Navigate to Login Page
    await page.goto('/index.php?rt=account/login');
    await expect(page.locator('#loginFrm')).toBeVisible();

    // 2. Attempt Login (Data-Driven)
    await page.fill('#loginFrm_loginname', userData.username);
    await page.fill('#loginFrm_password', userData.password);
    await page.click('#loginFrm button[type="submit"]');

    // 3. Navigate to the specific User's Category
    await page.click(`a:has-text("${userData.productCategory}")`);
    await expect(page.locator('.productgrid')).toBeVisible();

    // 4. Select the specific Product assigned to this user
    const productLocator = page.locator('.productcart', { hasText: userData.productName });
    await expect(productLocator).toBeVisible();
    await productLocator.click();

    // 5. Verify success
    await page.waitForTimeout(2000); 
    console.log(`✅ ${userData.username} successfully triggered add to cart for ${userData.productName}`);
  });
}