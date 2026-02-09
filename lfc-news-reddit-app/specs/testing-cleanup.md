# Testing & Cleanup

## Why
After migrating from CRA to Vite, the test runner changes from Jest (via react-scripts) to Vitest. Old CSS Module files and CRA artifacts need to be cleaned up. This is the final phase — everything should work before we clean up.

## Test Migration: Jest → Vitest

### Vitest Configuration
Add test config to `vite.config.js`:
```javascript
export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
```

Create/update `src/setupTests.js`:
```javascript
import '@testing-library/jest-dom'
```

Add devDependencies:
- `vitest`
- `@vitest/coverage-v8` (for coverage reports)
- `jsdom`

Update package.json scripts:
```json
{
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "test:ci": "vitest --run --coverage"
}
```

### Existing Tests to Migrate
Vitest is API-compatible with Jest. These tests should work with minimal changes:

**Redux tests** (`src/redux/__tests__/`):
- `posts.actions.test.js` — tests post action creators
- `posts.reducer.test.js` — tests post reducer logic
- `comments.actions.test.js` — tests comment action creators
- `comments.reducer.test.js` — tests comment reducer logic
- These use `redux-mock-store` and test pure functions — no changes expected

**Utility tests** (`src/utils/__tests__/`):
- `api.test.js` — tests API functions (will need updates after api.js simplification)
- `cache.test.js` — tests caching logic
- `colorHash.test.js` — tests color hashing
- `formatDuration.test.js` — tests duration formatting
- `formatTime.test.js` — tests time formatting
- `sanitize.test.js` — tests URL/HTML sanitization
- These test pure functions — minimal changes expected

**Potential changes needed:**
- Update `import` paths if module resolution changes
- `api.test.js` will need to be rewritten to match the simplified api.js (no more proxy chain testing)
- Remove `transformIgnorePatterns` from config (Vite handles ESM natively)

### E2E Tests (Playwright)
Update `playwright.config.js`:
- Change dev server port from 3000 (CRA) to 5173 (Vite)
- Update webServer command from `npm start` to `npm run dev`
- Update baseURL from `http://localhost:3000` to `http://localhost:5173`

```javascript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
}
```

### Playwright Selector Migration (CSS Modules → data-testid)
All E2E tests have been updated to use `data-testid` attributes instead of CSS Module class matching (`[class*="..."]`). This is necessary because Tailwind generates utility classes, not semantic ones.

**Components MUST add these data-testid attributes during the ShadCN rebuild:**

| data-testid | Component | Description |
| --- | --- | --- |
| `post-item` | PostItem | Each post card in the list |
| `post-title` | PostItem | Post title text |
| `post-header` | PostItem | Post metadata header (subreddit, author) |
| `post-footer` | PostItem | Post stats footer (upvotes, comments) |
| `post-subreddit` | PostItem | Subreddit name display |
| `post-list` | PostList | Container for all post items |
| `post-detail-content` | PostDetail (Sheet) | Sheet content wrapper |
| `close-button` | PostDetail (Sheet) | Sheet close button |
| `sheet-overlay` | PostDetail (Sheet) | Sheet backdrop overlay |
| `comments-section` | CommentList | Comments container |
| `comment` | Comment | Individual comment |
| `comment-meta` | Comment | Comment author + time |
| `comment-score` | Comment | Comment score display |
| `no-comments` | CommentList | Empty comments message |
| `collapse-all-button` | CommentList | Collapse/expand all toggle |
| `op-badge` | Comment | Original poster badge |
| `mod-badge` | Comment | Moderator badge |
| `comments-skeleton` | CommentSkeleton | Comments loading skeleton |
| `search-bar` | SearchBar | Search container |
| `search-clear` | SearchBar | Clear search button |
| `empty-state` | PostList | No results message |
| `error-message` | ErrorMessage | Error display |
| `skeleton` | PostSkeleton | Post loading skeleton |
| `bottom-nav` | BottomNav | Mobile bottom navigation |
| `sort-tabs` | SortBar (Tabs) | Sort option tabs |
| `filter-expand` | FilterPanel | Filter section toggle |
| `filter-button` | FilterPanel | Individual filter button |
| `filter-panel` | FilterPanel | Filter panel container |
| `flair-pill` | FilterPanel | Flair filter toggle |
| `load-more` | PostList | Load more posts button |
| `theme-switcher` | ThemeSwitcher | Theme button group |
| `timestamp` | Various | Relative time displays |
| `upvotes` | Various | Upvote count displays |
| `score` | Various | Score displays |
| `comment-count` | PostItem | Comment count in post card |
| `author` | Various | Author username displays |
| `post-author` | PostDetail | Post detail author |
| `post-time` | PostDetail | Post detail timestamp |

