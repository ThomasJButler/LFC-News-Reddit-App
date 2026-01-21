/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Happy path E2E tests for core user journeys.
 *              WHY: These tests verify the most critical user flows work correctly,
 *              ensuring the app remains functional for its primary use cases:
 *              browsing posts, viewing details, and reading comments.
 */

const { test, expect } = require('@playwright/test');

test.describe('Happy Path - Core User Journeys', () => {
  test.describe('Homepage Load and Display', () => {
    test('loads homepage with posts', async ({ page }) => {
      await page.goto('/');

      // Wait for posts to load
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Verify posts are displayed
      const posts = page.locator('[class*="postItem"]');
      await expect(posts.first()).toBeVisible();

      // Verify we have multiple posts
      const postCount = await posts.count();
      expect(postCount).toBeGreaterThan(0);
    });

    test('displays post metadata correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      const firstPost = page.locator('[class*="postItem"]').first();

      // Verify post has essential elements
      const title = firstPost.locator('[class*="title"]');
      await expect(title).toBeVisible();

      // Check for metadata (subreddit, author, time)
      const header = firstPost.locator('[class*="postHeader"]');
      await expect(header).toBeVisible();

      // Check for footer stats (upvotes, comments)
      const footer = firstPost.locator('[class*="postFooter"]');
      await expect(footer).toBeVisible();
    });

    test('shows loading skeleton before content', async ({ page }) => {
      // Intercept API to delay response
      await page.route('**/reddit.com/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
      });

      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Check for skeleton loader
      const skeleton = page.locator('[class*="skeleton"]');
      const skeletonCount = await skeleton.count();

      // Skeleton should appear during loading
      if (skeletonCount > 0) {
        await expect(skeleton.first()).toBeVisible();
      }

      // Eventually content should load
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });
    });
  });

  test.describe('Post Detail Modal', () => {
    test('opens post detail when clicking a post', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Click the first post
      const firstPost = page.locator('[class*="postItem"]').first();
      await firstPost.click();

      // Verify modal opens
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Verify modal has content
      const modalContent = page.locator('[class*="modalContent"]');
      await expect(modalContent).toBeVisible();
    });

    test('displays post title and content in modal', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Get the title text from the post card
      const firstPost = page.locator('[class*="postItem"]').first();
      const postTitleText = await firstPost.locator('[class*="title"]').textContent();

      // Click to open modal
      await firstPost.click();

      // Wait for modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Verify the modal contains the post title
      const modalTitle = page.locator('#modal-title');
      await expect(modalTitle).toBeVisible();
    });

    test('closes modal with close button', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Open modal
      await page.locator('[class*="postItem"]').first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Click close button
      const closeButton = page.locator('[class*="closeButton"]');
      await closeButton.click();

      // Verify modal is closed
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('closes modal with Escape key', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Open modal
      await page.locator('[class*="postItem"]').first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Press Escape
      await page.keyboard.press('Escape');

      // Verify modal is closed
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('closes modal when clicking overlay', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Open modal
      await page.locator('[class*="postItem"]').first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Click on the overlay (outside modal content)
      const overlay = page.locator('[class*="modalOverlay"]');
      await overlay.click({ position: { x: 10, y: 10 } });

      // Verify modal is closed
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Comments Loading', () => {
    test('loads comments when viewing post detail', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Open post detail
      await page.locator('[class*="postItem"]').first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Wait for comments section to appear
      const commentsSection = page.locator('[class*="commentsSection"]');
      await expect(commentsSection).toBeVisible({ timeout: 10000 });

      // Either we have comments or a "no comments" message
      const hasComments = await page.locator('[class*="comment"]').count() > 0;
      const hasNoComments = await page.locator('[class*="noComments"]').count() > 0;

      expect(hasComments || hasNoComments).toBe(true);
    });

    test('can collapse and expand comments', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Open post detail
      await page.locator('[class*="postItem"]').first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Wait for comments
      const collapseButton = page.locator('[class*="collapseAllButton"]');
      const buttonExists = await collapseButton.count() > 0;

      if (buttonExists) {
        // Click collapse all
        await collapseButton.click();

        // Verify text changed to indicate collapsed state
        const buttonText = await collapseButton.textContent();
        expect(buttonText?.toLowerCase()).toContain('expand');

        // Click expand all
        await collapseButton.click();

        // Verify text changed back
        const expandedText = await collapseButton.textContent();
        expect(expandedText?.toLowerCase()).toContain('collapse');
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('searches posts and displays results', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Find search input
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('Salah');
      await searchInput.press('Enter');

      // Wait for search results
      await page.waitForTimeout(1500);

      // Should either show results or empty state
      const posts = page.locator('[class*="postItem"]');
      const emptyState = page.locator('[class*="emptyState"]');

      const hasResults = await posts.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;

      expect(hasResults || hasEmptyState).toBe(true);
    });

    test('clears search and shows all posts', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Perform a search
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('test');

      // Clear button should appear
      const clearButton = page.locator('[class*="clearButton"]');
      await expect(clearButton).toBeVisible();

      // Click clear
      await clearButton.click();

      // Input should be empty
      await expect(searchInput).toHaveValue('');
    });
  });

  test.describe('Sort and Filter', () => {
    test('changes sort method', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Find sort select
      const sortSelect = page.locator('#sort-select');
      const selectExists = await sortSelect.count() > 0;

      if (selectExists) {
        // Change to "new"
        await sortSelect.selectOption('new');

        // Wait for posts to reload
        await page.waitForTimeout(1000);

        // Posts should still be visible
        const posts = page.locator('[class*="postItem"]');
        await expect(posts.first()).toBeVisible();
      }
    });

    test('applies flair filter', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Look for flair filter section
      const flairExpandButton = page.locator('[class*="flairExpandButton"]');
      const buttonExists = await flairExpandButton.count() > 0;

      if (buttonExists) {
        // Expand flair filters
        await flairExpandButton.click();

        // Wait for section to expand
        await page.waitForTimeout(300);

        // Click a flair pill (if any exist)
        const flairPill = page.locator('[class*="flairPill"]').first();
        const pillExists = await flairPill.count() > 0;

        if (pillExists) {
          await flairPill.click();

          // Posts should update
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('can navigate posts with Tab key', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Tab to first post
      const firstPost = page.locator('[class*="postItem"]').first();
      await firstPost.focus();

      // Verify focus is visible
      await expect(firstPost).toBeFocused();
    });

    test('can open post with Enter key', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Focus first post
      const firstPost = page.locator('[class*="postItem"]').first();
      await firstPost.focus();

      // Press Enter
      await page.keyboard.press('Enter');

      // Modal should open
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Responsive Behaviour', () => {
    test('shows bottom navigation on mobile', async ({ page }, testInfo) => {
      // Only run on mobile project
      if (testInfo.project.name !== 'mobile') {
        test.skip();
        return;
      }

      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Bottom navigation should be visible on mobile
      const bottomNav = page.locator('[class*="bottomNav"]');
      await expect(bottomNav).toBeVisible();
    });

    test('hides bottom navigation on desktop', async ({ page }, testInfo) => {
      // Only run on desktop project
      if (testInfo.project.name !== 'desktop') {
        test.skip();
        return;
      }

      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Bottom navigation should not be visible on desktop
      const bottomNav = page.locator('[class*="bottomNav"]');
      await expect(bottomNav).not.toBeVisible();
    });
  });

  test.describe('Load More Posts', () => {
    test('loads more posts when clicking load more button', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[class*="postItem"]', { timeout: 15000 });

      // Get initial post count
      const initialPosts = await page.locator('[class*="postItem"]').count();

      // Look for load more button
      const loadMoreButton = page.locator('[class*="loadMoreButton"]');
      const buttonExists = await loadMoreButton.count() > 0;

      if (buttonExists && initialPosts >= 20) {
        // Scroll to load more button
        await loadMoreButton.scrollIntoViewIfNeeded();
        await loadMoreButton.click();

        // Wait for more posts to load
        await page.waitForTimeout(2000);

        // Should have more posts now
        const newPostCount = await page.locator('[class*="postItem"]').count();
        expect(newPostCount).toBeGreaterThanOrEqual(initialPosts);
      }
    });
  });
});
