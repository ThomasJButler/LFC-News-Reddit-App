# Visual Regression Testing with Playwright

## Overview

Implement visual regression testing to catch unintended UI changes. Capture screenshots across viewports and themes to ensure visual consistency.

## Requirements

### Test Infrastructure

#### Dependencies
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

#### Config File: `playwright.config.js`

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  snapshotDir: './__screenshots__',
  updateSnapshots: 'missing',

  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.1,
    },
  },

  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'desktop',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  webServer: {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Viewport Configurations

| Name | Width | Height | Device |
|------|-------|--------|--------|
| Mobile | 375 | 812 | iPhone 12 |
| Tablet | 768 | 1024 | iPad |
| Desktop | 1440 | 900 | Standard |

### Theme Coverage

Each visual test runs in all 4 themes:
- `red` (default - Anfield Red)
- `white` (Away Day)
- `green` (Keeper Kit)
- `night` (OLED Dark)

### Pages/States to Capture

#### 1. Home (Post List)
- `home-loaded` - With posts visible
- `home-loading` - Skeleton state
- `home-empty` - No posts message
- `home-error` - Error state with retry

#### 2. Post Detail Modal
- `detail-text` - Text post
- `detail-image` - Image post
- `detail-video` - Video post (paused)
- `detail-gallery` - Gallery post
- `detail-reading` - Reading mode enabled

#### 3. Comments
- `comments-normal` - Standard view
- `comments-collapsed` - Some threads collapsed
- `comments-deep` - Deep nesting visible

#### 4. Components (Isolated)
- `header` - Header component
- `filter` - SubredditFilter expanded
- `post-item` - Single post card
- `search` - SearchBar focused
- `theme-switcher` - Theme options visible

### Snapshot Naming Convention

```
{page}-{state}-{viewport}-{theme}.png
```

Examples:
- `home-loaded-mobile-red.png`
- `detail-image-desktop-night.png`
- `comments-collapsed-tablet-white.png`

### Test File Structure

```
e2e/
├── visual/
│   ├── home.spec.js
│   ├── post-detail.spec.js
│   ├── comments.spec.js
│   └── components.spec.js
└── utils/
    └── themes.js  # Theme switching helpers
```

### Theme Switching Helper

```javascript
// e2e/utils/themes.js
export const themes = ['red', 'white', 'green', 'night'];

export async function setTheme(page, theme) {
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('lfc-theme', t);
  }, theme);
  // Wait for theme transition
  await page.waitForTimeout(350);
}

export async function forEachTheme(page, testFn) {
  for (const theme of themes) {
    await setTheme(page, theme);
    await testFn(theme);
  }
}
```

### Example Test

```javascript
// e2e/visual/home.spec.js
import { test, expect } from '@playwright/test';
import { forEachTheme } from '../utils/themes';

test.describe('Home Page', () => {
  test('loaded state across themes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="post-list"]');

    await forEachTheme(page, async (theme) => {
      await expect(page).toHaveScreenshot(`home-loaded-${theme}.png`);
    });
  });

  test('loading skeleton', async ({ page }) => {
    // Intercept API to delay response
    await page.route('**/api/**', (route) => {
      setTimeout(() => route.continue(), 5000);
    });

    await page.goto('/');

    await forEachTheme(page, async (theme) => {
      await expect(page).toHaveScreenshot(`home-loading-${theme}.png`);
    });
  });
});
```

### Masking Dynamic Content

```javascript
// Mask timestamps and scores that change
await expect(page).toHaveScreenshot('home-loaded.png', {
  mask: [
    page.locator('[data-testid="post-score"]'),
    page.locator('[data-testid="post-time"]'),
    page.locator('[data-testid="comment-score"]'),
  ],
});
```

### CI Integration (GitHub Actions)

```yaml
# .github/workflows/visual-tests.yml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: lfc-news-reddit-app/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: lfc-news-reddit-app

      - name: Install Playwright
        run: npx playwright install chromium
        working-directory: lfc-news-reddit-app

      - name: Run visual tests
        run: npx playwright test
        working-directory: lfc-news-reddit-app

      - name: Upload diff artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diff
          path: lfc-news-reddit-app/__screenshots__/*-diff.png
```

### npm Scripts to Add

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:update": "playwright test --update-snapshots",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Acceptance Criteria

- [ ] Playwright configured with 3 viewport projects
- [ ] Theme switching helper works correctly
- [ ] Home page visual tests pass (4 themes × 3 viewports)
- [ ] Post detail visual tests pass
- [ ] Comments visual tests pass
- [ ] Component visual tests pass
- [ ] Dynamic content properly masked
- [ ] CI workflow runs visual tests on PR
- [ ] Clear documentation for updating baselines
- [ ] Diff images uploaded as artifacts on failure
