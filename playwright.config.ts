import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // If a test fails, run it ONE more time. If it passes, it's FLAKY!
  retries: 1, 
  
  // HTML is for humans, JSON is for our custom math script
  reporter: [
    ['html'], 
    ['json', { outputFile: 'test-results.json' }] // <--- THIS IS THE MAGIC LINE!
  ],

  webServer: {
    command: 'npx http-server . -p 3000 -s',
    port: 3000,
    reuseExistingServer: true,
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
});