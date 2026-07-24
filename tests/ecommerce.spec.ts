import { test, expect } from '@playwright/test';
import { ecomUserDataset } from '../data/ecom-users';

// This loop runs 3 times (once for each user in our data)
for (const userData of ecomUserDataset) {
  
  // Playwright will automatically run THIS test for Chromium, Firefox, AND WebKit!
  test(`Data-Driven: ${userData.username} selects ${userData.productName}`, async ({ page }) => {
    
    // 1. Navigate to Login Page
    await page.goto('/index.php?rt=account/login');
    await expect(page.locator('.loginFrm')).toBeVisible();

    // 2. Attempt Login (Data-Driven)
    await page.fill('#loginFrm_loginname', userData.username);
    await page.fill('#loginFrm_password', userData.password);
    await page.click('#loginFrm button[type="submit"]');

    // 3. Navigate to the specific User's Category
    await page.click(`a:has-text("${userData.productCategory}")`);
    
    // Wait for the product grid to load
    await expect(page.locator('.productgrid')).toBeVisible();

    // 4. Select the specific Product assigned to this user
    const productLocator = page.locator('.productcart', { hasText: userData.productName });
    
    // Verify the product actually exists on the page before adding
    await expect(productLocator).toBeVisible();
    await productLocator.click();

    // 5. Verify success (Wait for UI to settle)
    await page.waitForTimeout(2000); 
    console.log(`✅ ${userData.username} successfully triggered add to cart for ${userData.productName}`);
  });
}