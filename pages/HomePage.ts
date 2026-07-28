import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly firstAddToCartButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly bodyText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstAddToCartButton = page.locator('.productcart').first();
    this.searchInput = page.locator('#filter_keyword');
    this.searchButton = page.locator('.button-in-search');
    this.bodyText = page.locator('body');
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  async addFirstProductToCart() {
    await this.firstAddToCartButton.click();
    await this.page.waitForTimeout(2000); // Wait for UI animation
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }
  // Add this method!
  async validateVisualHomepage() {
    // Playwright takes a screenshot and compares it pixel-by-pixel to a baseline
    await expect(this.page).toHaveScreenshot('homepage.png');
  }
}}