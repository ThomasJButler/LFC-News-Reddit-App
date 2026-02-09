/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Visual regression tests for comment threading.
 *              WHY: Comment threading uses depth-based colours and collapse/expand
 *              functionality that must remain visually consistent across themes.
 *
 *              Updated for ShadCN rebuild:
 *              - Selectors use data-testid attributes
 *              - Comments use ShadCN Collapsible for collapse/expand
 *              - Badges use ShadCN Badge component
 *              - Themes: red, white, black (was red, white, green)
 */

const { test, expect } = require('@playwright/test');
const { THEMES, setThemeDirect, screenshotName, getDynamicContentMasks } = require('../helpers/theme');

test.describe('Comment Threading Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-item"]', { timeout: 10000 });
    // Open first post
    const firstPost = page.locator('[data-testid="post-item"]').first();
    await firstPost.click();
    // Wait for sheet and comments
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForSelector('[data-testid="comment"]', { timeout: 10000 });
  });

  test.describe('Thread Lines', () => {
    for (const theme of THEMES) {
      test(`thread line colours in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Find a nested comment to show thread lines
        const nestedComment = page.locator('[data-testid="comment"]').nth(1);
        await nestedComment.scrollIntoViewIfNeeded();

        // WHY: Mask dynamic content to prevent flaky tests from changing timestamps/scores
        const masks = getDynamicContentMasks(page);

        // Capture the comment with thread line
        await expect(nestedComment).toHaveScreenshot(
          screenshotName('comment-thread-line', theme, testInfo.project.name),
          { mask: masks }
        );
      });
    }
  });

  test.describe('Collapsed State', () => {
    for (const theme of THEMES) {
      test(`collapsed comment in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // Find and click a collapse button (ShadCN Collapsible trigger)
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

        // Look for OP badge or moderator badge (ShadCN Badge component)
        const badge = page.locator('[data-testid="op-badge"], [data-testid="mod-badge"]').first();
        if (await badge.count() > 0) {
          await badge.scrollIntoViewIfNeeded();
          const commentHeader = badge.locator('..');

          // Mask dynamic content
          const masks = getDynamicContentMasks(page);

          await expect(commentHeader).toHaveScreenshot(
            screenshotName('comment-badge', theme, testInfo.project.name),
            { mask: masks }
          );
        } else {
          // No badges on this post, skip
          test.skip();
        }
      });
    }
  });

  test.describe('Deep Nesting', () => {
    for (const theme of THEMES) {
      test(`deeply nested comments (5+ levels) in ${theme} theme`, async ({ page }, testInfo) => {
        await setThemeDirect(page, theme);

        // WHY: Test visual appearance of deeply nested comments to verify indentation
        // caps correctly (max 6 levels per comment-threading-polish.md spec)
        // Look for comments with high nesting level
        const deepComments = page.locator('[data-testid="comment"]');
        const count = await deepComments.count();

        // Find a deeply nested comment by checking left margin/padding
        let foundDeepComment = false;
        for (let i = 0; i < Math.min(count, 20); i++) {
          const comment = deepComments.nth(i);
          const paddingLeft = await comment.evaluate(el => {
            // Check the computed padding/margin left to find deeply nested comments
            const style = window.getComputedStyle(el);
            return parseInt(style.paddingLeft || '0', 10) + parseInt(style.marginLeft || '0', 10);
          });

          // If padding is significant (indicating deep nesting), capture it
          if (paddingLeft > 60) { // ~3+ levels on mobile, ~2+ on desktop
            await comment.scrollIntoViewIfNeeded();

            // Mask dynamic content
            const masks = getDynamicContentMasks(page);

            await expect(comment).toHaveScreenshot(
              screenshotName('comments-deep', theme, testInfo.project.name),
              { mask: masks }
            );
            foundDeepComment = true;
            break;
          }
        }

        if (!foundDeepComment) {
          // No deeply nested comments found in this post
          test.skip();
        }
      });
    }
  });
});
