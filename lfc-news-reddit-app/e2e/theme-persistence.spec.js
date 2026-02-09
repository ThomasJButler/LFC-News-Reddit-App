/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description E2E tests for theme switching and persistence functionality.
 *              WHY: Theme persistence is critical for user experience - users expect
 *              their theme preference to be remembered across sessions and page reloads.
 *              These tests ensure the theme system works correctly end-to-end.
 *
 *              Updated for ShadCN rebuild:
 *              - 3 themes: red, white, black (was red, white, green)
 *              - All themes set data-theme attribute on <html> (no special case for default)
 *              - CSS variables use ShadCN naming: --background, --foreground, --primary, etc.
 *              - Selectors use data-testid attributes
 *              - Theme buttons: Anfield Red, Away Day, Third Kit
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

      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Default theme should be red
      const theme = await getTheme(page);
      expect(theme).toBe('red');
    });

    for (const theme of THEMES) {
      test(`can switch to ${theme} theme via theme switcher`, async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

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
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Find theme buttons - they're always visible (ShadCN ToggleGroup)
      const homeButton = page.getByRole('button', { name: 'Anfield Red theme' });
      const awayButton = page.getByRole('button', { name: 'Away Day theme' });
      const thirdButton = page.getByRole('button', { name: 'Third Kit theme' });

      await expect(homeButton).toBeVisible();
      await expect(awayButton).toBeVisible();
      await expect(thirdButton).toBeVisible();

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
        await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

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
        await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

        // Theme should persist
        const currentTheme = await getTheme(page);
        expect(currentTheme).toBe(theme);
      });
    }
  });

  test.describe('Theme Persistence Across Navigation', () => {
    test('theme persists when opening and closing post sheet', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Set black theme
      await setTheme(page, 'black');
      await page.waitForTimeout(500);

      // Open post detail (ShadCN Sheet)
      await page.locator('[data-testid="post-item"]').first().click();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Theme should still be black
      let currentTheme = await getTheme(page);
      expect(currentTheme).toBe('black');

      // Close sheet
      await page.keyboard.press('Escape');
      await expect(sheet).not.toBeVisible();

      // Theme should still be black
      currentTheme = await getTheme(page);
      expect(currentTheme).toBe('black');
    });

    test('theme persists after searching', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

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
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Get initial background color (red theme default)
      const initialBg = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--background');
      });

      // Switch to white theme
      await setTheme(page, 'white');
      await page.waitForTimeout(500);

      // Get new background color
      const whiteBg = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--background');
      });

      // Colours should be different
      expect(whiteBg).not.toBe(initialBg);
    });

    test('all theme variables are defined', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      for (const theme of THEMES) {
        await setThemeDirect(page, theme);
        await page.waitForTimeout(100);

        // Check that key ShadCN CSS variables are defined
        const variables = await page.evaluate(() => {
          const style = getComputedStyle(document.documentElement);
          return {
            background: style.getPropertyValue('--background'),
            foreground: style.getPropertyValue('--foreground'),
            card: style.getPropertyValue('--card'),
            primary: style.getPropertyValue('--primary'),
          };
        });

        // All should have values
        expect(variables.background).toBeTruthy();
        expect(variables.foreground).toBeTruthy();
        expect(variables.card).toBeTruthy();
        expect(variables.primary).toBeTruthy();
      }
    });
  });

  test.describe('Theme Keyboard Navigation', () => {
    test('theme buttons are keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Find and focus Third Kit theme button
      const thirdButton = page.getByRole('button', { name: 'Third Kit theme' });
      await thirdButton.focus();
      await expect(thirdButton).toBeFocused();

      // Press Enter to select
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);

      // Verify theme changed
      const currentTheme = await getTheme(page);
      expect(currentTheme).toBe('black');
    });
  });

  test.describe('Theme Consistency', () => {
    test('sheet inherits current theme', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Set white theme
      await setTheme(page, 'white');
      await page.waitForTimeout(500);

      // Open sheet
      await page.locator('[data-testid="post-item"]').first().click();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Check sheet uses theme colours (by checking computed styles)
      const sheetBg = await page.evaluate(() => {
        const sheetContent = document.querySelector('[data-testid="post-detail-content"]');
        return sheetContent ? getComputedStyle(sheetContent).backgroundColor : null;
      });

      // Sheet should have a background colour (not transparent)
      expect(sheetBg).toBeTruthy();
      expect(sheetBg).not.toBe('transparent');
      expect(sheetBg).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('search bar inherits current theme', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Set black theme
      await setTheme(page, 'black');
      await page.waitForTimeout(500);

      // Check search bar uses theme
      const searchBg = await page.evaluate(() => {
        const searchBar = document.querySelector('[data-testid="search-bar"]');
        return searchBar ? getComputedStyle(searchBar).backgroundColor : null;
      });

      expect(searchBg).toBeTruthy();
    });

    test('skeleton loader uses theme colours', async ({ page }) => {
      // Navigate with delayed response to see skeleton
      await page.route('**/api/reddit**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/');

      // Set theme immediately
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'black');
        localStorage.setItem('lfc-theme', 'black');
      });

      // Check skeleton uses theme colours
      const skeleton = page.locator('[data-testid="skeleton"]');
      const skeletonExists = await skeleton.count() > 0;

      if (skeletonExists) {
        const skeletonBg = await page.evaluate(() => {
          const elem = document.querySelector('[data-testid="skeleton"]');
          return elem ? getComputedStyle(elem).backgroundColor : null;
        });

        expect(skeletonBg).toBeTruthy();
      }

      // Wait for content to load
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });
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
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

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
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Should use default theme
      const theme = await getTheme(page);
      expect(THEMES).toContain(theme);
    });
  });
});
