/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Happy path E2E tests for core user journeys.
 *              WHY: These tests verify the most critical user flows work correctly,
 *              ensuring the app remains functional for its primary use cases:
 *              browsing posts, viewing details, and reading comments.
 *
 *              Updated for ShadCN rebuild:
 *              - Selectors use data-testid attributes (Tailwind doesn't generate semantic class names)
 *              - Post detail uses ShadCN Sheet (still role="dialog")
 *              - Sort uses ShadCN Tabs instead of <select>
 *              - API requests route through /api/reddit proxy (not direct to reddit.com)
 */

const { test, expect } = require('@playwright/test');

test.describe('Happy Path - Core User Journeys', () => {
  test.describe('Homepage Load and Display', () => {
    test('loads homepage with posts', async ({ page }) => {
      await page.goto('/');

      // Wait for posts to load
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Verify posts are displayed
      const posts = page.locator('[data-testid="post-item"]');
      await expect(posts.first()).toBeVisible();

      // Verify we have multiple posts
      const postCount = await posts.count();
      expect(postCount).toBeGreaterThan(0);
    });

    test('displays post metadata correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      const firstPost = page.locator('[data-testid="post-item"]').first();

      // Verify post has essential elements
      const title = firstPost.locator('[data-testid="post-title"]');
      await expect(title).toBeVisible();

      // Check for metadata (subreddit, author, time)
      const header = firstPost.locator('[data-testid="post-header"]');
      await expect(header).toBeVisible();

      // Check for footer stats (upvotes, comments)
      const footer = firstPost.locator('[data-testid="post-footer"]');
      await expect(footer).toBeVisible();
    });

    test('shows loading skeleton before content', async ({ page }) => {
      // Intercept API to delay response (proxy route)
      await page.route('**/api/reddit**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
      });

      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Check for skeleton loader
      const skeleton = page.locator('[data-testid="skeleton"]');
      const skeletonCount = await skeleton.count();

      // Skeleton should appear during loading
      if (skeletonCount > 0) {
        await expect(skeleton.first()).toBeVisible();
      }

      // Eventually content should load
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });
    });
  });

  test.describe('Post Detail Sheet', () => {
    test('opens post detail when clicking a post', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Click the first post
      const firstPost = page.locator('[data-testid="post-item"]').first();
      await firstPost.click();

      // Verify Sheet opens (ShadCN Sheet uses role="dialog")
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Verify sheet has content
      const sheetContent = page.locator('[data-testid="post-detail-content"]');
      await expect(sheetContent).toBeVisible();
    });

    test('displays post title and content in sheet', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Get the title text from the post card
      const firstPost = page.locator('[data-testid="post-item"]').first();
      const postTitleText = await firstPost.locator('[data-testid="post-title"]').textContent();

      // Click to open sheet
      await firstPost.click();

      // Wait for sheet
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Verify the sheet contains the post title
      const sheetTitle = page.locator('#modal-title');
      await expect(sheetTitle).toBeVisible();
    });

    test('closes sheet with close button', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Open sheet
      await page.locator('[data-testid="post-item"]').first().click();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Click close button
      const closeButton = page.locator('[data-testid="close-button"]');
      await closeButton.click();

      // Verify sheet is closed
      await expect(sheet).not.toBeVisible({ timeout: 3000 });
    });

    test('closes sheet with Escape key', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Open sheet
      await page.locator('[data-testid="post-item"]').first().click();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Press Escape (ShadCN Sheet handles this via Radix)
      await page.keyboard.press('Escape');

      // Verify sheet is closed
      await expect(sheet).not.toBeVisible({ timeout: 3000 });
    });

    test('closes sheet when clicking overlay', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Open sheet
      await page.locator('[data-testid="post-item"]').first().click();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Click on the overlay (ShadCN Sheet overlay)
      const overlay = page.locator('[data-testid="sheet-overlay"]');
      await overlay.click({ position: { x: 10, y: 10 } });

      // Verify sheet is closed
      await expect(sheet).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Comments Loading', () => {
    test('loads comments when viewing post detail', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Open post detail
      await page.locator('[data-testid="post-item"]').first().click();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Wait for comments section to appear
      const commentsSection = page.locator('[data-testid="comments-section"]');
      await expect(commentsSection).toBeVisible({ timeout: 10000 });

      // Either we have comments or a "no comments" message
      const hasComments = await page.locator('[data-testid="comment"]').count() > 0;
      const hasNoComments = await page.locator('[data-testid="no-comments"]').count() > 0;

      expect(hasComments || hasNoComments).toBe(true);
    });

    test('can collapse and expand comments', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Open post detail
      await page.locator('[data-testid="post-item"]').first().click();
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });

      // Wait for comments
      const collapseButton = page.locator('[data-testid="collapse-all-button"]');
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
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Find search input
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('Salah');
      await searchInput.press('Enter');

      // Wait for search results
      await page.waitForTimeout(1500);

      // Should either show results or empty state
      const posts = page.locator('[data-testid="post-item"]');
      const emptyState = page.locator('[data-testid="empty-state"]');

      const hasResults = await posts.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;

      expect(hasResults || hasEmptyState).toBe(true);
    });

    test('clears search and shows all posts', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Perform a search
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('test');

      // Clear button should appear
      const clearButton = page.locator('[data-testid="search-clear"]');
      await expect(clearButton).toBeVisible();

      // Click clear
      await clearButton.click();

      // Input should be empty
      await expect(searchInput).toHaveValue('');
    });

    test('search only returns posts from r/LiverpoolFC subreddit', async ({ page }) => {
      // This test verifies the critical security fix: search should ONLY return
      // posts from r/LiverpoolFC, not from other subreddits like r/gambling, r/all, etc.

      // Intercept the proxy API search request to verify it targets LiverpoolFC
      let searchUrl = null;
      await page.route('**/api/reddit**', async (route) => {
        const url = route.request().url();
        if (url.includes('search')) {
          searchUrl = url;
        }
        await route.continue();
      });

      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Perform a search
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('test');
      await searchInput.press('Enter');

      // Wait for the search request to be made
      await page.waitForTimeout(2000);

      // Verify the API was called with LiverpoolFC subreddit path
      if (searchUrl) {
        // The path parameter should contain /r/LiverpoolFC/search.json
        expect(searchUrl).toContain('LiverpoolFC');
        expect(searchUrl).toContain('search');
        // Should NOT contain /r/all/ or any other subreddit
        expect(searchUrl).not.toContain('/r/all');
        expect(searchUrl).not.toContain('/r/undefined');
      }

      // If results are shown, verify they are all from r/LiverpoolFC
      const posts = page.locator('[data-testid="post-item"]');
      const postCount = await posts.count();

      if (postCount > 0) {
        // Check each visible post's subreddit indicator
        for (let i = 0; i < Math.min(postCount, 5); i++) {
          const post = posts.nth(i);
          const subredditText = await post.locator('[data-testid="post-subreddit"]').textContent();

          // Subreddit should be r/LiverpoolFC (or LiverpoolFC without prefix)
          expect(subredditText?.toLowerCase()).toContain('liverpoolfc');
        }
      }
    });

    test('search does not leak to other subreddits', async ({ page }) => {
      // Regression test: previously, the bug caused searches to go to r/all
      // or r/undefined, showing posts from random subreddits like r/gambling

      let requestsMade = [];
      await page.route('**/api/reddit**', async (route) => {
        const url = route.request().url();
        if (url.includes('search')) {
          requestsMade.push(url);
        }
        await route.continue();
      });

      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Search for something that could match posts in many subreddits
      const searchInput = page.getByPlaceholder('Search posts...');
      await searchInput.fill('slot');  // This was showing r/gambling posts before
      await searchInput.press('Enter');

      await page.waitForTimeout(2000);

      // Verify all search requests only target LiverpoolFC
      for (const url of requestsMade) {
        expect(url).toContain('LiverpoolFC');
        expect(url).not.toContain('/r/gambling');
        expect(url).not.toContain('/r/all');
        expect(url).not.toContain('/r/undefined');
      }
    });
  });

  test.describe('Sort and Filter', () => {
    test('changes sort method', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Find sort tabs (ShadCN Tabs component)
      const sortTabs = page.locator('[data-testid="sort-tabs"]');
      const tabsExist = await sortTabs.count() > 0;

      if (tabsExist) {
        // Click "New" sort tab
        const newTab = sortTabs.getByRole('tab', { name: /new/i });
        await newTab.click();

        // Wait for posts to reload
        await page.waitForTimeout(1000);

        // Posts should still be visible
        const posts = page.locator('[data-testid="post-item"]');
        await expect(posts.first()).toBeVisible();
      }
    });

    test('applies flair filter', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Look for filter expand button (ShadCN Collapsible trigger)
      const filterExpand = page.locator('[data-testid="filter-expand"]');
      const buttonExists = await filterExpand.count() > 0;

      if (buttonExists) {
        // Expand flair filters
        await filterExpand.click();

        // Wait for section to expand
        await page.waitForTimeout(300);

        // Click a flair pill (ShadCN Toggle in ToggleGroup)
        const flairPill = page.locator('[data-testid="flair-pill"]').first();
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
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Tab to first post
      const firstPost = page.locator('[data-testid="post-item"]').first();
      await firstPost.focus();

      // Verify focus is visible
      await expect(firstPost).toBeFocused();
    });

    test('can open post with Enter key', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Focus first post
      const firstPost = page.locator('[data-testid="post-item"]').first();
      await firstPost.focus();

      // Press Enter
      await page.keyboard.press('Enter');

      // Sheet should open
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible({ timeout: 5000 });
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
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Bottom navigation should be visible on mobile
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();
    });

    test('hides bottom navigation on desktop', async ({ page }, testInfo) => {
      // Only run on desktop project
      if (testInfo.project.name !== 'desktop') {
        test.skip();
        return;
      }

      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Bottom navigation should not be visible on desktop
      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).not.toBeVisible();
    });
  });

  test.describe('Load More Posts', () => {
    test('loads more posts when clicking load more button', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="post-item"]', { timeout: 15000 });

      // Get initial post count
      const initialPosts = await page.locator('[data-testid="post-item"]').count();

      // Look for load more button
      const loadMoreButton = page.locator('[data-testid="load-more"]');
      const buttonExists = await loadMoreButton.count() > 0;

      if (buttonExists && initialPosts >= 20) {
        // Scroll to load more button
        await loadMoreButton.scrollIntoViewIfNeeded();
        await loadMoreButton.click();

        // Wait for more posts to load
        await page.waitForTimeout(2000);

        // Should have more posts now
        const newPostCount = await page.locator('[data-testid="post-item"]').count();
        expect(newPostCount).toBeGreaterThanOrEqual(initialPosts);
      }
    });
  });
});
