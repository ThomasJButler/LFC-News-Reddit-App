/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Playwright configuration for visual regression testing.
 *              WHY: Visual tests prevent CSS regressions across 4 themes and 3 viewports.
 *              This configuration enables consistent screenshot comparisons.
 */

const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory for E2E and visual tests
  testDir: './e2e',

  // Run tests in parallel for faster execution
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only - flaky tests should be fixed, not retried locally
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI to prevent resource exhaustion
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: process.env.CI ? 'github' : 'html',

  // Shared settings for all the projects below
  use: {
    // Base URL for the development server
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure for debugging
    screenshot: 'only-on-failure',
  },

  // Visual comparison settings
  expect: {
    toHaveScreenshot: {
      // Allow small pixel differences (anti-aliasing, font rendering)
      maxDiffPixels: 100,
      // Threshold for pixel comparison (0-1, lower is stricter)
      threshold: 0.1,
    },
    toMatchSnapshot: {
      // Same settings for snapshot matching
      maxDiffPixels: 100,
      threshold: 0.1,
    },
  },

  // Snapshot directory for visual regression screenshots
  snapshotDir: './__screenshots__',

  // Configure projects for different viewports
  projects: [
    // Mobile viewport (iPhone 12)
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 812 },
      },
    },

    // Tablet viewport (iPad)
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
      },
    },

    // Desktop viewport (Standard)
    {
      name: 'desktop',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
