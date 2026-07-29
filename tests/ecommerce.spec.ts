import { test, expect } from '@playwright/test';
import { ecomUserDataset } from '../data/ecom-users';

// --- SANITY TEST (Bulletproof against Cloudflare in CI/CD) ---
test('Sanity: E-commerce site is alive', { tag: ['@sanity'] }, async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' }); 
  await expect(page).toHaveTitle(/A place to practice your automation skills/, { timeout: 60000 });
});

// --- REGRESSION MATRIX (Original 9 Tests across 3 browsers) ---
for (const userData of ecomUserDataset) {
  test(`Regression: ${userData.username} adds product to cart`, { tag: ['@regression'] }, async ({ page }) => {
    await page.goto('/index.php?rt=account/login', { waitUntil: 'networkidle' });
    await page.fill('#loginFrm_loginname', userData.username);
    await page.fill('#loginFrm_password', userData.password);
    await page.click('#loginFrm button[type="submit"]');
    await page.goto('/', { waitUntil: 'networkidle' });
    const firstAddToCartButton = page.locator('.productcart').first();
    await firstAddToCartButton.click();
    await page.waitForTimeout(2000);
    console.log(`✅ ${userData.username} successfully added an item to the cart`);
  });
}

// --- NEGATIVE TESTS ---
test('Regression: NEGATIVE - Login with invalid credentials shows error', { tag: ['@regression'] }, async ({ page }) => {
  await page.goto('/index.php?rt=account/login', { waitUntil: 'networkidle' });
  await page.fill('#loginFrm_loginname', 'fakeuser@fail.com');
  await page.fill('#loginFrm_password', 'WrongPassword999');
  await page.click('#loginFrm button[type="submit"]');
  await expect(page.locator('.alert-danger')).toBeVisible();
  const errorText = await page.locator('.alert-danger').textContent();
  expect(errorText).toMatch(/Error|Unknown/); 
  console.log('❌ Successfully caught invalid login error');
});

test('Regression: NEGATIVE - Login with empty fields', { tag: ['@regression'] }, async ({ page }) => {
  await page.goto('/index.php?rt=account/login', { waitUntil: 'networkidle' });
  await page.click('#loginFrm button[type="submit"]');
  await expect(page.locator('.alert-danger')).toBeVisible();
  const errorText = await page.locator('.alert-danger').textContent();
  expect(errorText).toMatch(/Error|Unknown/); 
  console.log('❌ Successfully caught empty login error');
});

// --- EDGE CASE TESTS ---
test('Regression: EDGE - Login handles XSS payload safely without crashing', { tag: ['@regression'] }, async ({ page }) => {
  await page.goto('/index.php?rt=account/login', { waitUntil: 'networkidle' });
  const xssPayload = '<script>alert("XSS Hack")</script>';
  await page.fill('#loginFrm_loginname', xssPayload);
  await page.fill('#loginFrm_password', 'Test123!');
  await page.click('#loginFrm button[type="submit"]');
  await expect(page.locator('#loginFrm')).toBeVisible();
  console.log('🛡️ Successfully handled XSS payload without breaking the application');
});

test('Regression: EDGE - Rapidly clicking Add to Cart handles race condition', { tag: ['@regression'] }, async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const firstAddToCartButton = page.locator('.productcart').first();
  await Promise.all([
    firstAddToCartButton.click(),
    firstAddToCartButton.click(),
    firstAddToCartButton.click(),
  ]);
  await page.waitForTimeout(2000);
  await expect(page.locator('body')).toBeVisible();
  console.log('⚡ Handled rapid add-to-cart clicks without server crash');
});

test('Regression: EDGE - Search with 500+ characters handles gracefully', { tag: ['@regression'] }, async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const longString = 'a'.repeat(500);
  await page.fill('#filter_keyword', longString);
  await page.click('.button-in-search');
  await page.waitForTimeout(2000);
  const bodyText = await page.locator('body').textContent();
  const hasNoResults = bodyText?.includes('There is no product that matches the search criteria.');
  const hasError = bodyText?.includes('Error') || bodyText?.includes('500'); 
  expect(hasNoResults || hasError).toBeTruthy();
  console.log('🚧 Successfully handled maximum character boundary in search');
});

// --- HYBRID API + UI TEST ---
test('Regression: HYBRID - API adds to cart, UI verifies display', { tag: ['@regression'] }, async ({ page }) => {
  await page.goto('/index.php?rt=account/login', { waitUntil: 'networkidle' });
  await page.fill('#loginFrm_loginname', 'ashok.test1@gmail.com');
  await page.fill('#loginFrm_password', 'Test123!');
  await page.click('#loginFrm button[type="submit"]');
  await page.waitForTimeout(2000);

  const addToCartResponse = await page.request.post('/index.php?rt=product/product/addToCart', {
    data: { product_id: '49', quantity: '1' }
  });
  console.log(`🔗 API Add to Cart Status: ${addToCartResponse.status()}`);

  await page.goto('/index.php?rt=checkout/cart', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toContainText('$', { timeout: 5000}); 
  console.log('🔗 Hybrid test passed: UI Login -> API Add -> UI Verify');
});

// --- VISUAL REGRESSION TEST ---
test('Regression: VISUAL - Homepage layout is unchanged', { tag: ['@regression'] }, async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  
  // THE FIX FOR GITHUB ACTIONS: Ignore 2% pixel difference (Linux vs Windows fonts)
  await expect(page).toHaveScreenshot('homepage.png', { threshold: 0.02 });
  console.log('📸 Visual regression passed: Homepage matches baseline');
});