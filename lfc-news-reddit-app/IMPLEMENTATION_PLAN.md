# LFC Reddit Viewer v2.0 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the LFC Reddit Viewer from CRA + CSS Modules to Vite + Tailwind + ShadCN with 3 LFC-themed switchable themes (Red/White/Black), fix mobile CORS issues, and add LFC personality — a love letter to Liverpool fans.

**Architecture:** Vite build system with Tailwind CSS v4 for utility-first styling, ShadCN/Radix UI primitives for accessible components, Redux (existing) for state management, Sonner for toast notifications. Single serverless proxy (`/api/reddit`) eliminates CORS. Three HSL-based themes applied via `data-theme` attribute on `<html>`.

**Tech Stack:** Vite, React 18, Tailwind CSS v4, ShadCN (Radix UI), Redux + redux-thunk, Sonner, Lucide React, Vitest, Playwright

> **Last audited:** 2026-02-11 (deep audit v4 — all src/, specs/, config, tests, ShadCN refs verified by parallel Opus/Sonnet agents; 12 errors corrected, 5 missing items added)
> **Status:** Priorities 1-5 COMPLETED. Priority 6 (Post Components Rebuild) is next. 6 priorities remain.
> **Current state:** Vite 7 + CSS Modules (19 files) + Black/White/Red themes (HSL + hex both active). API simplified (single proxy). Dev server on port 5173. Jest `moduleNameMapper` resolves `@/` alias. Target: Tailwind + ShadCN + LFC personality.
> **E2E test state:** Playwright config already targets Vite (port 5173) and `data-testid` selectors (38 unique attributes required). Tests reference `'black'` theme. They will NOT pass until the migration is complete. **Port fixed:** `npm run dev` now runs Vite on port 5173.
> **Unit test state:** Jest via react-scripts. Tests reference `'green'` theme. Must migrate to Vitest and update theme references. 30 test files total: `src/utils/__tests__/` (6 files, ~2312 lines), `src/utils/formatDuration.test.js` (79 lines, misplaced outside `__tests__/`), `src/redux/__tests__/` (4 files, ~1370 lines), 19 component test files (Header has NO test), and `src/App.test.js`. All currently passing with Jest/CRA.
> **Component inventory:** 19 component directories, 23 component files, all using CSS Modules, 0 with `data-testid` attributes in component source (only in 4 test files: Toast.test.js, PostList.test.js, PostDetail.test.js, Icon.test.js). Largest: CommentList (619 lines), PostDetail (542 lines), PostList (532 lines). 14 components use `prop-types` (bundled by `react-scripts`). Total component code: ~16,142 lines (source + CSS + tests).
> **Existing directories that DON'T exist yet:** `src/components/posts/`, `src/components/layout/`, `src/components/comments/`
> **Already created:** `src/components/shared/` (Avatar, CodeBlock, VideoPlayer — created in Priority 5), `src/components/lfc/` (SpicyMeter — created in Priority 5)
> **Already created:** `src/components/ui/` (16 ShadCN JSX components — created in Priority 4)
> **Already created:** `src/lib/utils.js` (ShadCN `cn()` helper — created in Priority 1)
> **CRA artifacts status:** `src/reportWebVitals.js`, `src/logo.svg` deleted. **Still present:** `public/index.html` (52-line CRA version with `%PUBLIC_URL%` placeholders — NOT deleted, contrary to previous audit claims), `src/index.js` (NOT renamed — both `index.js` and `main.jsx` coexist; has BROKEN import of deleted `reportWebVitals` at line 15), `src/index.css`, `src/App.css`, `src/setupTests.js` (needed for Jest until Vitest migration)
> **Toast system:** `src/components/Toast/` (5 source files + 1 test file), `src/hooks/useToast.js` (custom hook), `ToastProvider` wrapped in both `src/index.js` AND `src/main.jsx` — all to be replaced by Sonner
> **Tailwind state:** `tailwindcss`, `@tailwindcss/postcss`, `tailwindcss-animate` are installed in package.json. `postcss.config.js` is configured. But NO `globals.css` exists yet and NO Tailwind directives are imported anywhere. Tailwind is ready but not wired up.
> **Animation classes:** `tailwindcss-animate` v1.0.7 is installed. ShadCN Sheet, Tooltip, and Select components use `animate-in`/`animate-out`/`slide-in-from-*`/`fade-in-*`/`zoom-in-*` classes. These should work with the plugin installed — verify during Priority 4.
> **Radix UI imports:** All 16 ShadCN reference components use the unified `radix-ui` package (e.g., `import { Dialog } from "radix-ui"`), NOT individual `@radix-ui/react-*` packages. The `radix-ui` package is already installed.
> **ShadCN sonner.tsx:** Uses `useTheme` from `next-themes` (Next.js-only). Must replace with direct `document.documentElement.getAttribute('data-theme')` reading during TSX→JSX conversion.

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

