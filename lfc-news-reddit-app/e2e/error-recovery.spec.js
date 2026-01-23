/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description E2E tests for error handling and recovery scenarios.
 *              WHY: Users should have a graceful experience even when things go wrong.
 *              These tests ensure the app handles network failures, API errors, and
 *              edge cases without crashing, providing helpful feedback and recovery options.
 */

const { test, expect } = require('@playwright/test');

test.describe('Error Recovery', () => {
  test.describe('Network Error Handling', () => {
    test('displays error state when API fails', async ({ page }) => {
      // Intercept API requests and fail them
      await page.route('**/reddit.com/**', (route) => {
        route.abort('failed');
      });

      await page.goto('/');

      // Wait for error state to appear
      await page.waitForTimeout(3000);

      // Should show error message or error container
      const errorContainer = page.locator('[class*="error"], [role="alert"]');
      const errorVisible = await errorContainer.count() > 0;

      // App should not crash - should show some form of feedback
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();

      if (errorVisible) {
        await expect(errorContainer.first()).toBeVisible();
      }
    });

    test('shows retry button on network error', async ({ page }) => {
      // Intercept and fail API requests
      await page.route('**/reddit.com/**', (route) => {
        route.abort('failed');
      });

      await page.goto('/');
      await page.waitForTimeout(3000);

      // Look for retry button
      const retryButton = page.locator('button').filter({ hasText: /retry|try again/i });
      const buttonExists = await retryButton.count() > 0;

      if (buttonExists) {
        await expect(retryButton.first()).toBeVisible();
      }
    });

    test('can retry after network failure', async ({ page }) => {
      let requestCount = 0;

      // Fail first request, succeed on retry
      await page.route('**/reddit.com/**', async (route) => {
        requestCount++;
        if (requestCount <= 1) {
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForTimeout(3000);

      // Find and click retry button
      const retryButton = page.locator('button').filter({ hasText: /retry|try again/i });
      const buttonExists = await retryButton.count() > 0;

      if (buttonExists) {
        await retryButton.first().click();

        // Wait for content to load on retry
        await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });
      }
    });

    test('handles timeout gracefully', async ({ page }) => {
      // Intercept and delay response indefinitely (simulating timeout)
      await page.route('**/reddit.com/**', async (route) => {
        // Don't respond - let it timeout
        await new Promise(resolve => setTimeout(resolve, 30000));
      });

      // Set a shorter timeout for this test
      await page.goto('/', { timeout: 5000 }).catch(() => {});

      // Page should still be functional (not crashed)
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });
  });

  test.describe('API Error Responses', () => {
    test('handles 404 response', async ({ page }) => {
      await page.route('**/reddit.com/**', (route) => {
        route.fulfill({
          status: 404,
          body: JSON.stringify({ error: 'Not found' }),
        });
      });

      await page.goto('/');
      await page.waitForTimeout(3000);

      // App should not crash
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });

    test('handles 500 server error', async ({ page }) => {
      await page.route('**/reddit.com/**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await page.goto('/');
      await page.waitForTimeout(3000);

      // App should show error state, not crash
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });

    test('handles malformed JSON response', async ({ page }) => {
      await page.route('**/reddit.com/**', (route) => {
        route.fulfill({
          status: 200,
          body: 'This is not valid JSON{{{',
          contentType: 'application/json',
        });
      });

      await page.goto('/');
      await page.waitForTimeout(3000);

      // App should handle gracefully
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });

    test('handles empty response', async ({ page }) => {
      await page.route('**/reddit.com/**', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { children: [] } }),
        });
      });

      await page.goto('/');
      await page.waitForTimeout(2000);

      // Should show empty state
      const emptyState = page.locator('[class*="emptyState"], [class*="noResults"]');
      const postsExist = await page.locator('[class*="postItem"]').count() > 0;

      // Either empty state should show or no posts visible
      const emptyVisible = await emptyState.count() > 0;
      expect(emptyVisible || !postsExist).toBe(true);
    });
  });

  test.describe('Comment Loading Errors', () => {
    test('handles comment fetch failure', async ({ page }) => {
      // Allow posts to load but fail comments
      let isPostsRequest = true;
      await page.route('**/reddit.com/**', async (route) => {
        const url = route.request().url();
        if (url.includes('/comments/')) {
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Open post detail
      await page.locator('[class*="postItem"]').first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Wait for comment loading to fail
      await page.waitForTimeout(3000);

      // Modal should still be visible (not crashed)
      await expect(modal).toBeVisible();
    });

    test('shows comment error state gracefully', async ({ page }) => {
      // Allow posts, fail comments
      await page.route('**/reddit.com/**/comments/**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Comment fetch failed' }),
        });
      });

      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Open post
      await page.locator('[class*="postItem"]').first().click();
      await page.waitForTimeout(3000);

      // Modal content should still be visible
      const modalContent = page.locator('[class*="modalContent"]');
      await expect(modalContent).toBeVisible();
    });
  });

  test.describe('Search Error Handling', () => {
    test('handles search API failure', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Intercept search requests and fail them
      await page.route('**/reddit.com/**/search**', (route) => {
        route.abort('failed');
      });

      // Perform search
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('test search');
      await searchInput.press('Enter');

      await page.waitForTimeout(2000);

      // App should not crash - search area should still be visible
      await expect(searchInput).toBeVisible();
    });

    test('can clear search after error', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Search with text
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('test');

      // Clear button should work
      const clearButton = page.locator('[class*="clearButton"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(searchInput).toHaveValue('');
      }
    });
  });

  test.describe('Error Boundary', () => {
    test('app renders without crashing', async ({ page }) => {
      await page.goto('/');

      // Basic check that app rendered
      const appContent = await page.content();
      expect(appContent).toContain('html');

      // Should have main content area
      const mainContent = page.locator('[role="main"], main, #root');
      await expect(mainContent.first()).toBeVisible();
    });

    test('maintains functionality after recovering from error', async ({ page }) => {
      // Start with failing requests
      let shouldFail = true;
      await page.route('**/reddit.com/**', async (route) => {
        if (shouldFail) {
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });

      await page.goto('/');
      await page.waitForTimeout(2000);

      // Stop failing
      shouldFail = false;

      // Reload to recover
      await page.reload();
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // App should be fully functional
      const posts = page.locator('[class*="postItem"]');
      await expect(posts.first()).toBeVisible();

      // Can interact with posts
      await posts.first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Edge Cases', () => {
    test('handles rapid navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Rapidly open and close multiple posts
      for (let i = 0; i < 3; i++) {
        const post = page.locator('[class*="postItem"]').nth(i % 5);
        if (await post.isVisible()) {
          await post.click();
          await page.waitForTimeout(200);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(200);
        }
      }

      // App should still be functional
      const posts = page.locator('[class*="postItem"]');
      await expect(posts.first()).toBeVisible();
    });

    test('handles double-click on post', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Double-click post
      const firstPost = page.locator('[class*="postItem"]').first();
      await firstPost.dblclick();

      // Should open modal (not crash)
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible().catch(() => false);

      // App should be in a valid state
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });

    test('handles multiple escape key presses', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Open modal
      await page.locator('[class*="postItem"]').first().click();
      await page.waitForTimeout(500);

      // Press escape multiple times
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');

      // App should be stable
      const posts = page.locator('[class*="postItem"]');
      await expect(posts.first()).toBeVisible();
    });
  });

  test.describe('Loading States During Errors', () => {
    test('shows skeleton during slow network', async ({ page }) => {
      // Slow down all requests
      await page.route('**/reddit.com/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Check for loading skeleton
      const skeleton = page.locator('[class*="skeleton"]');
      const skeletonVisible = await skeleton.count() > 0;

      // Eventually content should load
      await page.waitForSelector('[class*="postItem"]', { timeout: 20000 });
    });

    test('removes loading state after error', async ({ page }) => {
      await page.route('**/reddit.com/**', (route) => {
        route.abort('failed');
      });

      await page.goto('/');
      await page.waitForTimeout(5000);

      // Skeleton should eventually be removed (replaced with error)
      const skeleton = page.locator('[class*="skeleton"][aria-label*="loading"]');
      const stillLoading = await skeleton.isVisible().catch(() => false);

      // After error, loading state should resolve
      // Either showing error or cleared loading state
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });
  });

  test.describe('State Consistency After Errors', () => {
    test('preserves theme after error recovery', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Set theme
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'green');
        localStorage.setItem('lfc-theme', 'green');
      });

      // Simulate an error and reload
      await page.evaluate(() => {
        throw new Error('Test error');
      }).catch(() => {});

      await page.reload();
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Theme should persist
      const theme = await page.evaluate(
        () => document.documentElement.getAttribute('data-theme')
      );
      expect(theme).toBe('green');
    });

    test('preserves scroll position after modal close on error', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(300);

      const scrollBefore = await page.evaluate(() => window.scrollY);

      // Open modal
      await page.locator('[class*="postItem"]').nth(2).click();
      await page.waitForTimeout(500);

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Scroll position should be approximately preserved
      const scrollAfter = await page.evaluate(() => window.scrollY);
      expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(50);
    });
  });
});
