/**
 * API mocking helpers for E2E tests.
 * WHY: Visual tests need deterministic data to prevent flaky screenshots.
 * Using mock data also eliminates Reddit API rate limiting issues during
 * parallel test execution.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mockPostsData = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/mock-posts.json'), 'utf-8')
);
const mockCommentsData = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/mock-comments.json'), 'utf-8')
);

/**
 * Intercepts all /api/reddit requests and returns mock data.
 * Use this in visual tests and any test that doesn't need real API data.
 * @param {import('@playwright/test').Page} page
 */
export async function mockApiResponses(page) {
  await page.route('**/api/reddit**', async (route) => {
    const url = route.request().url();

    if (url.includes('comments')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCommentsData),
      });
    } else if (url.includes('search')) {
      // Return the same posts for search results
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPostsData),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPostsData),
      });
    }
  });
}

export { mockPostsData, mockCommentsData };
