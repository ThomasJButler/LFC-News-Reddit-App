/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Visual regression tests for the post detail sheet.
 *              WHY: The post detail sheet is a complex component with reading mode,
 *              gallery navigation, and various media types that need visual testing.
 *
 *              Updated for ShadCN rebuild:
 *              - Post detail uses ShadCN Sheet (slides from right) instead of modal
 *              - Selectors use data-testid attributes
 *              - Sheet content uses ShadCN ScrollArea
 *              - Themes: red, white, black (was red, white, green)
 */

import { test, expect } from '@playwright/test';
import { THEMES, setThemeDirect, screenshotName, getDynamicContentMasks } from '../helpers/theme.js';
import { mockApiResponses } from '../helpers/api-mock.js';

test.describe('Post Detail Sheet Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponses(page);
    // Navigate to home page
    await page.goto('/');
    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-item"]', { timeout: 10000 });
  });

  /**
   * Helper to open a post detail sheet
   */
  async function openPostDetail(page) {
    const firstPost = page.locator('[data-testid="post-item"]').first();
    await firstPost.click();
    // Wait for sheet to open (ShadCN Sheet uses role="dialog")
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  }

  test.describe('Sheet Open State', () => {
    for (const theme of THEMES) {
      test(`sheet renders correctly in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);
        await openPostDetail(page);

        // WHY: Mask dynamic content to prevent flaky tests
        const masks = getDynamicContentMasks(page);

        const sheet = page.locator('[role="dialog"]');
        await expect(sheet).toHaveScreenshot(
          screenshotName('post-detail-sheet', theme, testInfo.project.name),
          { mask: masks }
        );
      });
    }
  });

  test.describe('Reading Mode', () => {
    for (const theme of THEMES) {
      test(`reading mode in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);
        await openPostDetail(page);

        // Toggle reading mode
        const readingModeButton = page.getByRole('button', { name: /reading mode/i });
        await readingModeButton.click();

        // Wait for transition
        await page.waitForTimeout(350);

        const sheet = page.locator('[role="dialog"]');
        await expect(sheet).toHaveScreenshot(
          screenshotName('post-detail-reading-mode', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Comments Loading State', () => {
    for (const theme of THEMES) {
      test(`comments loading skeleton in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Click post quickly to capture loading state
        const firstPost = page.locator('[data-testid="post-item"]').first();
        await firstPost.click();

        // Try to capture the comments skeleton
        const commentsSkeleton = page.locator('[data-testid="comments-skeleton"]');
        if (await commentsSkeleton.count() > 0) {
          await expect(commentsSkeleton.first()).toHaveScreenshot(
            screenshotName('post-detail-comments-skeleton', theme, testInfo.project.name)
          );
        } else {
          // Comments loaded too fast, skip this iteration
          test.skip();
        }
      });
    }
  });

  test.describe('Comments Loaded State', () => {
    for (const theme of THEMES) {
      test(`comments section in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);
        await openPostDetail(page);

        // Wait for comments to load
        await page.waitForSelector('[data-testid="comment"]', { timeout: 10000 });

        // Scroll to comments section
        const commentsSection = page.locator('[data-testid="comments-section"]');
        await commentsSection.scrollIntoViewIfNeeded();

        // Mask dynamic content
        const masks = getDynamicContentMasks(page);

        await expect(commentsSection).toHaveScreenshot(
          screenshotName('post-detail-comments', theme, testInfo.project.name),
          { mask: masks }
        );
      });
    }
  });

  test.describe('Sheet Overlay', () => {
    for (const theme of THEMES) {
      test(`overlay background in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);
        await openPostDetail(page);

        // Mask dynamic content
        const masks = getDynamicContentMasks(page);

        // Capture full page to show overlay effect
        await expect(page).toHaveScreenshot(
          screenshotName('post-detail-overlay', theme, testInfo.project.name),
          { fullPage: true, mask: masks }
        );
      });
    }
  });
});
