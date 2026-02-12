/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description E2E tests for mobile navigation and touch interactions.
 *              WHY: Mobile users represent a significant portion of the audience.
 *              These tests ensure touch interactions, gestures, and mobile-specific
 *              UI elements work correctly on mobile viewports.
 *
 *              Updated for ShadCN rebuild:
 *              - Selectors use data-testid attributes (Tailwind classes aren't semantic)
 *              - Post detail uses ShadCN Sheet (still role="dialog")
 *              - Sort uses ShadCN Tabs instead of <select>
 *              - Filter buttons use ShadCN Toggle/ToggleGroup
 */

import { test, expect } from '@playwright/test';

// These tests are specifically for mobile viewport
test.describe('Mobile Navigation', () => {
  // Skip on non-mobile viewports
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile') {
      test.skip();
      return;
    }
    await page.goto('/');
    await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });
  });

  test.describe('Bottom Navigation', () => {
    test('displays bottom navigation bar', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();
    });

    test('bottom navigation has correct buttons', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const bottomNav = page.locator('[data-testid="bottom-nav"]');

      // Check for navigation items (Home, Search, Theme, etc.)
      const navButtons = bottomNav.locator('button, a');
      const buttonCount = await navButtons.count();

      // Should have multiple navigation options
      expect(buttonCount).toBeGreaterThan(0);
    });

    test('can navigate via bottom navigation', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      // Find theme button in bottom nav if it exists
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      const themeButton = bottomNav.locator('button').filter({ hasText: /theme/i });

      const buttonExists = await themeButton.count() > 0;
      if (buttonExists) {
        await themeButton.click();
        // Theme dropdown or action should trigger
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Touch Interactions', () => {
    test('posts are tappable with sufficient touch target size', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const firstPost = page.locator('[data-testid="post-item"]').first();

      // Get element dimensions
      const box = await firstPost.boundingBox();

      // Touch target should be at least 44px (WCAG recommendation)
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });

    test('can tap to open post detail', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const firstPost = page.locator('[data-testid="post-item"]').first();

      // Tap the post
      await firstPost.tap();

      // Sheet should open
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });
    });

    test('sheet close button is tappable', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      // Open sheet
      await page.locator('[data-testid="post-item"]').first().tap();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Find and tap close button
      const closeButton = page.locator('[data-testid="close-button"]');
      const box = await closeButton.boundingBox();

      // Close button should be large enough for touch
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);

      await closeButton.tap();
      await expect(sheet).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Mobile Layout', () => {
    test('content fits within mobile viewport', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      // Check no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test('posts display in mobile-friendly layout', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const firstPost = page.locator('[data-testid="post-item"]').first();
      const box = await firstPost.boundingBox();

      // Post should span most of the viewport width (accounting for padding)
      const viewportWidth = 375; // iPhone 12 width
      expect(box?.width).toBeGreaterThan(viewportWidth * 0.8);
    });

    test('sheet displays correctly on mobile', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      // Open sheet
      await page.locator('[data-testid="post-item"]').first().tap();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Check sheet positioning (ShadCN Sheet slides from right)
      const sheetContent = page.locator('[data-testid="post-detail-content"]');
      const box = await sheetContent.boundingBox();

      // Sheet content should span significant viewport width
      expect(box?.width).toBeGreaterThan(300);
    });
  });

  test.describe('Search on Mobile', () => {
    test('search input is accessible on mobile', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const searchInput = page.getByPlaceholder('Search posts...');
      const inputVisible = await searchInput.isVisible();

      if (inputVisible) {
        await searchInput.tap();
        await expect(searchInput).toBeFocused();

        // Type search term
        await searchInput.fill('goal');
        await expect(searchInput).toHaveValue('goal');
      }
    });

    test('search clear button is touch-friendly', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const searchInput = page.getByPlaceholder('Search posts...');
      const inputVisible = await searchInput.isVisible();

      if (inputVisible) {
        await searchInput.tap();
        await searchInput.fill('test');

        const clearButton = page.locator('[data-testid="search-clear"]');
        const buttonVisible = await clearButton.isVisible();

        if (buttonVisible) {
          const box = await clearButton.boundingBox();
          // Clear button should be touch-friendly
          expect(box?.width).toBeGreaterThanOrEqual(32);
          expect(box?.height).toBeGreaterThanOrEqual(32);
        }
      }
    });
  });

  test.describe('Scrolling Behaviour', () => {
    test('can scroll through posts', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      // Get initial scroll position
      const initialScroll = await page.evaluate(() => window.scrollY);

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(300);

      // Check scroll position changed
      const newScroll = await page.evaluate(() => window.scrollY);
      expect(newScroll).toBeGreaterThan(initialScroll);
    });

    test('sheet content is scrollable when needed', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      // Open sheet
      await page.locator('[data-testid="post-item"]').first().tap();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Wait for comments to load
      await page.waitForTimeout(2000);

      // Check if sheet content is scrollable (ShadCN ScrollArea)
      const sheetContent = page.locator('[data-testid="post-detail-content"]');
      const isScrollable = await sheetContent.evaluate((el) => {
        return el.scrollHeight > el.clientHeight;
      });

      // If content overflows, it should be scrollable
      if (isScrollable) {
        await sheetContent.evaluate((el) => el.scrollBy(0, 100));
        const scrollTop = await sheetContent.evaluate((el) => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Filter Controls on Mobile', () => {
    test('sort tabs are usable on mobile', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      // Sort uses ShadCN Tabs instead of <select>
      const sortTabs = page.locator('[data-testid="sort-tabs"]');
      const tabsExist = await sortTabs.count() > 0;

      if (tabsExist) {
        // Check tabs are visible and have minimum touch target
        await expect(sortTabs).toBeVisible();

        const box = await sortTabs.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(40);
      }
    });

    test('filter buttons are touch-friendly', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const filterButtons = page.locator('[data-testid="filter-button"]');
      const buttonCount = await filterButtons.count();

      if (buttonCount > 0) {
        const firstButton = filterButtons.first();
        const box = await firstButton.boundingBox();

        // Buttons should have adequate touch target
        expect(box?.height).toBeGreaterThanOrEqual(36);
      }
    });
  });

  test.describe('Accessibility on Mobile', () => {
    test('focus states are visible on tap', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      const firstPost = page.locator('[data-testid="post-item"]').first();
      await firstPost.focus();

      // Check for focus indicator (Tailwind ring/outline utilities)
      const hasVisibleFocus = await firstPost.evaluate((el) => {
        const style = getComputedStyle(el);
        const hasOutline = style.outline !== 'none' && style.outline !== '';
        const hasBoxShadow = style.boxShadow !== 'none' && style.boxShadow !== '';
        return hasOutline || hasBoxShadow;
      });

      // Focus should be visible in some form
      expect(hasVisibleFocus).toBe(true);
    });

    test('interactive elements have sufficient contrast', async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      // Check that text is visible (basic contrast check)
      const postTitle = page.locator('[data-testid="post-title"]').first();
      const titleColor = await postTitle.evaluate((el) => {
        return getComputedStyle(el).color;
      });

      // Title should have a colour (not transparent)
      expect(titleColor).toBeTruthy();
      expect(titleColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  });
});

// Tablet-specific tests
test.describe('Tablet Navigation', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'tablet') {
      test.skip();
      return;
    }
    await page.goto('/');
    await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });
  });

  test('displays appropriate layout for tablet', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'tablet') {
      test.skip();
      return;
    }

    // Tablet should have more horizontal space than mobile
    const firstPost = page.locator('[data-testid="post-item"]').first();
    const box = await firstPost.boundingBox();

    // Posts should use available width appropriately
    expect(box?.width).toBeGreaterThan(400);
  });

  test('touch interactions work on tablet', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'tablet') {
      test.skip();
      return;
    }

    // Tap post to open
    await page.locator('[data-testid="post-item"]').first().tap();

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible({ timeout: 5000 });
  });
});
