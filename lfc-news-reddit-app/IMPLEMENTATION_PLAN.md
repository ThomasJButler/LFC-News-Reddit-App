# Implementation Plan — LFC Reddit Viewer v2.0

> **Last audited:** 2026-02-11
> **Status:** No items completed. Entire migration is ahead.
> **Current state:** CRA + CSS Modules + Green theme. Target: Vite + Tailwind + ShadCN + Black theme + LFC personality.

---

## Priority 1: Foundation (Vite Migration)

**Why first:** Everything else (Tailwind, ShadCN, theme system) depends on Vite being in place. CRA is deprecated and blocks modern tooling.

**Spec:** `specs/vite-migration.md`

- [ ] Create `vite.config.js` with React plugin, `@/` → `./src/` path alias, and `/api/reddit` dev proxy
- [ ] Create `postcss.config.js` with `@tailwindcss/postcss` plugin
- [ ] Move `public/index.html` to project root as `index.html`; replace `%PUBLIC_URL%` with `/`; add `<script type="module" src="/src/main.jsx">`; keep theme-flash-prevention script
- [ ] Create `src/main.jsx` as new entry point (mirrors current `src/index.js`: Redux Provider, React 18 `createRoot`)
- [ ] Create `src/lib/utils.js` with ShadCN `cn()` helper (clsx + tailwind-merge)
- [ ] Update `package.json` scripts to use Vite (`dev`, `build`, `preview`)
- [ ] Update `package.json` dependencies: remove `react-scripts`, `react-window`, `web-vitals`; add `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/postcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `sonner`, and Radix UI primitives (`radix-ui`)
- [ ] Update `vercel.json`: add `"buildCommand": "npm run build"` and `"outputDirectory": "dist"`
- [ ] Add `/dist` to `.gitignore`
- [ ] Delete CRA artifacts: `src/index.js`, `src/reportWebVitals.js`, `src/setupTests.js`, `src/logo.svg`, `public/index.html` (after moving to root)
- [ ] Verify: `npm run dev` starts on port 5173, `npm run build` produces `dist/`, app renders in browser

---

## Priority 2: Fix Mobile (API Simplification)

**Why second:** Mobile users get CORS errors from the 6-proxy fallback chain. Fixing this is the highest-impact user-facing bug. Independent of UI rebuild.

**Spec:** `specs/api-simplification.md`

**Current state of `src/utils/api.js`:** 463 lines, contains `CORS_PROXIES` array (6 proxies), `tryProxy()`, `isMobile()`, `tryVercelProxy()`, and sequential fallback logic.

- [ ] Remove from `api.js`: `CORS_PROXIES` array, `tryProxy()`, `isMobile()`, `tryVercelProxy()`, all fallback/proxy selection logic
- [ ] Rewrite `fetchFromReddit(path)` to make a single call to `/api/reddit?path={encodedPath}` with 15s AbortController timeout
- [ ] Keep unchanged: `RateLimiter` class, `cache` usage, `processPostData()`, `processCommentData()`, `validateSubreddit()`, and all 4 exported functions (`fetchPosts`, `fetchPostDetails`, `fetchComments`, `searchPosts`)
- [ ] Target: reduce file from ~463 lines to ~150 lines
- [ ] Do NOT modify `api/reddit.js` serverless function or `vercel.json` rewrites
- [ ] Verify: posts load on mobile browser without CORS errors

---

## Priority 3: Theme System (Green → Black + HSL conversion)

**Why third:** Theme CSS variables must be in place before ShadCN components can reference them. Also fixes the Green→Black theme discrepancy.

**Spec:** `specs/lfc-themes.md`

**Current state:** `src/styles/variables.css` defines Red/White/Green themes in hex format. `ThemeSwitcher.js` and `BottomNav.js` reference `'green'` theme. E2E tests already reference `'black'` theme.

- [ ] Create `src/styles/globals.css` with Tailwind v4 directives (`@import "tailwindcss"`) + 3 theme definitions using HSL CSS custom properties
- [ ] Red theme (default `:root`): dark bg `hsl(0 0% 6%)` (#0f0f0f), LFC red `hsl(349 85% 43%)` (#C8102E), white text
- [ ] White theme (`[data-theme="white"]`): cream bg `hsl(36 33% 93%)` (#f5f0e8), dark text, red accents
- [ ] Black theme (`[data-theme="black"]`): pure black `hsl(0 0% 0%)` (#000000), OLED-friendly, red accents — **replaces current Green theme**
- [ ] Map ShadCN CSS variable names: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--ring`, `--input`, `--sidebar-*`, `--chart-*`
- [ ] Update ThemeSwitcher: change `'green'`/`'Keeper Kit'` → `'black'`/`'Third Kit'`
- [ ] Update BottomNav: change `'green'` → `'black'` in theme cycle array
- [ ] Update `public/index.html` (now root `index.html`) flash-prevention script: `'green'` → `'black'`
- [ ] Persist theme in localStorage under key `lfc-theme` (already in place)
- [ ] Verify: all 3 themes render correctly, WCAG AA contrast ratios met

