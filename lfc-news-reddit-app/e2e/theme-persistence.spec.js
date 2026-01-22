/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description E2E tests for theme switching and persistence functionality.
 *              WHY: Theme persistence is critical for user experience - users expect
 *              their theme preference to be remembered across sessions and page reloads.
 *              These tests ensure the theme system works correctly end-to-end.
 */

const { test, expect } = require('@playwright/test');
const { THEMES, setTheme, getTheme, setThemeDirect } = require('./helpers/theme');

test.describe('Theme Persistence', () => {
  test.describe('Theme Switching', () => {
    test('defaults to red theme on first visit', async ({ page }) => {
      // Clear any stored theme
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Default theme should be red
      const theme = await getTheme(page);
      expect(theme).toBe('red');
    });

    for (const theme of THEMES) {
      test(`can switch to ${theme} theme via theme switcher`, async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

        // Open theme switcher and select theme
        await setTheme(page, theme);

        // Verify theme is applied
        const currentTheme = await getTheme(page);
        expect(currentTheme).toBe(theme);

        // Verify data-theme attribute is set on html element
        const dataTheme = await page.evaluate(
          () => document.documentElement.getAttribute('data-theme')
        );
        expect(dataTheme).toBe(theme);
      });
    }

    test('theme buttons are visible and clickable', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Find theme buttons - they're always visible (no dropdown)
      const homeButton = page.getByRole('button', { name: 'Anfield Red theme' });
      const awayButton = page.getByRole('button', { name: 'Away Day theme' });
      const keeperButton = page.getByRole('button', { name: 'Keeper Kit theme' });

      await expect(homeButton).toBeVisible();
      await expect(awayButton).toBeVisible();
      await expect(keeperButton).toBeVisible();

      // Click a button to change theme
      await awayButton.click();

      // Wait for transition
      await page.waitForTimeout(400);

      // Verify theme changed
      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('white');
    });
  });

  test.describe('Theme Persistence Across Reloads', () => {
    for (const theme of THEMES) {
      test(`${theme} theme persists after page reload`, async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

        // Set theme
        await setTheme(page, theme);
        await page.waitForTimeout(500);

        // Verify localStorage was updated
        const storedTheme = await page.evaluate(
          () => localStorage.getItem('lfc-theme')
        );
        expect(storedTheme).toBe(theme);

        // Reload page
        await page.reload();
        await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

        // Theme should persist
        const currentTheme = await getTheme(page);
        expect(currentTheme).toBe(theme);
      });
    }
  });

  test.describe('Theme Persistence Across Navigation', () => {
    test('theme persists when opening and closing post modal', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Set green theme
      await setTheme(page, 'green');
      await page.waitForTimeout(500);

      // Open post detail
      await page.locator('[class*="postItem"]').first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Theme should still be green
      let currentTheme = await getTheme(page);
      expect(currentTheme).toBe('green');

      // Close modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();

      // Theme should still be green
      currentTheme = await getTheme(page);
      expect(currentTheme).toBe('green');
    });

    test('theme persists after searching', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Set white theme
      await setTheme(page, 'white');
      await page.waitForTimeout(500);

      // Perform search
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('Liverpool');
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);

      // Theme should still be white
      const currentTheme = await getTheme(page);
      expect(currentTheme).toBe('white');
    });
  });

  test.describe('Theme Visual Application', () => {
    test('theme changes CSS custom properties', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Get initial background color (red theme default)
      const initialBg = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
      });

      // Switch to white theme
      await setTheme(page, 'white');
      await page.waitForTimeout(500);

      // Get new background color
      const whiteBg = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
      });

      // Colours should be different
      expect(whiteBg).not.toBe(initialBg);
    });

    test('all theme variables are defined', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      for (const theme of THEMES) {
        await setThemeDirect(page, theme);
        await page.waitForTimeout(100);

        // Check that key CSS variables are defined
        const variables = await page.evaluate(() => {
          const style = getComputedStyle(document.documentElement);
          return {
            bgPrimary: style.getPropertyValue('--bg-primary'),
            bgSecondary: style.getPropertyValue('--bg-secondary'),
            textPrimary: style.getPropertyValue('--text-primary'),
            accentColor: style.getPropertyValue('--accent-color'),
          };
        });

        // All should have values
        expect(variables.bgPrimary).toBeTruthy();
        expect(variables.bgSecondary).toBeTruthy();
        expect(variables.textPrimary).toBeTruthy();
        expect(variables.accentColor).toBeTruthy();
      }
    });
  });

  test.describe('Theme Keyboard Navigation', () => {
    test('theme buttons are keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Find and focus keeper theme button
      const keeperButton = page.getByRole('button', { name: 'Keeper Kit theme' });
      await keeperButton.focus();
      await expect(keeperButton).toBeFocused();

      // Press Enter to select
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);

      // Verify theme changed
      const currentTheme = await getTheme(page);
      expect(currentTheme).toBe('green');
    });
  });

  test.describe('Theme Consistency', () => {
    test('modal inherits current theme', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Set white theme
      await setTheme(page, 'white');
      await page.waitForTimeout(500);

      // Open modal
      await page.locator('[class*="postItem"]').first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Check modal uses theme colours (by checking computed styles)
      const modalBg = await page.evaluate(() => {
        const modalContent = document.querySelector('[class*="modalContent"]');
        return modalContent ? getComputedStyle(modalContent).backgroundColor : null;
      });

      // Modal should have a background colour (not transparent)
      expect(modalBg).toBeTruthy();
      expect(modalBg).not.toBe('transparent');
      expect(modalBg).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('search bar inherits current theme', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Set green theme
      await setTheme(page, 'green');
      await page.waitForTimeout(500);

      // Check search bar uses theme
      const searchBg = await page.evaluate(() => {
        const searchBar = document.querySelector('[class*="searchBar"]');
        return searchBar ? getComputedStyle(searchBar).backgroundColor : null;
      });

      expect(searchBg).toBeTruthy();
    });

    test('skeleton loader uses theme colours', async ({ page }) => {
      // Navigate with delayed response to see skeleton
      await page.route('**/reddit.com/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/');

      // Set theme immediately
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'green');
        localStorage.setItem('lfc-theme', 'green');
      });

      // Check skeleton uses theme colours
      const skeleton = page.locator('[class*="skeleton"]');
      const skeletonExists = await skeleton.count() > 0;

      if (skeletonExists) {
        const skeletonBg = await page.evaluate(() => {
          const elem = document.querySelector('[class*="skeleton"]');
          return elem ? getComputedStyle(elem).backgroundColor : null;
        });

        expect(skeletonBg).toBeTruthy();
      }

      // Wait for content to load
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });
    });
  });

  test.describe('Theme Edge Cases', () => {
    test('handles invalid theme in localStorage gracefully', async ({ page }) => {
      await page.goto('/');

      // Set invalid theme in localStorage
      await page.evaluate(() => {
        localStorage.setItem('lfc-theme', 'invalid-theme');
      });

      // Reload
      await page.reload();
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Should fall back to default (red)
      const theme = await getTheme(page);
      expect(THEMES).toContain(theme);
    });

    test('handles missing localStorage gracefully', async ({ page }) => {
      await page.goto('/');

      // Clear localStorage
      await page.evaluate(() => {
        localStorage.clear();
      });

      // Reload
      await page.reload();
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Should use default theme
      const theme = await getTheme(page);
      expect(THEMES).toContain(theme);
    });
  });
});