## Priority 2: Fix Mobile (API Simplification) ✅ COMPLETED

**Why second:** Mobile users get CORS errors from the 6-proxy fallback chain. Fixing this is the highest-impact user-facing bug. Independent of UI rebuild.

**Spec:** `specs/api-simplification.md`

**Completed 2026-02-11:**

- [x] Rewrote `fetchFromReddit(url)` → `fetchFromReddit(path, params)`: single call to `/api/reddit?path={path}&{params}` with 15s AbortController timeout; kept rate limiter and cache
- [x] Updated `fetchPosts()`: constructs path `/r/${subreddit}/${sortBy}.json` with params `{ limit: '50' }` (and `t: timeRange` for top/controversial)
- [x] Updated `fetchPostDetails()`: path `/api/info.json` with params `{ id: 't3_${postId}' }`
- [x] Updated `fetchComments()`: path `/r/${subreddit}/comments/${postId}.json` with params `{ limit: '500', depth: '10' }`
- [x] Updated `searchPosts()`: path `/r/${validatedSubreddit}/search.json` with params `{ q, restrict_sr, limit, sort }`
- [x] Removed: `CORS_PROXIES` array (6 proxies), `tryProxy()`, `isMobile()`, `tryVercelProxy()`, `BASE_URL` constant, all fallback/proxy logic, mobile error messages
- [x] Kept: `RateLimiter`, `cache`, `processPostData()`, `processCommentData()`, `validateSubreddit()`, `ALLOWED_SUBREDDITS`, `DEFAULT_SUBREDDIT`, `CACHE_TTL`, `RATE_LIMIT_*`
- [x] Reduced file from 463 lines to ~156 lines
- [x] Did NOT modify `api/reddit.js` or `vercel.json`
- [x] Rewrote `api.test.js`: 36 tests covering all 4 exports, error handling, timeout, cache, subreddit validation — removed proxy chain tests
- [x] All 30 test suites pass (864 tests), build succeeds

**Key change:** Cache key is now the proxy URL (`/api/reddit?path=...&limit=...`) rather than the full Reddit URL. This is deterministic for the same path+params combination.

---

## Priority 3: Theme System (Green → Black + HSL conversion) ✅ COMPLETED

**Why third:** Theme CSS variables must be in place before ShadCN components can reference them. Also fixes the Green→Black theme discrepancy between source code and E2E tests.

**Spec:** `specs/lfc-themes.md`

**Completed 2026-02-11:**

