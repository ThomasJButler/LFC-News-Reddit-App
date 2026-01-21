/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Visual regression tests for comment threading.
 *              WHY: Comment threading uses depth-based colours and collapse/expand
 *              functionality that must remain visually consistent across themes.
 */

const { test, expect } = require('@playwright/test');
const { THEMES, setThemeDirect, screenshotName } = require('../helpers/theme');

test.describe('Comment Threading Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    // Wait for posts to load
    await page.waitForSelector('[class*="postItem"]', { timeout: 10000 });
    // Open first post
    const firstPost = page.locator('[class*="postItem"]').first();
    await firstPost.click();
    // Wait for modal and comments
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForSelector('[class*="comment"]', { timeout: 10000 });
  });

  test.describe('Thread Lines', () => {
    for (const theme of THEMES) {
      test(`thread line colours in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Find a nested comment to show thread lines
        const nestedComment = page.locator('[class*="comment"]').nth(1);
        await nestedComment.scrollIntoViewIfNeeded();

        // Capture the comment with thread line
        await expect(nestedComment).toHaveScreenshot(
          screenshotName('comment-thread-line', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('Collapsed State', () => {
    for (const theme of THEMES) {
      test(`collapsed comment in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Find and click a collapse button
        const collapseButton = page.getByRole('button', { name: /Toggle comment thread/i }).first();
        await collapseButton.click();

        // Wait for collapse animation
        await page.waitForTimeout(350);

        // Get the comment container
        const commentContainer = collapseButton.locator('..').locator('..');
        await expect(commentContainer).toHaveScreenshot(
          screenshotName('comment-collapsed', theme, testInfo.project.name)
        );
      });
    }
  });

  test.describe('User Badges', () => {
    for (const theme of THEMES) {
      test(`comment badges in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Look for OP badge or moderator badge
        const badge = page.locator('[class*="opBadge"], [class*="distinguished"]').first();
        if (await badge.count() > 0) {
          await badge.scrollIntoViewIfNeeded();
          const commentHeader = badge.locator('..');
          await expect(commentHeader).toHaveScreenshot(
            screenshotName('comment-badge', theme, testInfo.project.name)
          );
        } else {
          // No badges on this post, skip
          test.skip();
        }
      });
    }
  });
});