---

## Priority 4: ShadCN Component Library Setup

**Why fourth:** UI components need to be available before any component rebuild can begin.

**Spec:** `specs/shadcn-ui-rebuild.md` (component list section)

**Reference:** `ui/apps/v4/registry/new-york-v4/ui/` (57 TSX components available)

- [ ] Create `src/components/ui/` directory
- [ ] Copy and convert TSX→JSX for these 15 components: `card`, `button`, `badge`, `sheet`, `tabs`, `skeleton`, `scroll-area`, `separator`, `toggle`, `toggle-group`, `tooltip`, `select`, `avatar`, `input`, `collapsible`
- [ ] Conversion checklist per file: remove TypeScript annotations, remove `"use client"` directives, update imports to use `@/lib/utils` for `cn()`, verify Radix UI import paths use `radix-ui` package
- [ ] Ensure all Radix UI dependencies are installed (covered by Priority 1 package.json update)
- [ ] Verify: each component imports and renders correctly in isolation

---

## Priority 5: Rebuild Components — Leaf Components First

**Why fifth:** Small, self-contained components with no child dependencies. Easiest to rebuild and test in isolation.

**Spec:** `specs/shadcn-ui-rebuild.md` (shared components section)

**New directory structure:** `src/components/shared/`, `src/components/lfc/`

- [ ] Rebuild Avatar → `src/components/shared/Avatar.jsx` — ShadCN Avatar + existing `colorHash.js` utility; add `data-testid="avatar"`
- [ ] Rebuild SpicyMeter → `src/components/lfc/SpicyMeter.jsx` — Tailwind classes, keep score-based levels (LFC names applied in Priority 9)
- [ ] Rebuild CodeBlock → `src/components/shared/CodeBlock.jsx` — Tailwind classes, keep react-syntax-highlighter; add `data-testid="code-block"`
- [ ] Rebuild VideoPlayer → `src/components/shared/VideoPlayer.jsx` — keep HLS.js + Safari fallback, Tailwind classes; add `data-testid="video-player"`
- [ ] Update `src/utils/markdown.js` import path for CodeBlock (currently `../components/CodeBlock/CodeBlock`)

---

## Priority 6: Rebuild Components — Post Components

**Spec:** `specs/shadcn-ui-rebuild.md` (posts section)

**New directory:** `src/components/posts/`

- [ ] Rebuild PostItem → `src/components/posts/PostItem.jsx` — ShadCN Card + Badge, Tailwind responsive; add `data-testid="post-item"`, `data-testid="post-title"`, `data-testid="post-score"`, `data-testid="post-flair"`
- [ ] Rebuild PostSkeleton → `src/components/posts/PostSkeleton.jsx` — ShadCN Skeleton inside Card; add `data-testid="skeleton"`
- [ ] Rebuild PostList → `src/components/posts/PostList.jsx` — remove react-window dependency, native scroll, keep filter/pagination logic from Redux; add `data-testid="post-list"`
- [ ] Rebuild PostDetail → `src/components/posts/PostDetail.jsx` — ShadCN Sheet + ScrollArea, lazy loaded; add `data-testid="post-detail"`, `data-testid="post-body"`

