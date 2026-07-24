import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0, 
  reporter: [
    ['html'], 
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: 'https://www.automationteststore.com', // <--- LIVE SITE
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});