### Playwright Theme Updates

- THEMES array: `['red', 'white', 'green']` → `['red', 'white', 'black']`
- Theme button names: `'Keeper Kit theme'` → `'Third Kit theme'`
- All `'green'` theme references → `'black'`
- CSS variables: `--bg-primary` → `--background`, `--bg-secondary` → `--card`, `--text-primary` → `--foreground`, `--accent-color` → `--primary`

### Playwright API Route Updates

- All route interceptions: `**/reddit.com/**` → `**/api/reddit**`
- Comment routes: check `url.includes('comments')` in handler
- Search routes: check `url.includes('search')` in handler

### Visual Regression Screenshots

All existing screenshots in `__screenshots__/` will need to be regenerated after the ShadCN rebuild. Run `npx playwright test --update-snapshots` after the rebuild is complete.

## Files to Delete (After Rebuild Complete)

**CSS Module files** (19 files):
- `src/components/Avatar/Avatar.module.css`
- `src/components/BottomNav/BottomNav.module.css`
- `src/components/CodeBlock/CodeBlock.module.css`
- `src/components/CommentList/CommentList.module.css`
- `src/components/ErrorBoundary/ErrorBoundary.module.css`
- `src/components/ErrorMessage/ErrorMessage.module.css`
- `src/components/Header/Header.module.css`
- `src/components/Icon/Icon.module.css`
- `src/components/LoadingSpinner/LoadingSpinner.module.css`
- `src/components/PostDetail/PostDetail.module.css`
- `src/components/PostItem/PostItem.module.css`
- `src/components/PostList/PostList.module.css`
- `src/components/SearchBar/SearchBar.module.css`
- `src/components/SkeletonLoader/SkeletonLoader.module.css`
- `src/components/SpicyMeter/SpicyMeter.module.css`
- `src/components/SubredditFilter/SubredditFilter.module.css`
- `src/components/ThemeSwitcher/ThemeSwitcher.module.css`
- `src/components/Toast/Toast.module.css`
- `src/components/VideoPlayer/VideoPlayer.module.css`

**Global CSS files:**
- `src/App.css`
- `src/index.css`
- `src/styles/variables.css` (replaced by globals.css with Tailwind + theme variables)

**Deleted component directories:**
- `src/components/Icon/` (replaced by direct Lucide imports)
- `src/components/LoadingSpinner/` (replaced by ShadCN Skeleton)
- `src/components/Toast/` (replaced by Sonner)

**CRA artifacts (if not already deleted in Vite migration):**
- `src/index.js`
- `src/reportWebVitals.js`
- `src/setupTests.js` (old one — create new Vitest-compatible version)
- `src/logo.svg`
- `public/index.html`

**Dependencies to remove:**
- `react-scripts`
- `react-window`
- `web-vitals`
- `source-map-explorer`
- `selenium-webdriver` (unused)

## Acceptance Criteria
- `npm test` runs Vitest and all tests pass
- `npm run build` succeeds with no errors
- `npm run test:e2e` runs Playwright tests on Vite dev server
- No CSS Module imports remain in any component
- No references to deleted components (Icon, LoadingSpinner, Toast)
- No unused dependencies in package.json
- Coverage thresholds maintained: 80% statements, 72% branches, 75% functions
