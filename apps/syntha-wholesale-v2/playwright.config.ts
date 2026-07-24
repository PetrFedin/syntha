import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['line']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Wide Desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro 11'], browserName: 'chromium' },
    },
    {
      name: 'iPhone',
      use: { ...devices['iPhone 15'], browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
