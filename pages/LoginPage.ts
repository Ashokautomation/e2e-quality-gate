import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  // 1. Define Locators
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  // 2. Initialize Locators in Constructor
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#loginFrm_loginname');
    this.passwordInput = page.locator('#loginFrm_password');
    this.submitButton = page.locator('#loginFrm button[type="submit"]');
    this.errorMessage = page.locator('.alert-danger');
  }

  // 3. Create Reusable Actions
  async goto() {
    await this.page.goto('/index.php?rt=account/login', { waitUntil: 'networkidle' });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError() {
    await expect(this.errorMessage).toBeVisible();
    const errorText = await this.errorMessage.textContent();
    expect(errorText).toMatch(/Error|Unknown/); // Handles your Cloudflare fix!
  }
}