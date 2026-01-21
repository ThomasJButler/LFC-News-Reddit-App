/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Visual regression tests for the home page.
 *              WHY: The home page is the primary entry point and must maintain
 *              visual consistency across themes and viewports.
 */

const { test, expect } = require('@playwright/test');
const { THEMES, setThemeDirect, screenshotName } = require('../helpers/theme');

test.describe('Home Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    // Wait for initial content to load
    await page.waitForSelector('[class*="postItem"]', { timeout: 10000 });
  });

  test.describe('Default State', () => {
    for (const theme of THEMES) {
      test(`renders correctly in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Take full page screenshot
        await expect(page).toHaveScreenshot(
          screenshotName('home-default', theme, testInfo.project.name),
          { fullPage: true }
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
        const skeleton = page.locator('[class*="skeleton"]');
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

        // Get first post card
        const postCard = page.locator('[class*="postItem"]').first();
        await postCard.hover();

        // Wait for hover transition
        await page.waitForTimeout(350);

        await expect(postCard).toHaveScreenshot(
          screenshotName('post-card-hover', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Search Active State', () => {
    for (const theme of THEMES) {
      test(`search bar with active search in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Type in search bar
        const searchInput = page.getByPlaceholder('Search posts...');
        await searchInput.fill('Salah');

        // Take screenshot of search area
        const searchBar = page.locator('[class*="searchBar"]').first();
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
        const mainContent = page.locator('[class*="postList"]').first();
        await expect(mainContent).toHaveScreenshot(
          screenshotName('search-empty', theme, testInfo.project.name)
        );
      });
    }
  });
});
