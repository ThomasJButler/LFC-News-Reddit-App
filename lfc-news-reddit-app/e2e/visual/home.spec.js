/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Visual regression tests for the home page.
 *              WHY: The home page is the primary entry point and must maintain
 *              visual consistency across themes and viewports.
 *
 *              Updated for ShadCN rebuild:
 *              - Selectors use data-testid attributes
 *              - API routes go through /api/reddit proxy
 *              - Themes: red, white, black (was red, white, green)
 */

const { test, expect } = require('@playwright/test');
const { THEMES, setThemeDirect, screenshotName, getDynamicContentMasks } = require('../helpers/theme');

test.describe('Home Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    // Wait for initial content to load
    await page.waitForSelector('[data-testid="post-item"]', { timeout: 10000 });
  });

  test.describe('Default State', () => {
    for (const theme of THEMES) {
      test(`renders correctly in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // WHY: Mask dynamic content (timestamps, scores, authors) to prevent flaky tests
        // These values change between test runs but the visual layout should remain consistent
        const masks = getDynamicContentMasks(page);

        // Take full page screenshot
        await expect(page).toHaveScreenshot(
          screenshotName('home-default', theme, testInfo.project.name),
          { fullPage: true, mask: masks }
        );
      });
    }
  });

  test.describe('Loading State', () => {
    for (const theme of THEMES) {
      test(`shows loading skeleton in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Navigate to trigger loading state
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Capture skeleton loading state (if visible)
        const skeleton = page.locator('[data-testid="skeleton"]');
        if (await skeleton.count() > 0) {
          await expect(skeleton.first()).toHaveScreenshot(
            screenshotName('home-skeleton', theme, testInfo.project.name)
          );
        }
      });
    }
  });

  test.describe('Post Card Hover State', () => {
    for (const theme of THEMES) {
      test(`post card hover effect in ${theme} theme`, async ({ page }, testInfo) => {
        // Desktop only - hover states not applicable to touch devices
        if (testInfo.project.name === 'mobile') {
          test.skip();
          return;
        }
        await setThemeDirect(page, theme);

        // Get first post card (ShadCN Card component)
        const postCard = page.locator('[data-testid="post-item"]').first();
        await postCard.hover();

        // Wait for hover transition
        await page.waitForTimeout(350);

        // Mask dynamic content within the post card
        const masks = getDynamicContentMasks(page);

        await expect(postCard).toHaveScreenshot(
          screenshotName('post-card-hover', theme, testInfo.project.name),
          { mask: masks }
        );
      });
    }
  });

  test.describe('Search Active State', () => {
    for (const theme of THEMES) {
      test(`search bar with active search in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Type in search bar (ShadCN Input component)
        const searchInput = page.getByPlaceholder('Search posts...');
        await searchInput.fill('Salah');

        // Take screenshot of search area
        const searchBar = page.locator('[data-testid="search-bar"]').first();
        await expect(searchBar).toHaveScreenshot(
          screenshotName('search-active', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Empty Search Results', () => {
    for (const theme of THEMES) {
      test(`empty search results in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Search for something that won't match
        const searchInput = page.getByPlaceholder('Search posts...');
        await searchInput.fill('xyznonexistent123');
        await searchInput.press('Enter');

        // Wait for results (or empty state)
        await page.waitForTimeout(1000);

        // Capture the main content area
        const mainContent = page.locator('[data-testid="post-list"]').first();
        await expect(mainContent).toHaveScreenshot(
          screenshotName('search-empty', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Error State', () => {
    for (const theme of THEMES) {
      test(`error state in ${theme} theme`, async ({ page }, testInfo) => {
        // WHY: Test error state appearance by intercepting API requests and returning errors
        // This ensures the error UI (with LFC humor) is consistent across themes
        await page.route('**/api/reddit**', route => {
          route.abort('failed');
        });

        await setThemeDirect(page, theme);

        // Navigate to trigger error
        await page.goto('/');

        // Wait for error state to render
        await page.waitForSelector('[data-testid="error-message"], [role="alert"]', { timeout: 15000 });

        // Capture error state
        const errorElement = page.locator('[data-testid="error-message"], [role="alert"]').first();
        await expect(errorElement).toHaveScreenshot(
          screenshotName('home-error', theme, testInfo.project.name)
        );
      });
    }
  });
});
