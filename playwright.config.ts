import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5174/8kuaifuji',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    channel: 'chrome',
    launchOptions: {
      executablePath: 'd:\\会展仓库项目\\.playwright-browsers\\chromium-1228\\chrome-win64\\chrome.exe',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5174/8kuaifuji',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});
