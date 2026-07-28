import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0, 
  reporter: [
    ['html'], 
    ['json', { outputFile: 'test-results.json' }]
  ],
  // ADD THIS LINE: Forces Playwright to ignore Windows/Linux/Mac differences in screenshot names
  snapshotPathTemplate: '{testDir}/snapshots/{testFileName}/{arg}{ext}',
  
  use: {
    baseURL: 'https://www.automationteststore.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});