- [x] Created `src/styles/globals.css` with `@import "tailwindcss"` (Tailwind v4) + 3 theme definitions using HSL CSS custom properties
- [x] Red theme (`:root`): bg `0 0% 6%`, primary `349 85% 43%` (LFC Red), white text
- [x] White theme (`[data-theme="white"]`): bg `36 33% 93%` (warm cream), dark text, red accents
- [x] Black theme (`[data-theme="black"]`): bg `0 0% 0%` (pure black OLED), red accents
- [x] All 19 ShadCN CSS variables mapped: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`
- [x] Updated `ThemeSwitcher.js`: green→black, Keeper Kit→Third Kit, fixed `applyTheme()` to always use `setAttribute` (no `removeAttribute` for red)
- [x] Updated `BottomNav.js`: green→black, fixed `handleThemeClick()` to always use `setAttribute`
- [x] Updated `index.html` flash-prevention script: always sets `data-theme` (defaults to `'red'`)
- [x] Fixed `src/index.js`: removed broken `reportWebVitals` import and call
- [x] Updated `variables.css`: replaced green theme with black theme (OLED-friendly, red accents)
- [x] Updated unit tests: ThemeSwitcher.test.js and BottomNav.test.js — all `'green'`→`'black'`, `'Keeper Kit'`→`'Third Kit'`, fixed `removeAttribute` assertions
- [x] All 30 test suites pass (864 tests), build succeeds

**Key changes:**
- `data-theme` attribute is now ALWAYS set (including for red theme) — aligns with E2E test expectations
- `globals.css` uses Tailwind v4 `@import` syntax (not v3 `@tailwind` directives)
- `variables.css` still exists with hex-based variables for existing CSS Modules — will be deleted in Priority 11

---

## Priority 4: ShadCN Component Library Setup ✅ COMPLETED

**Why fourth:** UI components need to be available before any component rebuild can begin.

**Spec:** `specs/shadcn-ui-rebuild.md` (component list section)

**Completed 2026-02-11:**

- [x] Created `src/components/ui/` directory with 16 JSX components converted from TSX reference
- [x] Components: `card`, `button`, `badge`, `sheet`, `tabs`, `skeleton`, `scroll-area`, `separator`, `toggle`, `toggle-group`, `tooltip`, `select`, `avatar`, `input`, `collapsible`, `sonner`
- [x] All TypeScript annotations removed, `"use client"` directives removed, file extensions changed to `.jsx`
- [x] All imports use `@/lib/utils` for `cn()` and `radix-ui` package for Radix primitives
- [x] `toggle-group.jsx`: import path fixed to `@/components/ui/toggle`
- [x] `sonner.jsx`: `next-themes` replaced with `document.documentElement.getAttribute('data-theme')`, mapped to sonner's `'light'`/`'dark'` theme values
- [x] Build succeeds, all 864 tests pass

**Note:** Components are not yet imported by any app code — they'll be used starting in Priority 5.

---

## Priority 5: Rebuild Components — Leaf Components First ✅ COMPLETED

**Why fifth:** Small, self-contained components with no child dependencies. Easiest to rebuild and test in isolation.

**Spec:** `specs/shadcn-ui-rebuild.md` (shared components section)

**Completed 2026-02-11:**

- [x] Created `src/components/shared/` and `src/components/lfc/` directories
- [x] Rebuild Avatar → `src/components/shared/Avatar.jsx` — ShadCN Avatar (Radix) + existing `colorHash.js` utility for username-based colors; `data-testid="avatar"`
- [x] Rebuild SpicyMeter → `src/components/lfc/SpicyMeter.jsx` — Tailwind classes, direct Lucide `Flame` import, LFC-themed level names applied immediately (Reserves/League Cup/Premier League/Champions League/Istanbul 2005/YNWA); `data-testid="spicy-meter"`
- [x] Rebuild CodeBlock → `src/components/shared/CodeBlock.jsx` — Tailwind classes, `react-syntax-highlighter` preserved, copy-to-clipboard with direct Lucide `Copy`/`Check` imports; `data-testid="code-block"`
- [x] Rebuild VideoPlayer → `src/components/shared/VideoPlayer.jsx` — HLS.js + Safari native HLS fallback preserved, Tailwind classes; `data-testid="video-player"`
- [x] Updated `src/utils/markdown.js` import: `'../components/CodeBlock/CodeBlock'` → `'../components/shared/CodeBlock'`
- [x] Added `moduleNameMapper` for `@/` alias in Jest config (`package.json`) — required because Jest doesn't read Vite's path aliases
- [x] All 30 test suites pass (864 tests), build succeeds

**Key learnings:**
- Jest needs `moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }` in package.json to resolve the `@/` Vite alias. This will be superseded by Vitest migration in Priority 11.
- SpicyMeter LFC names were applied now (not deferred to Priority 10) since they're trivial string changes. Priority 10's SpicyMeter task can be marked done when reached.
- Old components (Avatar/, SpicyMeter/, CodeBlock/, VideoPlayer/) are still in place — they'll be deleted in Priority 9 when all consumers switch to new paths.

**Note on Icon component:** The existing `src/components/Icon/Icon.js` is a centralized wrapper around `lucide-react` used by ~15 old components. Per spec, it should be **deleted** and replaced with direct Lucide imports. Since old components still import it, this deletion happens in Priority 9. All new rebuild components use direct Lucide imports.

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
- [ ] Create SortBar → `src/components/layout/SortBar.jsx` — ShadCN Tabs for sort (hot/new/top/rising/viral), ShadCN Select for time range (hour/day/week/month/year/all); add `data-testid="sort-bar"`, `data-testid="sort-tabs"` *(split from current SubredditFilter)*
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
- [ ] Update `src/main.jsx`: remove ToastProvider import (Sonner doesn't need it), import from new App path, change CSS import from `'./index.css'` to `'./styles/globals.css'`
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
- [ ] Remove unused dependencies from `package.json`: `react-scripts`, `react-window` (already removed in Priority 1: `dompurify`, `source-map-explorer`, `selenium-webdriver`, `web-vitals`)
- [ ] Delete CRA artifact: `public/index.html` (52-line CRA version with `%PUBLIC_URL%` placeholders, NOT used by Vite)
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
- `package.json` — Update scripts, dependencies, remove Jest config (Priorities 2, 11) *(Priority 1 changes already completed)*
- `vercel.json` — ✅ buildCommand and outputDirectory already added (Priority 1 complete)
- `.gitignore` — ✅ `/dist` already added (Priority 1 complete)

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
- **data-testid completeness:** The full list of required data-testid attributes is in `specs/testing-cleanup.md` lines 83-122 (**38 unique attributes**, not 32 as previously stated). All component rebuild tasks (P5-P9) include the complete list per component plus ~14 extras not used by E2E tests (for unit tests / accessibility). Missing any of the 38 E2E-required attributes will cause E2E failures.

---

## Audit Findings (2026-02-11, v3)

### Deep verification by Opus + 6 parallel Sonnet agents:

**All v2 findings confirmed.** Additional discoveries:

#### CRA Artifact Cleanup (Priority 1 incomplete items):
- **`src/index.js` still exists** alongside `src/main.jsx` — both files are present and functional. `index.js` imports ToastProvider and renders the app via CRA's entry point. `main.jsx` does the same for Vite. The plan says `index.js` was "renamed to `main.jsx`" but it was actually **copied** — `index.js` was never deleted. It should be deleted when `react-scripts` is removed in Priority 11 (Jest still needs it).
- **`src/index.css`** still exists (global CSS for CRA entry point). Will be replaced by `globals.css` in Priority 3.
- **`src/App.css`** still exists (~main styles). Will be deleted in Priority 11.
- **`browserslist`** section: ✅ Already noted for removal in Priority 1 checklist but verify if actually removed.

#### Tailwind Integration Status:
- `tailwindcss` (v4), `@tailwindcss/postcss`, `tailwindcss-animate` (v1.0.7) are all in `package.json` ✅
- `postcss.config.js` uses `@tailwindcss/postcss` ✅
- `src/lib/utils.js` exists with `cn()` helper (clsx + tailwind-merge) ✅
- **BUT:** No `globals.css` exists, no Tailwind `@import` directive anywhere, no CSS custom properties for themes. Tailwind is installed but completely unwired. Priority 3 creates this.

#### ShadCN Reference Components — Animation Classes Requiring `tailwindcss-animate`:
- **sheet.tsx**: `animate-in`, `animate-out`, `fade-in-0`, `fade-out-0`, `slide-in-from-right`, `slide-out-to-right`, `slide-in-from-left`, `slide-out-to-left`, `slide-in-from-top`, `slide-out-to-top`, `slide-in-from-bottom`, `slide-out-to-bottom`
- **tooltip.tsx**: `animate-in`, `animate-out`, `fade-in-0`, `fade-out-0`, `zoom-in-95`, `zoom-out-95`, `slide-in-from-top-2`, `slide-in-from-left-2`, `slide-in-from-right-2`, `slide-in-from-bottom-2`
- **select.tsx**: Same animation classes as tooltip
- **skeleton.tsx**: `animate-pulse` (standard Tailwind, no plugin needed)
- **sonner.tsx**: `animate-spin` (standard Tailwind, no plugin needed)
- **Verdict:** `tailwindcss-animate` v1.0.7 is installed. Must verify it works with Tailwind v4 during Priority 4. If not, add custom `@keyframes` in `globals.css`.

#### ShadCN toggle-group.tsx Import Path:
- Currently imports from `@/registry/new-york-v4/ui/toggle` — must change to `@/components/ui/toggle` during TSX→JSX conversion. **Already noted in Priority 4 checklist ✅**

#### E2E Test Coverage Summary (9 test files, ~2,273 lines):
- `happy-path.spec.js` (485 lines): Core user flows
- `error-recovery.spec.js` (464 lines): Network/API error handling
- `mobile-navigation.spec.js` (393 lines): Touch/mobile/tablet
- `theme-persistence.spec.js` (337 lines): Theme switching + persistence
- `helpers/theme.js` (141 lines): Theme utilities (THEMES array = `['red', 'white', 'black']`)
- `visual/home.spec.js` (156 lines): Home page visual regression
- `visual/components.spec.js` (172 lines): Individual component screenshots
- `visual/comments.spec.js` (145 lines): Comment thread visual tests
- `visual/post-detail.spec.js` (140 lines): Post detail sheet visual tests
- **All E2E tests expect `data-testid` selectors** — 0 CSS Module class selectors
- **All E2E tests expect `'black'` theme** (not `'green'`)
- **All API mocking uses `**/api/reddit**` pattern** (not `reddit.com`)
- **Theme button labels expected:** "Anfield Red theme", "Away Day theme", "Third Kit theme"

#### Redux State — Full Verified Shape:
```javascript
{
  posts: {
    items: [],               // Array of post objects
    loading: false,
    error: null,
    currentPost: null,
    searchTerm: '',
    sortBy: 'hot',           // 'hot' | 'new' | 'top' | 'rising' | 'controversial' | 'viral'
    timeRange: 'day',        // 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
    activeFilter: null,      // DEPRECATED single-select
    activeFlairFilters: [],  // Multi-select flair array
    activeMediaFilter: null  // 'images' | 'videos' | 'articles' | 'discussions'
  },
  comments: {
    items: [],
    loading: false,
    error: null
  },
  subreddits: {
    available: ['LiverpoolFC'],
    selected: 'LiverpoolFC'
  }
}
```

#### Utility Files — Verified Line Counts:
| File | Lines | Notes |
|------|-------|-------|
| `api.js` | 463 | Priority 2 target: reduce to ~150 |
| `cache.js` | 108 | Preserve unchanged |
| `colorHash.js` | 145 | Preserve unchanged |
| `formatDuration.js` | 40 | Preserve unchanged |
| `formatTime.js` | 50 | Preserve unchanged |
| `markdown.js` | 80 | Update CodeBlock import path |
| `sanitize.js` | 56 | Preserve unchanged |
| `api.test.js` | 897 | Rewrite for simplified API |
| `cache.test.js` | 309 | Minimal changes |
| `colorHash.test.js` | 255 | No changes needed |
| `formatTime.test.js` | 183 | No changes needed |
| `markdown.test.js` | 353 | No changes needed |
| `sanitize.test.js` | 315 | No changes needed |
| `formatDuration.test.js` | 79 | Move to `__tests__/` |

#### No Missing Specs:
- All 6 spec files (`api-simplification.md`, `lfc-personality.md`, `lfc-themes.md`, `shadcn-ui-rebuild.md`, `testing-cleanup.md`, `vite-migration.md`) are comprehensive and cross-referenced
- No gaps between specs and implementation plan
- Two known spec discrepancies already documented (API signature, Tailwind v3 vs v4 directives)

#### Code Quality Confirmation:
- Zero TODO/FIXME/HACK/PLACEHOLDER comments in all source code ✅
- Zero skipped or flaky unit tests ✅
- No flaky E2E test markers (no `.fixme()`, no `test.fail()`) ✅
- E2E tests have conditional skips for viewport-appropriate tests (mobile-only, desktop-only) — expected behavior ✅
- Redux has 2 deprecated functions (`applyFlairFilter`, `setFlairFilter`) properly marked — will self-resolve during rebuild ✅

---

## Audit Findings (2026-02-11, v4)

### Deep verification by Opus + 8 parallel Sonnet agents — corrections applied to plan inline:

#### 12 Factual Errors CORRECTED:
1. **`public/index.html` NOT deleted** — 52-line CRA artifact still exists with `%PUBLIC_URL%` placeholders. Plan header updated to reflect this. Deletion added to Priority 11.
2. **`src/index.js` has broken `reportWebVitals` import** — Line 15 imports deleted `src/reportWebVitals.js`, line 28 calls it. Fix added to Priority 3.
3. **data-testid count was 38, not 32** — Corrected in header and "Potential issues" section. Plan assigns ~52 total (38 required by E2E + 14 extras for unit tests/accessibility).
4. **Sort options missing "viral"** — Priority 7 SortBar now lists `hot/new/top/rising/viral`. Current SubredditFilter has all 5 options.
5. **Redux `timeRange` missing 'hour'** — Added to state shape comment. SubredditFilter dropdown includes 'hour' at line 247.
6. **Redux `sortBy` missing 'rising'** — Added to state shape comment alongside existing 'controversial' and 'viral'.
7. **"Files to Modify" listed completed items** — `vercel.json` and `.gitignore` marked as ✅ completed in Priority 1.
8. **Priority 11 listed already-removed dependencies** — `dompurify`, `source-map-explorer`, `selenium-webdriver`, `web-vitals` were removed in Priority 1. Only `react-scripts` and `react-window` remain for Priority 11.
9. **`api.js` line count inconsistency** — Was 462 in utility table, 463 in Priority 2. Corrected to 463 everywhere.
10. **Plan header claimed `public/index.html` deleted** — Corrected to show it still exists.
11. **Priority 1 and Priority 11 had duplicate dependency removal items** — Clarified in Priority 11 which items were already removed.
12. **Priority 9 `main.jsx` task omitted CSS import change** — Added: change `'./index.css'` to `'./styles/globals.css'`.

#### 5 Missing Items ADDED to plan:
1. **Flash-prevention script in `index.html` (lines 17-23)** — Current code does NOT set `data-theme` for red theme on page load. E2E tests expect `getAttribute('data-theme')` to return `'red'`. Fix added to Priority 3.
2. **`public/index.html` deletion** — CRA artifact not scheduled for cleanup anywhere. Added to Priority 11.
3. **BottomNav `removeAttribute` bug (lines 89-93)** — Same `removeAttribute('data-theme')` pattern as ThemeSwitcher for red theme. Plan only mentioned ThemeSwitcher fix. Added to Priority 3.
4. **`src/index.js` broken `reportWebVitals` import** — Not flagged anywhere in plan. Added to Priority 3.
5. **`src/main.jsx` CSS import needs updating** — Currently imports `./index.css`, needs to become `./styles/globals.css`. Added to Priority 9.

#### 3 Misleading Descriptions CLARIFIED:
1. **"9 E2E test files"** — Actually 8 `.spec.js` files + 1 `helpers/theme.js` helper module.
2. **"4 test files reference data-testid"** — These are mock implementations inside test files, not actual component usage.
3. **"Files to Modify" implied pending work** — Now annotated with ✅ for Priority 1 completed items.

#### Complete data-testid Reconciliation (38 required by E2E, plan assigns ~52):

**Required by E2E (38):** `author`, `bottom-nav`, `close-button`, `collapse-all-button`, `comment-count`, `comment-meta`, `comment-score`, `comment`, `comments-section`, `comments-skeleton`, `empty-state`, `error-message`, `filter-button`, `filter-expand`, `filter-panel`, `flair-pill`, `load-more`, `mod-badge`, `no-comments`, `op-badge`, `post-author`, `post-detail-content`, `post-footer`, `post-header`, `post-item`, `post-list`, `post-subreddit`, `post-time`, `post-title`, `score`, `search-bar`, `search-clear`, `sheet-overlay`, `skeleton`, `sort-tabs`, `theme-switcher`, `timestamp`, `upvotes`

**Extras in plan (14, not required for E2E pass but good for unit tests/accessibility):** `app`, `avatar`, `code-block`, `comment-list`, `comment-skeleton`, `header`, `nav-about`, `nav-home`, `nav-search`, `post-body`, `post-detail`, `post-flair`, `post-score`, `search-input`, `sort-bar`, `video-player`

#### All v2/v3 findings confirmed — no regressions.
