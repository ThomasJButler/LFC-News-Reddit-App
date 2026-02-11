# LFC Reddit Viewer v2.0 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the LFC Reddit Viewer from CRA + CSS Modules to Vite + Tailwind + ShadCN with 3 LFC-themed switchable themes (Red/White/Black), fix mobile CORS issues, and add LFC personality — a love letter to Liverpool fans.

**Architecture:** Vite build system with Tailwind CSS v4 for utility-first styling, ShadCN/Radix UI primitives for accessible components, Redux (existing) for state management, Sonner for toast notifications. Single serverless proxy (`/api/reddit`) eliminates CORS. Three HSL-based themes applied via `data-theme` attribute on `<html>`.

**Tech Stack:** Vite, React 18, Tailwind CSS v4, ShadCN (Radix UI), Redux + redux-thunk, Sonner, Lucide React, Vitest, Playwright

> **Last audited:** 2026-02-11 (deep audit v2 — all src/, specs/, config, tests, ShadCN refs verified by parallel agents)
> **Status:** Priority 1 (Vite Migration) COMPLETED. Priority 2 (API Simplification) is next. 10 priorities remain.
> **Current state:** Vite 7 + CSS Modules (19 files) + Green theme. CRA removed. Dev server on port 5173. Target: Tailwind + ShadCN + Black theme + LFC personality.
> **E2E test state:** Playwright config already targets Vite (port 5173) and `data-testid` selectors. Tests reference `'black'` theme. They will NOT pass until the migration is complete. **Port fixed:** `npm run dev` now runs Vite on port 5173.
> **Unit test state:** Jest via react-scripts. Tests reference `'green'` theme. Must migrate to Vitest and update theme references. 30 test files total: `src/utils/__tests__/` (6 files, ~2303 lines), `src/utils/formatDuration.test.js` (79 lines, misplaced outside `__tests__/`), `src/redux/__tests__/` (4 files, ~1370 lines), 19 component test files (Header has NO test), and `src/App.test.js`. All currently passing with Jest/CRA.
> **Component inventory:** 19 component directories, 23 component files, all using CSS Modules, 0 with `data-testid` attributes in source (only in tests). Largest: CommentList (619 lines), PostDetail (542 lines), PostList (532 lines). 14 components use `prop-types` (bundled by `react-scripts`).
> **Existing directories that DON'T exist yet:** `src/components/ui/`, `src/components/shared/`, `src/components/posts/`, `src/components/layout/`, `src/components/comments/`, `src/components/lfc/`, `src/lib/`
> **CRA artifacts removed:** `src/reportWebVitals.js`, `src/logo.svg`, `public/index.html` deleted. Kept: `src/index.js` (renamed to `main.jsx`), `src/setupTests.js` (for Jest)
> **Toast system:** `src/components/Toast/` (5 source files + 1 test file), `src/hooks/useToast.js` (custom hook), `ToastProvider` wrapped in `src/index.js` — all to be replaced by Sonner

---

## Priority 1: Foundation (Vite Migration) ✅ COMPLETED

**Why first:** Everything else (Tailwind, ShadCN, theme system) depends on Vite being in place. CRA is deprecated and blocks modern tooling. The Playwright config already expects port 5173.

**Spec:** `specs/vite-migration.md`

**Completed 2026-02-11:**