---

## Priority 7: Rebuild Components — Layout & Navigation

**Spec:** `specs/shadcn-ui-rebuild.md` (layout section)

**New directory:** `src/components/layout/`

- [ ] Rebuild Header → `src/components/layout/Header.jsx` — sticky, backdrop-blur, LFC tagline area; add `data-testid="header"`
- [ ] Rebuild SearchBar → `src/components/shared/SearchBar.jsx` — ShadCN Input + Button; add `data-testid="search-bar"`, `data-testid="search-input"`
- [ ] Create SortBar → `src/components/layout/SortBar.jsx` — ShadCN Tabs for sort (hot/new/top/rising), Select for time range; add `data-testid="sort-bar"` *(split from current SubredditFilter)*
- [ ] Create FilterPanel → `src/components/layout/FilterPanel.jsx` — ShadCN Collapsible + ToggleGroup for flair/media filters; add `data-testid="filter-panel"` *(split from current SubredditFilter)*
- [ ] Rebuild ThemeSwitcher → `src/components/layout/ThemeSwitcher.jsx` — ShadCN ToggleGroup, 3 color swatches (Red/White/Black); add `data-testid="theme-switcher"`
- [ ] Rebuild BottomNav → `src/components/layout/BottomNav.jsx` — mobile only (md:hidden), ShadCN Button ghost variant; add `data-testid="bottom-nav"`

---

## Priority 8: Rebuild Components — Comments

**Spec:** `specs/shadcn-ui-rebuild.md` (comments section)

**New directory:** `src/components/comments/`

- [ ] Rebuild CommentList → `src/components/comments/CommentList.jsx` — ShadCN ScrollArea + Separator; add `data-testid="comment-list"`
- [ ] Rebuild Comment → `src/components/comments/Comment.jsx` — ShadCN Collapsible for thread collapse, Avatar, Badge for OP/flair; add `data-testid="comment"`
- [ ] Rebuild CommentSkeleton → `src/components/comments/CommentSkeleton.jsx` — ShadCN Skeleton; add `data-testid="comment-skeleton"`

---

## Priority 9: Rebuild Components — Error/Toast/App Shell

**Spec:** `specs/shadcn-ui-rebuild.md` (error/toast/app section)

- [ ] Rebuild ErrorMessage → `src/components/shared/ErrorMessage.jsx` — ShadCN Card + Button for retry; add `data-testid="error-message"`
- [ ] Rebuild ErrorBoundary → `src/components/shared/ErrorBoundary.jsx` — Tailwind styling, keep class component pattern
- [ ] Replace Toast system: delete `src/components/Toast/` directory (4 files), create `src/components/ui/sonner.jsx`, add `<Toaster />` to App
- [ ] Delete `src/components/Icon/` directory — replace all `<Icon name="x" />` with direct `import { X } from 'lucide-react'` throughout codebase
- [ ] Delete `src/components/LoadingSpinner/` directory — replaced by ShadCN Skeleton + LfcLoadingMessages
- [ ] Rebuild App → `src/App.jsx` — wire all rebuilt components, lazy load PostDetail with Suspense, add Sonner Toaster; add `data-testid="app"`
- [ ] Delete old component directories after rebuild: `Avatar/`, `BottomNav/`, `CodeBlock/`, `CommentList/`, `ErrorBoundary/`, `ErrorMessage/`, `Header/`, `PostDetail/`, `PostItem/`, `PostList/`, `SearchBar/`, `SkeletonLoader/`, `SpicyMeter/`, `SubredditFilter/`, `ThemeSwitcher/`, `VideoPlayer/`

---

## Priority 10: LFC Personality

**Why here:** Personality features layer on top of rebuilt components. They need the new component structure to integrate properly.

**Spec:** `specs/lfc-personality.md`

