/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Visual regression tests for standalone components.
 *              WHY: Isolated component tests ensure individual elements
 *              maintain their appearance independent of page context.
 */

const { test, expect } = require('@playwright/test');
const { THEMES, setThemeDirect, screenshotName } = require('../helpers/theme');

test.describe('Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[class*="postItem"]', { timeout: 10000 });
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
      test(`theme switcher button in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const themeSwitcher = page.getByRole('button', { name: /Theme/i });
        await expect(themeSwitcher).toHaveScreenshot(
          screenshotName('theme-switcher', theme, testInfo.project.name)
        );
      });
    }

    test('theme switcher dropdown', async ({ page }, testInfo) => {
      // Only need to test dropdown once, it contains all themes
      const themeSwitcher = page.getByRole('button', { name: /Theme/i });
      await themeSwitcher.click();

      // Wait for dropdown to appear
      await page.waitForTimeout(300);

      const dropdown = page.locator('[class*="themeSwitcher"]').first();
      await expect(dropdown).toHaveScreenshot(
        screenshotName('theme-switcher-dropdown', 'red', testInfo.project.name)
      );
    });
  });

  test.describe('Search Bar', () => {
    for (const theme of THEMES) {
      test(`search bar empty in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const searchBar = page.locator('[class*="searchBar"]').first();
        await expect(searchBar).toHaveScreenshot(
          screenshotName('search-bar-empty', theme, testInfo.project.name)
        );
      });

      test(`search bar focused in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const searchInput = page.getByPlaceholder('Search posts...');
        await searchInput.focus();

        const searchBar = page.locator('[class*="searchBar"]').first();
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

        const postCard = page.locator('[class*="postItem"]').first();
        await expect(postCard).toHaveScreenshot(
          screenshotName('post-card-default', theme, testInfo.project.name)
        );
      });

      // Desktop only for focus states
      test.skip(({ project }) => project.name === 'mobile');

      test(`post card focused in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const postCard = page.locator('[class*="postItem"]').first();
        await postCard.focus();

        await expect(postCard).toHaveScreenshot(
          screenshotName('post-card-focused', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Bottom Navigation', () => {
    // Only visible on mobile
    test.skip(({ project }) => project.name !== 'mobile');

    for (const theme of THEMES) {
      test(`bottom nav in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const bottomNav = page.locator('[class*="bottomNav"]').first();
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

  test.describe('Subreddit Filter', () => {
    for (const theme of THEMES) {
      test(`subreddit filter pills in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        const subredditFilter = page.locator('[class*="subredditFilter"]').first();
        if (await subredditFilter.isVisible()) {
          await expect(subredditFilter).toHaveScreenshot(
            screenshotName('subreddit-filter', theme, testInfo.project.name)
          );
        } else {
          test.skip();
        }
      });
    }
  });
});
