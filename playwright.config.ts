import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // ADD THIS LINE TO GENERATE THE FOLDER!
  reporter: [['html']], 
  
  // Automatically start our dummy app on port 3000 before tests run!
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