**Current state:** None of these exist. SpicyMeter uses generic names (Cool/Mild/Warm/Hot/Blazing/Legendary).

- [ ] Create `src/utils/lfcData.js` with 5 exported arrays: `loadingMessages` (12), `lfcTrivia` (16), `emptyStateMessages` (6), `errorMessages` (6), `antiClickbaitMessages` (6)
- [ ] Create `src/components/lfc/LfcLoadingMessages.jsx` — rotating messages every 3s during loading states
- [ ] Create `src/components/lfc/LfcTrivia.jsx` — random "Did you know?" card in feed
- [ ] Create `src/components/lfc/LfcFooter.jsx` — YNWA + rotating anti-clickbait taglines
- [ ] Update SpicyMeter level names: Cool→Reserves, Mild→League Cup, Warm→Premier League, Hot→Champions League, Blazing→Istanbul 2005, Legendary→YNWA
- [ ] Integrate LFC humor into ErrorMessage and empty states (use `errorMessages` and `emptyStateMessages` from lfcData)
- [ ] Add rotating tagline to Header component

---

## Priority 11: Testing & Cleanup

**Why last:** Tests validate the completed rebuild. Cleanup removes all legacy files.

**Spec:** `specs/testing-cleanup.md`

**Current state:** Jest via react-scripts. Playwright config already updated for Vite (port 5173). E2E tests already use `data-testid` selectors and reference Black theme. 19 CSS Module files still exist.

- [ ] Add Vitest config to `vite.config.js` (`test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.js' }`)
- [ ] Create `src/test-setup.js` (replaces `src/setupTests.js`) — import `@testing-library/jest-dom`
- [ ] Update `api.test.js` — remove proxy chain tests, test simplified single-proxy `fetchFromReddit()`
- [ ] Playwright config: already correct (port 5173, `npm run dev`) — **no changes needed**
- [ ] E2E tests: already use `data-testid` selectors and Black theme references — verify they pass against rebuilt app
- [ ] Delete all 19 CSS Module files (listed in Priority 9 component directories)
- [ ] Delete global CSS: `src/App.css`, `src/index.css`, `src/styles/variables.css`
- [ ] Remove unused dependencies from `package.json`: `react-scripts`, `react-window`, `web-vitals`
- [ ] Verify: all unit tests pass, all e2e tests pass, `npm run build` succeeds
- [ ] Regenerate Playwright visual regression screenshots (`npx playwright test --update-snapshots`)
- [ ] Final verification on mobile devices (iOS Safari, Chrome Android)

---

## Files to Preserve (Do NOT Modify)

These files are complete and correct — do not change during the rebuild:

- `api/reddit.js` — Vercel serverless proxy function
- `src/utils/cache.js` — TTL cache with auto-cleanup
- `src/utils/colorHash.js` — Username-to-color mapping with WCAG contrast
- `src/utils/formatDuration.js` — Video duration formatting
- `src/utils/formatTime.js` — Relative time formatting
- `src/utils/sanitize.js` — URL and HTML sanitization
- `src/redux/store.js` — Redux store configuration
- `src/redux/actions/types.js` — Action type constants
- `src/redux/actions/posts.js` — Post action creators (update imports only if api.js exports change)
- `src/redux/actions/comments.js` — Comment action creators
- `src/redux/actions/subreddits.js` — Subreddit action creator
- `src/redux/reducers/index.js` — Root reducer
- `src/redux/reducers/posts.js` — Posts reducer with filter helpers
- `src/redux/reducers/comments.js` — Comments reducer
- `src/redux/reducers/subreddits.js` — Subreddits reducer
- `playwright.config.js` — Already configured for Vite (port 5173)
- `e2e/**` — Already updated for ShadCN rebuild (data-testid selectors, Black theme)

## Notes

- `src/utils/markdown.js` — Preserve but update CodeBlock import path after rebuild
- The `ui/` directory is a reference-only copy of ShadCN v4 components; do not deploy it
- All deprecated code (`setFlairFilter`, `applyFlairFilter`, `activeFilter` in Redux) can remain until a future cleanup pass