- [x] Install Vite dependencies: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/postcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `sonner`, `radix-ui`, `lucide-react`
- [x] Create `vite.config.js` with React plugin, `@/` → `./src/` path alias, `/api/reddit` dev proxy to `http://localhost:3000`, and custom `jsxInJsPlugin()` for JSX-in-.js support (Vite 7 requirement)
- [x] Create `postcss.config.js` with `@tailwindcss/postcss` plugin
- [x] Create root `index.html` from `public/index.html`: replaced `%PUBLIC_URL%` with `/`; added `<script type="module" src="/src/main.jsx">`; kept theme-flash-prevention script
- [x] Create `src/main.jsx` as new entry point (mirrors `src/index.js`: Redux Provider, ToastProvider, React 18 `createRoot`, StrictMode)
- [x] Create `src/lib/utils.js` with ShadCN `cn()` helper (`clsx` + `tailwind-merge`)
- [x] Update `package.json` scripts: `"dev": "vite"`, `"start": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`
- [x] Add `"type": "module"` to `package.json` (required for Vite 7's ESM-first approach)
- [x] Remove from dependencies: `dompurify`, `selenium-webdriver`, `source-map-explorer` (kept `react-scripts` for Jest, kept `react-window@1.8.10` for old components)
- [x] Update `vercel.json`: added `"buildCommand": "npm run build"` and `"outputDirectory": "dist"`
- [x] Add `/dist` to `.gitignore`
- [x] Remove `browserslist` and `eslintConfig` sections from `package.json`
- [x] Delete CRA artifacts: `src/reportWebVitals.js`, `src/logo.svg` (kept `src/index.js` and `src/setupTests.js` for Jest)
- [x] Fix pre-existing SubredditFilter.test.js failures: label mismatch "Sort by:" → "Sort:", time range label mismatch, collapsed filter panel state
- [x] Fix pre-existing api.test.js failures: URL format expectations updated to match Vercel proxy format
- [x] Verify: `npm run dev` starts on port 5173, `npm run build` produces `dist/`, app renders in browser with existing CSS Modules working

**Key learnings:**
- Vite 7 needs a custom `enforce: 'pre'` plugin to handle JSX in .js files for production builds (esbuild config only works for dev)
- react-window v2.x renamed FixedSizeList→List; must pin v1.8.10 until components rebuilt
- `"type": "module"` in package.json needed for Vite 7's ESM-first approach
- Jest transformIgnorePatterns must be kept in package.json for ESM packages until Vitest migration

---

## Priority 2: Fix Mobile (API Simplification)

**Why second:** Mobile users get CORS errors from the 6-proxy fallback chain. Fixing this is the highest-impact user-facing bug. Independent of UI rebuild.

**Spec:** `specs/api-simplification.md`

**Current state of `src/utils/api.js`:** 463 lines. Contains `CORS_PROXIES` array (6 third-party proxies), `tryProxy()`, `isMobile()`, `tryVercelProxy()`, and sequential fallback logic. The 4 exported functions (`fetchPosts`, `fetchPostDetails`, `fetchComments`, `searchPosts`) construct full Reddit URLs like `https://www.reddit.com/r/LiverpoolFC/hot.json?limit=50` and pass them to `fetchFromReddit()`, which then parses them to extract the path for the Vercel proxy.

**Target architecture:** The 4 exported functions should construct *paths* (e.g., `/r/LiverpoolFC/hot.json`) and pass them directly to `fetchFromReddit(path)`, which calls `/api/reddit?path={path}&limit=50`. The `api/reddit.js` serverless function already accepts `path` as a query parameter and forwards all other query params to Reddit.

- [ ] Rewrite `fetchFromReddit(url)` → `fetchFromReddit(path)`: single call to `/api/reddit?path={encodedPath}` with 15s AbortController timeout; keep rate limiter and cache
- [ ] Update `fetchPosts()`: change from constructing full Reddit URL to passing path `/r/${subreddit}/${sortBy}.json` with query params `limit=50` (and `t=${timeRange}` for top/controversial)
- [ ] Update `fetchPostDetails()`: change to path `/api/info.json` with query param `id=t3_${postId}`
- [ ] Update `fetchComments()`: change to path `/r/${subreddit}/comments/${postId}.json` with query params `limit=500&depth=10`
- [ ] Update `searchPosts()`: change to path `/r/${validatedSubreddit}/search.json` with query params
- [ ] Remove: `CORS_PROXIES` array, `tryProxy()`, `isMobile()`, `tryVercelProxy()`, `BASE_URL` constant, all fallback/proxy selection logic, mobile-specific error messages
- [ ] Keep unchanged: `RateLimiter` class, `cache` usage, `processPostData()`, `processCommentData()`, `validateSubreddit()`, `ALLOWED_SUBREDDITS`, `DEFAULT_SUBREDDIT`, `CACHE_TTL`, `RATE_LIMIT_*` constants
- [ ] Target: reduce file from ~463 lines to ~150 lines
- [ ] Do NOT modify `api/reddit.js` serverless function or `vercel.json` rewrites
- [ ] Update `src/utils/__tests__/api.test.js`: remove proxy chain tests, test simplified single-proxy `fetchFromReddit()`
- [ ] Verify: posts load on mobile browser without CORS errors

---

## Priority 3: Theme System (Green → Black + HSL conversion)

**Why third:** Theme CSS variables must be in place before ShadCN components can reference them. Also fixes the Green→Black theme discrepancy between source code and E2E tests.

**Spec:** `specs/lfc-themes.md`

**Current state:**
- `src/styles/variables.css` defines 3 themes in hex format: `:root` (Red), `[data-theme="white"]` (White), `[data-theme="green"]` (Green)
- `ThemeSwitcher.js` line 23: `{ id: 'green', name: 'Keeper Kit', shortName: 'Keeper', color: '#00A651' }`
- `BottomNav.js` line 80: `const themes = ['red', 'white', 'green']`
- `public/index.html` (soon root `index.html`) flash-prevention script: uses generic `theme !== 'red'` check — no 'green' string to update
- E2E tests already reference `'black'` theme and `'Third Kit theme'` button label
- Unit tests (`ThemeSwitcher.test.js`, `BottomNav.test.js`) still reference `'green'` and `'Keeper Kit'`

- [ ] Create `src/styles/globals.css` with Tailwind v4 directives (`@import "tailwindcss"`) + 3 theme definitions using HSL CSS custom properties
- [ ] Red theme (default `:root`): dark bg `0 0% 6%` (#0f0f0f), LFC red `349 85% 43%` (#C8102E), white text
- [ ] White theme (`[data-theme="white"]`): cream bg `36 33% 93%` (#f5f0e8), dark text, red accents
- [ ] Black theme (`[data-theme="black"]`): pure black `0 0% 0%` (#000000), OLED-friendly, red accents — **replaces current Green theme**
- [ ] Map all ShadCN CSS variable names: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--ring`, `--input`, `--radius` (**`--popover` and `--popover-foreground` are required by Sonner toast component**)
- [ ] Update `ThemeSwitcher.js`: change `{ id: 'green', name: 'Keeper Kit', shortName: 'Keeper', color: '#00A651', description: 'Goalkeeper' }` → `{ id: 'black', name: 'Third Kit', shortName: 'Third', color: '#000000', description: 'Third Kit' }`. **Critical:** E2E tests expect `aria-label="Third Kit theme"` which comes from `theme.name + " theme"`
- [ ] **Fix ThemeSwitcher `applyTheme()`:** Current code at line 46-50 uses `removeAttribute('data-theme')` for the red theme, but E2E tests at `e2e/helpers/theme.js:51` expect `setAttribute('data-theme', 'red')` for ALL themes. Change to always use `setAttribute` — no special case for red
- [ ] Update `BottomNav.js` line 80: change `['red', 'white', 'green']` → `['red', 'white', 'black']`
- [ ] Root `index.html` flash-prevention script: already handles any theme value generically — no change needed
- [ ] Update unit tests: `ThemeSwitcher.test.js` and `BottomNav.test.js` — change `'green'` → `'black'`, `'Keeper Kit'` → `'Third Kit'`
- [ ] Persist theme in localStorage under key `lfc-theme` (already in place)
- [ ] Verify: all 3 themes render correctly, WCAG AA contrast ratios met

---

## Priority 4: ShadCN Component Library Setup

**Why fourth:** UI components need to be available before any component rebuild can begin.

**Spec:** `specs/shadcn-ui-rebuild.md` (component list section)

**Reference:** `ui/apps/v4/registry/new-york-v4/ui/` (56 TSX components available locally)

**Current state:** `src/components/ui/` directory does not exist.

- [ ] Create `src/components/ui/` directory
- [ ] Copy and convert TSX→JSX for these 16 components: `card`, `button`, `badge`, `sheet`, `tabs`, `skeleton`, `scroll-area`, `separator`, `toggle`, `toggle-group`, `tooltip`, `select`, `avatar`, `input`, `collapsible`, `sonner`
- [ ] Conversion checklist per file:
  - Remove all TypeScript type annotations (e.g., `React.ComponentProps<"div">`, `VariantProps<typeof X>`)
  - Remove `"use client"` directives (not using Next.js)
  - Change file extension from `.tsx` to `.jsx`
  - Update imports to use `@/lib/utils` for `cn()` (path alias set up in Priority 1)
  - Verify Radix UI import paths use `radix-ui` package (e.g., `import { Dialog } from "radix-ui"`)
  - Keep `data-slot` attributes, CVA variant definitions, and `asChild`/`Slot` patterns
- [ ] Special handling for `toggle-group.jsx`: update import of `toggleVariants` from `@/registry/new-york-v4/ui/toggle` to `@/components/ui/toggle`
- [ ] Special handling for `sonner.jsx`: remove `next-themes` import (`useTheme`); replace with direct theme reading from `document.documentElement.getAttribute('data-theme')` or pass theme as prop. Remove TypeScript `ToasterProps` type cast. Reference sonner.tsx uses `next-themes` which is Next.js-only.
- [ ] Ensure all Radix UI dependencies are installed (covered by Priority 1 `radix-ui` package)
- [ ] Verify: each component imports and renders without build errors

---

## Priority 5: Rebuild Components — Leaf Components First

**Why fifth:** Small, self-contained components with no child dependencies. Easiest to rebuild and test in isolation.

**Spec:** `specs/shadcn-ui-rebuild.md` (shared components section)

**New directories:** `src/components/shared/`, `src/components/lfc/` (neither exist yet)

**Note on Icon component:** The existing `src/components/Icon/Icon.js` is a centralized wrapper around `lucide-react` used by ~15 components. Per spec, it should be **deleted** and replaced with direct Lucide imports. However, since all old components still import it, this deletion should happen in Priority 9 when old components are removed. During the rebuild phases (5-8), new components should use direct Lucide imports (`import { Flame } from 'lucide-react'`).

- [ ] Rebuild Avatar → `src/components/shared/Avatar.jsx` — ShadCN Avatar (Radix) + existing `colorHash.js` utility for username-based colors; add `data-testid="avatar"`
- [ ] Rebuild SpicyMeter → `src/components/lfc/SpicyMeter.jsx` — Tailwind classes, direct Lucide `Flame` import, keep score-based thresholds (10000/5000/1000/500/100); keep generic level names for now (LFC names applied in Priority 10)
- [ ] Rebuild CodeBlock → `src/components/shared/CodeBlock.jsx` — Tailwind classes, keep `react-syntax-highlighter`, copy-to-clipboard feature; add `data-testid="code-block"`
- [ ] Rebuild VideoPlayer → `src/components/shared/VideoPlayer.jsx` — keep HLS.js + Safari native HLS fallback, Tailwind classes; add `data-testid="video-player"`
- [ ] Update `src/utils/markdown.js` line 8: change import from `'../components/CodeBlock/CodeBlock'` to `'../components/shared/CodeBlock'`

---

## Priority 6: Rebuild Components — Post Components

**Spec:** `specs/shadcn-ui-rebuild.md` (posts section)

**New directory:** `src/components/posts/` (does not exist yet)

**Current component details:**
- `PostItem.js`: Dispatches `setCurrentPost` + `fetchComments` via Redux. Uses Icon component, SpicyMeter. Smart thumbnail selection, video duration overlay, gallery count. Flair color coding.
- `PostList.js`: Redux-connected. Uses `react-window` FixedSizeList (threshold 999). Pull-to-refresh on mobile. Initial visible: 20, load more: 20. Flair and media filtering.
- `PostDetail.js`: Redux-connected (reads `currentPost`, `comments`). Modal with focus trap, keyboard nav (Escape/R/arrows). Reading mode toggle, reading progress indicator. Gallery carousel. CommentList child.
- `SkeletonLoader.js`: Exports 6 skeleton variants (PostListSkeleton, CommentsSkeleton, etc.)

- [ ] Rebuild PostItem → `src/components/posts/PostItem.jsx` — ShadCN Card + Badge, Tailwind responsive, direct Lucide imports; add `data-testid="post-item"`, `data-testid="post-title"`, `data-testid="post-header"`, `data-testid="post-footer"`, `data-testid="post-subreddit"`, `data-testid="post-score"`, `data-testid="post-flair"`, `data-testid="timestamp"`, `data-testid="upvotes"`, `data-testid="comment-count"`, `data-testid="author"`
- [ ] Rebuild PostSkeleton → `src/components/posts/PostSkeleton.jsx` — ShadCN Skeleton inside Card; add `data-testid="skeleton"`
- [ ] Rebuild PostList → `src/components/posts/PostList.jsx` — **remove `react-window` dependency**, use native scroll with "Load More" button, keep filter/pagination logic from Redux, keep pull-to-refresh; add `data-testid="post-list"`, `data-testid="empty-state"`, `data-testid="load-more"`
- [ ] Rebuild PostDetail → `src/components/posts/PostDetail.jsx` — ShadCN Sheet (replaces custom modal) + ScrollArea, lazy loaded via `React.lazy`; keep focus trap, keyboard nav, reading mode, gallery carousel; add `data-testid="post-detail"`, `data-testid="post-body"`, `data-testid="post-detail-content"`, `data-testid="close-button"`, `data-testid="sheet-overlay"`, `data-testid="post-author"`, `data-testid="post-time"`

---

## Priority 7: Rebuild Components — Layout & Navigation

**Spec:** `specs/shadcn-ui-rebuild.md` (layout section)

**New directory:** `src/components/layout/` (does not exist yet)

**Current component details:**
- `Header.js`: Renders SearchBar + Icon (Bird, Code). No Redux connection.
- `SearchBar.js`: Redux-connected. Dispatches `searchPosts`, `fetchPosts`, `setSearchTerm`. Input with clear and submit buttons.
- `SubredditFilter.js`: Heavy Redux component (reads `subreddits`, `posts` state). Renders: subreddit selector, sort buttons (hot/new/top/rising/viral), time range dropdown, collapsible flair filters (multi-select from loaded posts), media type filters, ThemeSwitcher. This gets **split into SortBar + FilterPanel**.
- `ThemeSwitcher.js`: Pure component with localStorage. 3 themes: red/white/green (changing to red/white/black).
- `BottomNav.js`: Mobile-only. 4 buttons: Home, Search, Theme cycle, Scroll to top. Redux-connected.

- [ ] Rebuild Header → `src/components/layout/Header.jsx` — sticky, `backdrop-blur-md`, LFC tagline area (for rotating taglines in Priority 10); add `data-testid="header"`
- [ ] Rebuild SearchBar → `src/components/shared/SearchBar.jsx` — ShadCN Input + Button, direct Lucide imports; add `data-testid="search-bar"`, `data-testid="search-input"`, `data-testid="search-clear"`
- [ ] Create SortBar → `src/components/layout/SortBar.jsx` — ShadCN Tabs for sort (hot/new/top/rising), ShadCN Select for time range; add `data-testid="sort-bar"`, `data-testid="sort-tabs"` *(split from current SubredditFilter)*
- [ ] Create FilterPanel → `src/components/layout/FilterPanel.jsx` — ShadCN Collapsible + ToggleGroup for flair/media filters; add `data-testid="filter-panel"`, `data-testid="filter-expand"`, `data-testid="filter-button"`, `data-testid="flair-pill"` *(split from current SubredditFilter)*
- [ ] Rebuild ThemeSwitcher → `src/components/layout/ThemeSwitcher.jsx` — ShadCN ToggleGroup, 3 color swatches (Red/White/Black), already using `'black'` from Priority 3; add `data-testid="theme-switcher"`
- [ ] Rebuild BottomNav → `src/components/layout/BottomNav.jsx` — mobile only (`md:hidden`), ShadCN Button ghost variant, direct Lucide imports, already using `'black'` from Priority 3; add `data-testid="bottom-nav"`, `data-testid="nav-home"`, `data-testid="nav-search"`, `data-testid="nav-about"`

---

## Priority 8: Rebuild Components — Comments

**Spec:** `specs/shadcn-ui-rebuild.md` (comments section)

**New directory:** `src/components/comments/` (does not exist yet)

**Current component details:**
- `CommentList.js`: Receives `comments`, `postId`, `subreddit` as props. Uses `react-window` FixedSizeList (threshold 999). Max nesting level 6. Staggered animations for first 15 comments. Collapse/expand all. Uses Avatar, ReactMarkdown, Icon.

- [ ] Rebuild CommentList → `src/components/comments/CommentList.jsx` — ShadCN ScrollArea + Separator, **remove `react-window` dependency**; add `data-testid="comment-list"`, `data-testid="comments-section"`, `data-testid="no-comments"`, `data-testid="collapse-all-button"`
- [ ] Rebuild Comment → `src/components/comments/Comment.jsx` — ShadCN Collapsible for thread collapse, shared Avatar, Badge for OP/flair; keep max nesting level 6; add `data-testid="comment"`, `data-testid="comment-meta"`, `data-testid="comment-score"`, `data-testid="op-badge"`, `data-testid="mod-badge"`, `data-testid="score"`, `data-testid="timestamp"`, `data-testid="author"`
- [ ] Rebuild CommentSkeleton → `src/components/comments/CommentSkeleton.jsx` — ShadCN Skeleton; add `data-testid="comment-skeleton"`, `data-testid="comments-skeleton"`

---

## Priority 9: Rebuild Components — Error/Toast/App Shell

**Spec:** `specs/shadcn-ui-rebuild.md` (error/toast/app section)

- [ ] Rebuild ErrorMessage → `src/components/shared/ErrorMessage.jsx` — ShadCN Card + Button for retry; add `data-testid="error-message"`
- [ ] Rebuild ErrorBoundary → `src/components/shared/ErrorBoundary.jsx` — Tailwind styling, keep class component pattern (required for error boundaries)
- [ ] Replace Toast system: delete `src/components/Toast/` directory (5 source files + 1 test: `Toast.js`, `Toast.module.css`, `ToastContainer.js`, `ToastProvider.js`, `index.js`, `__tests__/Toast.test.js`); also delete `src/hooks/useToast.js` (custom hook that imports from ToastProvider); wire `src/components/ui/sonner.jsx` (created in Priority 4) into App, add `<Toaster />` to App
- [ ] Delete `src/components/Icon/` directory (3 files: `Icon.js`, `Icon.module.css`, `__tests__/Icon.test.js`) — all new components already use direct `import { X } from 'lucide-react'`
- [ ] Delete `src/components/LoadingSpinner/` directory (3 files: `LoadingSpinner.js`, `LoadingSpinner.module.css`, `__tests__/LoadingSpinner.test.js`) — replaced by ShadCN Skeleton + LfcLoadingMessages (Priority 10)
- [ ] Rebuild App → `src/App.jsx` — wire all rebuilt components from new paths (`layout/`, `posts/`, `shared/`), lazy load PostDetail with Suspense, add Sonner Toaster, import `globals.css`; add `data-testid="app"`
- [ ] Update `src/main.jsx`: remove ToastProvider import (Sonner doesn't need it), import from new App path
- [ ] Delete old component directories: `Avatar/`, `BottomNav/`, `CodeBlock/`, `CommentList/`, `ErrorBoundary/`, `ErrorMessage/`, `Header/`, `PostDetail/`, `PostItem/`, `PostList/`, `SearchBar/`, `SkeletonLoader/`, `SpicyMeter/`, `SubredditFilter/`, `ThemeSwitcher/`, `VideoPlayer/`

---

## Priority 10: LFC Personality

**Why here:** Personality features layer on top of rebuilt components. They need the new component structure to integrate properly.

**Spec:** `specs/lfc-personality.md`

**Current state:** None of these exist. SpicyMeter uses generic names (Cool/Mild/Warm/Hot/Blazing/Legendary). No `src/utils/lfcData.js`. No `src/components/lfc/` directory (except SpicyMeter from Priority 5).

- [ ] Create `src/utils/lfcData.js` with 5 exported arrays: `loadingMessages` (12), `lfcTrivia` (16), `emptyStateMessages` (6), `errorMessages` (6), `antiClickbaitMessages` (6)
- [ ] Create `src/components/lfc/LfcLoadingMessages.jsx` — rotating messages every 3s during loading states, displayed below skeleton loaders
- [ ] Create `src/components/lfc/LfcTrivia.jsx` — random "Did you know?" ShadCN Card, appears every 10 posts in feed
- [ ] Create `src/components/lfc/LfcFooter.jsx` — desktop only, "You'll Never Walk Alone" + rotating anti-clickbait taglines ("No ads. No trackers. No Murdoch.")
- [ ] Update SpicyMeter level names in `src/components/lfc/SpicyMeter.jsx`: Cool→Reserves, Mild→League Cup, Warm→Premier League, Hot→Champions League, Blazing→Istanbul 2005, Legendary→YNWA
- [ ] Integrate LFC humor into ErrorMessage and empty states (import `errorMessages` and `emptyStateMessages` from `lfcData`)
- [ ] Add rotating tagline to Header component (import `loadingMessages` or create dedicated tagline array)
- [ ] Handle JFT97 (Hillsborough) references respectfully — no jokes about tragedies

---

## Priority 11: Testing & Cleanup

**Why last:** Tests validate the completed rebuild. Cleanup removes all legacy files.

**Spec:** `specs/testing-cleanup.md`

**Current state:**
- **Unit tests:** Jest via `react-scripts test`. 30 test files. Coverage thresholds in `package.json`: 80% statements, 72% branches, 75% functions. Jest `transformIgnorePatterns` for ESM packages.
- **E2E tests:** Playwright config targets port 5173, `data-testid` selectors, `'black'` theme. 9 E2E test files. Visual regression with `__screenshots__` directory.
- **CSS Modules:** 19 `.module.css` files across component directories.
- **Global CSS:** `src/App.css` (main styles), `src/index.css` (minimal), `src/styles/variables.css` (theme definitions).

- [ ] Add Vitest to dev dependencies: `vitest`, `@vitest/coverage-v8`, `jsdom`
- [ ] Add Vitest config to `vite.config.js`: `test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.js' }`
- [ ] Create `src/test-setup.js` (replaces `src/setupTests.js`) — import `@testing-library/jest-dom`; add `vi.mock()` (not `jest.mock()`) for `react-markdown`, `remark-gfm`, `react-syntax-highlighter`, and `react-syntax-highlighter/dist/esm/styles/prism` (all 4 mocks currently in `setupTests.js`)
- [ ] Update `package.json` scripts: `"test": "vitest"`, `"test:coverage": "vitest run --coverage"`, `"test:ci": "vitest run --coverage"`
- [ ] Remove Jest config from `package.json`: `transformIgnorePatterns`, `coverageThreshold` (move to Vitest config), `eslintConfig`
- [ ] Update `api.test.js` — remove proxy chain tests, test simplified single-proxy `fetchFromReddit()`
- [ ] Update remaining unit tests: fix import paths for moved components, update theme references from `'green'` to `'black'`, update `App.test.js` for new component structure
- [ ] Move `src/utils/formatDuration.test.js` → `src/utils/__tests__/formatDuration.test.js` (misplaced outside `__tests__/` directory)
- [ ] Playwright config: already correct (port 5173, `npm run dev`) — **no changes needed**
- [ ] E2E tests: already use `data-testid` selectors and Black theme references — verify they pass against rebuilt app
- [ ] Delete all 19 CSS Module files (one per old component directory)
- [ ] Delete global CSS: `src/App.css`, `src/index.css`, `src/styles/variables.css`
- [ ] Remove unused dependencies from `package.json`: `react-scripts`, `react-window`, `web-vitals`, `source-map-explorer`, `selenium-webdriver`, `jest` (dev), `dompurify` (imported nowhere in source)
- [ ] Verify: all unit tests pass (`npm test`), all E2E tests pass (`npm run test:e2e`), `npm run build` succeeds
- [ ] Regenerate Playwright visual regression screenshots (`npx playwright test --update-snapshots`)
- [ ] Final verification on mobile devices (iOS Safari, Chrome Android)

---

## Files to Preserve (Do NOT Modify Unless Noted)

These files are complete and correct — do not change during the rebuild:

- `api/reddit.js` — Vercel serverless proxy function (accepts `?path=` parameter)
- `src/utils/cache.js` — TTL cache with auto-cleanup (109 lines, no deps)
- `src/utils/colorHash.js` — Username-to-color mapping with WCAG contrast (146 lines, 16-color LFC palette)
- `src/utils/formatDuration.js` — Video duration formatting (41 lines)
- `src/utils/formatTime.js` — Relative time formatting (51 lines)
- `src/utils/sanitize.js` — URL and HTML sanitization (57 lines)
- `src/redux/store.js` — Redux store configuration (legacy pattern, not Redux Toolkit)
- `src/redux/actions/types.js` — 49 action type constants
- `src/redux/actions/posts.js` — Post action creators including deprecated `setFlairFilter`
- `src/redux/actions/comments.js` — Comment action creators
- `src/redux/actions/subreddits.js` — Subreddit action creator
- `src/redux/reducers/index.js` — Root reducer (combines posts, comments, subreddits)
- `src/redux/reducers/posts.js` — Posts reducer with filter helpers (dual filter system: legacy `activeFilter` + new `activeFlairFilters`)
- `src/redux/reducers/comments.js` — Comments reducer
- `src/redux/reducers/subreddits.js` — Subreddits reducer
- `playwright.config.js` — Already configured for Vite (port 5173, `npm run dev`)
- `e2e/**` — Already updated for ShadCN rebuild (data-testid selectors, Black theme, `/api/reddit` route interceptions)

## Files to Modify (Preserve Logic, Update Paths/Config)

- `src/utils/markdown.js` — Update CodeBlock import path from `'../components/CodeBlock/CodeBlock'` to `'../components/shared/CodeBlock'`
- `src/utils/api.js` — Simplify per Priority 2 (remove CORS proxy chain, keep exports)
- `package.json` — Update scripts, dependencies, remove Jest config (Priorities 1, 2, 11)
- `vercel.json` — Add buildCommand and outputDirectory (Priority 1)
- `.gitignore` — Add `/dist` (Priority 1)

## Reference Files (Do NOT Deploy)

- `ui/` directory — Reference-only copy of ShadCN v4 components for TSX→JSX conversion
- `specs/` directory — Implementation specifications

## Notes

- All deprecated code (`setFlairFilter`, `applyFlairFilter`, `activeFilter` in Redux) can remain until a future cleanup pass
- The Redux `__tests__/` directory has 4 test files with good coverage (~1200 lines total) — update for Vitest compatibility in Priority 11
- The `src/utils/__tests__/` directory has 7 test files — only `api.test.js` needs significant changes (Priority 2)
- `dompurify` is in dependencies but not used in any source files — remove in Priority 11
- `prop-types` is used by **14 component files** (Avatar, CodeBlock, CommentList, ErrorBoundary, ErrorMessage, Icon, PostItem, SkeletonLoader, SpicyMeter, Toast, ToastContainer, ToastProvider, VideoPlayer + 1 test) — not listed in `package.json`, bundled by `react-scripts`. Since ALL old components get deleted in Priority 9 and rebuilt components won't use PropTypes, this resolves itself. Do NOT add `prop-types` to `package.json`.
- `src/hooks/useToast.js` imports from `ToastProvider` — must be deleted in Priority 9 when Toast system is removed
- **Spec discrepancy:** `specs/api-simplification.md` shows `fetchFromReddit(url)` signature that parses internally; plan improves this to `fetchFromReddit(path)` that takes path directly. The plan's approach is intentionally cleaner — follow the plan, not the spec.
- **Spec discrepancy:** `specs/lfc-themes.md` uses Tailwind v3 directives (`@tailwind base/components/utilities`); plan correctly uses Tailwind v4 format (`@import "tailwindcss"`). Follow the plan.
- **Animation classes:** ShadCN Sheet component uses `animate-in`/`animate-out`/`slide-in-from-*` classes. In Tailwind CSS v4, these require the `tailwindcss-animate` plugin OR custom `@keyframes` definitions in `globals.css`. Investigate during Priority 3/4 implementation.
- Header component is the ONLY component without a test file — consider adding one during rebuild

## Audit Findings (2026-02-11, v2)

### Confirmed by deep codebase analysis (6 parallel research agents):
- All 11 priorities are correctly ordered with valid dependencies
- All "Files to Preserve" are verified present and complete (no modifications needed)
- All "Files to Modify" are verified present in their current state
- ShadCN v4 reference directory (`ui/apps/v4/registry/new-york-v4/ui/`) contains all **16** required components in TSX format (15 from spec table + sonner)
- Radix UI v4 imports use `radix-ui` package format (e.g., `import { Dialog } from "radix-ui"`) — confirmed in reference components
- `react-window` is used by both `PostList.js` (line ~532) and `CommentList.js` (line ~619) with threshold 999 (effectively disabled) — removal in Priorities 6 and 8 is correct
- Redux state shape verified: `posts` (10 properties), `comments` (3 properties), `subreddits` (2 properties)
- 6 of 18 components are Redux-connected (BottomNav, PostDetail, PostItem, PostList, SearchBar, SubredditFilter have useSelector/useDispatch)
- `api.js` confirmed at 463 lines with 6 CORS proxies, `isMobile()`, `tryProxy()`, `tryVercelProxy()` — all targeted for removal in Priority 2
- SpicyMeter currently uses generic level names (confirmed via code review): Cool/Mild/Warm/Hot/Blazing/Legendary at thresholds 100/500/1000/5000/10000
- `src/utils/lfcData.js` does NOT exist — must be created in Priority 10
- `src/styles/globals.css` does NOT exist — must be created in Priority 3
- `vercel.json` currently has only `rewrites` — needs `buildCommand` and `outputDirectory` added in Priority 1
- `.gitignore` has `/build` but NOT `/dist` — needs update in Priority 1
- Zero TODO/FIXME/HACK comments in source code
- No tsconfig.json or jsconfig.json exists (pure JS project)
- `src/hooks/useToast.js` exists and imports from ToastProvider — must be deleted in Priority 9
- `src/utils/formatDuration.test.js` is misplaced outside `__tests__/` directory
- Header component has NO test file (only component without one)
- 14 component files import `prop-types` (not just SpicyMeter)
- `browserslist` section exists in package.json (CRA artifact, must remove in Priority 1)
- `sonner.tsx` reference uses `--popover` and `--popover-foreground` CSS vars (must define in globals.css)
- `sheet.tsx` reference uses `animate-in`/`animate-out` animation classes (need `tailwindcss-animate` plugin or custom keyframes)
- E2E `setThemeDirect()` uses `setAttribute('data-theme', 'red')` for red theme, but current ThemeSwitcher uses `removeAttribute('data-theme')` for red — must align

### Potential issues to watch:
- **Port mismatch risk:** ✅ RESOLVED — Playwright config targets port 5173 (Vite) and `npm run dev` now runs Vite on port 5173. Priority 1 complete.
- **`react-window` removal:** Both PostList and CommentList use it. Removal must preserve pull-to-refresh and load-more pagination behavior.
- **`prop-types` dependency:** 14 components use PropTypes bundled by `react-scripts`. All old components get deleted in Priority 9; rebuilt components won't use PropTypes. Self-resolving.
- **Toast migration:** Current Toast system (5 source files + 1 test + `src/hooks/useToast.js`) uses React Context. Sonner replacement is significantly simpler. Confirm all toast types (success/error/info/warning) are supported.
- **`dompurify` in dependencies:** Not imported anywhere in source code. Remove in Priority 11.
- **Radix UI package format:** vite-migration.md spec lists individual `@radix-ui/react-*` packages but ShadCN v4 reference components import from unified `radix-ui` package. Use the unified `radix-ui` package per the reference components.
- **Animation dependency:** ShadCN Sheet/Tooltip use Tailwind animation utility classes (`animate-in`, `animate-out`, `slide-in-from-right`, `fade-in-0`, etc.). In Tailwind v4, these may need `tailwindcss-animate` plugin or custom `@keyframes` in globals.css. Test during Priority 4.
- **data-testid completeness:** The full list of required data-testid attributes is in `specs/testing-cleanup.md` lines 83-122 (32 unique attributes). All component rebuild tasks (P5-P9) now include the complete list per component. Missing any will cause E2E failures.
