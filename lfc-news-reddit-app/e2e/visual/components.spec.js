/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Visual regression tests for standalone components.
 *              WHY: Isolated component tests ensure individual elements
 *              maintain their appearance independent of page context.
 *
 *              Updated for ShadCN rebuild:
 *              - Selectors use data-testid attributes
 *              - Theme switcher is ShadCN ToggleGroup (no dropdown)
 *              - Search bar is ShadCN Input
 *              - Sort uses ShadCN Tabs, filter uses Collapsible + ToggleGroup
 *              - Themes: red, white, black (was red, white, green)
 */

const { test, expect } = require('@playwright/test');
const { THEMES, setThemeDirect, screenshotName, getDynamicContentMasks } = require('../helpers/theme');

test.describe('Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="post-item"]', { timeout: 10000 });
  });

  test.describe('Header', () => {
    for (const theme of THEMES) {
      test(`header in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const header = page.locator('header').first();
        await expect(header).toHaveScreenshot(
          screenshotName('header', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Theme Switcher', () => {
    for (const theme of THEMES) {
      test(`theme switcher in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // ShadCN ToggleGroup - no dropdown, buttons always visible
        const themeSwitcher = page.locator('[data-testid="theme-switcher"]');
        await expect(themeSwitcher).toHaveScreenshot(
          screenshotName('theme-switcher', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Search Bar', () => {
    for (const theme of THEMES) {
      test(`search bar empty in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const searchBar = page.locator('[data-testid="search-bar"]').first();
        await expect(searchBar).toHaveScreenshot(
          screenshotName('search-bar-empty', theme, testInfo.project.name)
        );
      });

      test(`search bar focused in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const searchInput = page.getByPlaceholder('Search posts...');
        await searchInput.focus();

        const searchBar = page.locator('[data-testid="search-bar"]').first();
        await expect(searchBar).toHaveScreenshot(
          screenshotName('search-bar-focused', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Post Card', () => {
    for (const theme of THEMES) {
      test(`post card default in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // WHY: Mask dynamic content to prevent flaky tests
        const masks = getDynamicContentMasks(page);

        const postCard = page.locator('[data-testid="post-item"]').first();
        await expect(postCard).toHaveScreenshot(
          screenshotName('post-card-default', theme, testInfo.project.name),
          { mask: masks }
        );
      });

      test(`post card focused in ${theme} theme`, async ({ page }, testInfo) => {
        // Desktop only for focus states
        if (testInfo.project.name === 'mobile') {
          test.skip();
          return;
        }
        await setThemeDirect(page, theme);

        const postCard = page.locator('[data-testid="post-item"]').first();
        await postCard.focus();

        // Mask dynamic content
        const masks = getDynamicContentMasks(page);

        await expect(postCard).toHaveScreenshot(
          screenshotName('post-card-focused', theme, testInfo.project.name),
          { mask: masks }
        );
      });
    }
  });

  test.describe('Bottom Navigation', () => {
    for (const theme of THEMES) {
      test(`bottom nav in ${theme} theme`, async ({ page }, testInfo) => {
        // Only visible on mobile
        if (testInfo.project.name !== 'mobile') {
          test.skip();
          return;
        }
        await setThemeDirect(page, theme);

        const bottomNav = page.locator('[data-testid="bottom-nav"]').first();
        if (await bottomNav.isVisible()) {
          await expect(bottomNav).toHaveScreenshot(
            screenshotName('bottom-nav', theme, testInfo.project.name)
          );
        } else {
          test.skip();
        }
      });
    }
  });

  test.describe('Sort Tabs', () => {
    for (const theme of THEMES) {
      test(`sort tabs in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // ShadCN Tabs component for sort options
        const sortTabs = page.locator('[data-testid="sort-tabs"]').first();
        if (await sortTabs.isVisible()) {
          await expect(sortTabs).toHaveScreenshot(
            screenshotName('sort-tabs', theme, testInfo.project.name)
          );
        } else {
          test.skip();
        }
      });
    }
  });

  test.describe('Filter Panel', () => {
    for (const theme of THEMES) {
      test(`filter panel in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // ShadCN Collapsible + ToggleGroup for filter options
        const filterPanel = page.locator('[data-testid="filter-panel"]').first();
        if (await filterPanel.isVisible()) {
          await expect(filterPanel).toHaveScreenshot(
            screenshotName('filter-panel', theme, testInfo.project.name)
          );
        } else {
          test.skip();
        }
      });
    }
  });
});
