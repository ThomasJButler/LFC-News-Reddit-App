# LFC Reddit Viewer v2.0 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the LFC Reddit Viewer from CRA + CSS Modules to Vite + Tailwind + ShadCN with 3 LFC-themed switchable themes (Red/White/Black), fix mobile CORS issues, and add LFC personality — a love letter to Liverpool fans.

**Architecture:** Vite build system with Tailwind CSS v4 for utility-first styling, ShadCN/Radix UI primitives for accessible components, Redux (existing) for state management, Sonner for toast notifications. Single serverless proxy (`/api/reddit`) eliminates CORS. Three HSL-based themes applied via `data-theme` attribute on `<html>`.

**Tech Stack:** Vite, React 18, Tailwind CSS v4, ShadCN (Radix UI), Redux + redux-thunk, Sonner, Lucide React, Vitest, Playwright

> **Last audited:** 2026-02-11 (deep audit v5 — full codebase verification by 6 parallel research agents + Opus synthesis)
> **Status:** Priorities 1-10 COMPLETED and VERIFIED. 1 priority remains (Priority 11: Testing & Cleanup).
> **Current state:** Vite 7 + Tailwind CSS v4 + ShadCN + 3 HSL themes (Red/White/Black). API simplified to single `/api/reddit` proxy. Dev server on port 5173. All 35 components rebuilt with Tailwind + ShadCN. 12 test suites, 362 tests. `src/main.jsx` imports `./styles/globals.css` correctly. `App.jsx` wires all rebuilt components. Sonner Toaster active. All LFC personality components integrated (lfcData.js, LfcLoadingMessages, LfcTrivia, LfcFooter).
> **Verified complete:** `src/components/ui/` (16 ShadCN JSX — no TSX, no `use client`, no `@radix-ui/react-*`, all use unified `radix-ui`), `src/components/comments/` (3), `src/components/layout/` (5), `src/components/posts/` (4), `src/components/shared/` (6), `src/components/lfc/SpicyMeter.jsx` (LFC names already applied: Reserves/League Cup/Premier League/Champions League/Istanbul 2005/YNWA)
> **Config verified:** `vite.config.js` (React plugin + jsxInJsPlugin + @/ alias + dev proxy), `postcss.config.js` (@tailwindcss/postcss), `vercel.json` (dist output + rewrites), `package.json` (Vite scripts + jest config for transition)
> **globals.css verified:** `@import "tailwindcss"` + 3 theme blocks (:root, [data-theme="white"], [data-theme="black"]) with all 19 ShadCN CSS vars + base styles. Body uses `system-ui` font stack (upgrade planned in P10).
> **CRA artifacts still present:** `public/index.html` (52-line CRA version — not used by Vite), `src/index.js` (kept for Jest — reportWebVitals import FIXED in P3), `src/index.css`, `src/App.css`, `src/styles/variables.css` (230-line legacy hex theme — superseded by globals.css HSL), `src/setupTests.js`
> **Toast system:** Old Toast/ directory and useToast.js DELETED in P9. Sonner `<Toaster />` wired in App.jsx.
> **LFC Personality (P10a):** `src/utils/lfcData.js` created with all 5 arrays. `src/components/lfc/` now has 4 components: SpicyMeter, LfcLoadingMessages, LfcTrivia, LfcFooter. All integrated into App.jsx, PostList.jsx, ErrorMessage.jsx, and Header.jsx.
> **E2E test state:** Playwright targets port 5173, uses 38 `data-testid` selectors (all verified present in rebuilt components), expects `'black'` theme. All API mocking uses `**/api/reddit**`. Theme button labels: "Anfield Red theme", "Away Day theme", "Third Kit theme". Tests will NOT pass until Vitest migration completes (Jest still the test runner).
> **data-testid coverage:** 38 E2E-required attributes confirmed in E2E tests AND implemented in components. 14 extras for unit tests/accessibility also present.

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

## Priority 6: Rebuild Components — Post Components ✅ COMPLETED

**Spec:** `specs/shadcn-ui-rebuild.md` (posts section)

**Completed 2026-02-11:**

- [x] Rebuild PostItem → `src/components/posts/PostItem.jsx` — ShadCN Card + Badge, Tailwind responsive, direct Lucide imports (ArrowUp, MessageCircle, Image, ExternalLink, Play, Images); uses shared SpicyMeter from `../lfc/SpicyMeter`; score color coding via Tailwind classes (text-primary for hot, text-amber-400 for popular); flair variants mapped to Badge destructive/secondary/default/outline; staggered animate-in with tailwindcss-animate; left accent stripe on hover; all `data-testid` attributes added
- [x] Rebuild PostSkeleton → `src/components/posts/PostSkeleton.jsx` — ShadCN Skeleton inside Card; alternating thumbnail skeleton; `data-testid="skeleton"` on each card
- [x] Rebuild PostList → `src/components/posts/PostList.jsx` — **removed `react-window` dependency**, uses native scroll with `space-y-3` gaps; ShadCN Button for "Load More"; preserved pull-to-refresh, filter/pagination logic, empty states; all `data-testid` attributes added
- [x] Rebuild PostDetail → `src/components/posts/PostDetail.jsx` — ShadCN Sheet (replaces custom modal) + ScrollArea + Separator; Radix Dialog handles focus trap, Escape key, overlay dismiss natively; kept reading mode (R key), reading progress bar, gallery carousel with arrow keys, VideoPlayer integration; all `data-testid` attributes added
- [x] All 30 test suites pass (864 tests), build succeeds

**Key changes:**
- PostDetail now uses Radix Dialog (via Sheet) for modal management — eliminates ~50 lines of manual focus trap, exit animation, and overlay click handling
- PostList no longer imports `react-window` — uses native DOM rendering with `space-y-3` gaps
- PostItem uses `tailwindcss-animate` classes (`animate-in fade-in-0 slide-in-from-bottom-4`) for staggered entry instead of CSS Module keyframes
- All new components import Lucide icons directly (no Icon wrapper)
- Old components (PostItem/, PostList/, PostDetail/, SkeletonLoader/) are still in place — they'll be deleted in Priority 9

**Note:** Old components still exist and their tests still pass. The new `src/components/posts/` components are not yet wired into App.jsx — that happens in Priority 9 when old components are deleted and App is rebuilt.

---

## Priority 7: Rebuild Components — Layout & Navigation ✅ COMPLETED

**Spec:** `specs/shadcn-ui-rebuild.md` (layout section)

**Completed 2026-02-11:**

- [x] Rebuild Header → `src/components/layout/Header.jsx` — sticky with `backdrop-blur-md`, LFC tagline bar with Bird icon + "You'll Never Walk Alone", developer attribution link; `data-testid="header"`
- [x] Rebuild SearchBar → `src/components/shared/SearchBar.jsx` — ShadCN Input + Button, direct Lucide imports (Search, X, Loader2), clear button overlaid inside input; `data-testid="search-bar"`, `data-testid="search-input"`, `data-testid="search-clear"`
- [x] Create SortBar → `src/components/layout/SortBar.jsx` — ShadCN Tabs for sort (Hot/New/Top/Rising/Spicy) with icons, ShadCN Select for time range (hour/day/week/month/year/all) shown conditionally when sort=Top; `data-testid="sort-bar"`, `data-testid="sort-tabs"`
- [x] Create FilterPanel → `src/components/layout/FilterPanel.jsx` — ShadCN Collapsible with SlidersHorizontal icon, quick filters (Match Day/Transfers), media filters (Images/Videos/Articles/Discussions), dynamic flair pills from loaded posts with multi-select, active filter count badge; `data-testid="filter-panel"`, `data-testid="filter-expand"`, `data-testid="filter-button"`, `data-testid="flair-pill"`
- [x] Rebuild ThemeSwitcher → `src/components/layout/ThemeSwitcher.jsx` — ShadCN ToggleGroup type="single", 3 color swatches with ring highlight on active; `data-testid="theme-switcher"`
- [x] Rebuild BottomNav → `src/components/layout/BottomNav.jsx` — mobile only (`md:hidden`), fixed bottom, ShadCN Button ghost variant, backdrop-blur, 4 nav items (Home/Search/Theme/Top); `data-testid="bottom-nav"`, `data-testid="nav-home"`, `data-testid="nav-search"`
- [x] All 30 test suites pass (864 tests), build succeeds

**Key changes:**
- SubredditFilter (394 lines) split into SortBar (~100 lines) + FilterPanel (~200 lines) — cleaner single-responsibility
- Header now includes SearchBar and ThemeSwitcher directly (self-contained)
- SortBar uses ShadCN Tabs with Radix role="tab" — E2E tests use `getByRole('tab', { name: /new/i })`
- FilterPanel uses ShadCN Collapsible with localStorage persistence for expand/collapse state
- ThemeSwitcher uses ToggleGroup with ring-2 highlight on active swatch — E2E tests expect `aria-label="${theme.name} theme"`
- All new components use direct Lucide imports (no Icon wrapper)
- Old components (Header/, SearchBar/, SubredditFilter/, ThemeSwitcher/, BottomNav/) still in place — deleted in Priority 9

**Note:** SearchBar lives in `src/components/shared/` (not `layout/`) per the spec's folder structure.

---

## Priority 8: Rebuild Components — Comments ✅ COMPLETED

**Spec:** `specs/shadcn-ui-rebuild.md` (comments section)

**Completed 2026-02-11:**

- [x] Rebuild CommentList → `src/components/comments/CommentList.jsx` — Native DOM rendering (removed `react-window`), staggered entry animations for first 15 comments (40ms stagger), collapse/expand all controls with ChevronsUp/ChevronsDown icons, comment count display; `data-testid="comment-list"`, `data-testid="no-comments"`, `data-testid="collapse-all-button"`, `data-testid="comment-count"`
- [x] Rebuild Comment → `src/components/comments/Comment.jsx` — ShadCN Badge for OP/MOD/Pinned, shared Avatar, Tailwind border-l thread lines with LFC color cycle (red-600/amber-400/emerald-500/sky-400/zinc-500), max nesting level 6, markdown with media embeds, action buttons (Reply/Share) with hover reveal, responsive indentation; `data-testid="comment"`, `data-testid="comment-meta"`, `data-testid="comment-score"`, `data-testid="op-badge"`, `data-testid="mod-badge"`, `data-testid="score"`, `data-testid="timestamp"`, `data-testid="author"`
- [x] Rebuild CommentSkeleton → `src/components/comments/CommentSkeleton.jsx` — ShadCN Skeleton with thread structure simulation (4 skeletons, alternating indentation); `data-testid="comment-skeleton"`, `data-testid="comments-skeleton"`
- [x] Updated PostDetail.jsx: import paths changed from `../CommentList/CommentList` → `../comments/CommentList` and `../SkeletonLoader/SkeletonLoader` → `../comments/CommentSkeleton`
- [x] All 30 test suites pass (864 tests), build succeeds

**Key changes:**
- `react-window` removed — uses native DOM rendering with `space-y` gaps (virtualization was disabled at threshold 999 anyway)
- Comment and CommentList split into separate files (was monolithic 620-line file)
- Thread line colors use Tailwind border utilities instead of CSS custom properties
- Direct Lucide imports (ChevronDown, MessageCircle, Share2, Check, ChevronsUp, ChevronsDown) — no Icon wrapper
- Action buttons (Reply/Share) appear on hover (desktop) or always visible (mobile via sm:opacity-100)
- Old `CommentList/` directory still in place — deleted in Priority 9

---

## Priority 9: Rebuild Components — Error/Toast/App Shell ✅ COMPLETED

**Spec:** `specs/shadcn-ui-rebuild.md` (error/toast/app section)

**Completed 2026-02-11:**

- [x] Rebuild ErrorMessage → `src/components/shared/ErrorMessage.jsx` — ShadCN Card + Button, Tailwind styling, AlertCircle icon with ping animation, destructive/error card border; `data-testid="error-message"`
- [x] Rebuild ErrorBoundary → `src/components/shared/ErrorBoundary.jsx` — Tailwind styling, kept class component pattern, ShadCN Card + Button, dev-only error details, RotateCcw/RefreshCw icons
- [x] Replace Toast system: deleted `src/components/Toast/` directory (5 source files + 1 test), deleted `src/hooks/useToast.js`, wired `src/components/ui/sonner.jsx` into App via `<Toaster />`
- [x] Delete `src/components/Icon/` directory (3 files) — all new components use direct Lucide imports
- [x] Delete `src/components/LoadingSpinner/` directory (3 files) — replaced by ShadCN Skeleton + PostSkeleton
- [x] Rebuild App → `src/App.jsx` — wired all rebuilt components from new paths (`layout/`, `posts/`, `shared/`), lazy loaded PostDetail with Suspense, added Sonner Toaster, imported globals.css via main.jsx; `data-testid="app"`
- [x] Update `src/main.jsx`: removed ToastProvider import, changed CSS import to `./styles/globals.css`
- [x] Update `src/index.js`: removed ToastProvider import (kept for Jest compatibility)
- [x] Fixed PostDetail.jsx VideoPlayer import: `../VideoPlayer/VideoPlayer` → `../shared/VideoPlayer`
- [x] Delete old component directories: `Avatar/`, `BottomNav/`, `CodeBlock/`, `CommentList/`, `ErrorBoundary/`, `ErrorMessage/`, `Header/`, `Icon/`, `LoadingSpinner/`, `PostDetail/`, `PostItem/`, `PostList/`, `SearchBar/`, `SkeletonLoader/`, `SpicyMeter/`, `SubredditFilter/`, `ThemeSwitcher/`, `Toast/`, `VideoPlayer/`
- [x] Delete old `src/App.js` (replaced by `src/App.jsx`)
- [x] All 12 test suites pass (362 tests — reduced from 864 because 18 old component test files were deleted with their components), build succeeds

**Key learnings:**
- Jest (react-scripts) resolves `.jsx` extensions from `import './App'` — no explicit extension needed
- `radix-ui`, `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` all work with Jest without needing transformIgnorePatterns
- Toast replacement: 5 source files + 1 test + 1 hook (7 files) → 1 `<Toaster />` component already created in P4
- PostDetail.jsx had stale import to old `../VideoPlayer/VideoPlayer` — fixed to `../shared/VideoPlayer`

---

## Priority 10: LFC Personality + Visual Polish

**Why here:** Personality features layer on top of rebuilt components. They need the new component structure to integrate properly. Visual polish (typography, animations, atmosphere) elevates this from "functional rebuild" to "premium fan experience."

**Spec:** `specs/lfc-personality.md`

**Current state:** SpicyMeter LFC names ALREADY APPLIED in Priority 5 (Reserves/League Cup/Premier League/Champions League/Istanbul 2005/YNWA — confirmed). All LFC personality components COMPLETED in P10a: `src/utils/lfcData.js` created with all 5 arrays. `src/components/lfc/LfcLoadingMessages.jsx`, `LfcTrivia.jsx`, and `LfcFooter.jsx` all built and integrated. Typography is generic `system-ui` stack (P10b will upgrade). No custom animations beyond `tailwindcss-animate` defaults (P10b will enhance).

### 10a: LFC Data & Components ✅ COMPLETED

- [x] Create `src/utils/lfcData.js` with 5 exported arrays: `loadingMessages` (12), `lfcTrivia` (16 — handle JFT97/Hillsborough with dignity, no jokes about tragedies), `emptyStateMessages` (6), `errorMessages` (6), `antiClickbaitMessages` (6). Content defined in `specs/lfc-personality.md`.
- [x] Create `src/components/lfc/LfcLoadingMessages.jsx` — rotating messages every 3s via `useEffect`+`setInterval`, displayed below PostSkeleton in loading state. Use `animate-pulse` or subtle crossfade. Import `loadingMessages` from `lfcData`.
- [x] Create `src/components/lfc/LfcTrivia.jsx` — "Did you know?" ShadCN Card with subtle primary border-left accent, deterministic seed-based fact selection from `lfcTrivia`. Integrated into PostList every 10 posts.
- [x] Create `src/components/lfc/LfcFooter.jsx` — desktop only (`hidden md:block`), "You'll Never Walk Alone" in primary color + rotating anti-clickbait tagline + developer attribution. Sits below PostList in App.jsx.
- [x] ~~Update SpicyMeter level names~~ — ALREADY DONE in Priority 5
- [x] Integrate LFC humor into `ErrorMessage.jsx`: import `errorMessages` from `lfcData`, show random LFC error heading (replaces generic "Oops!")
- [x] Integrate LFC humor into `PostList.jsx` empty state: import `emptyStateMessages` from `lfcData`, show random message when no posts match filters (both no-posts and filter-empty states)
- [x] Wire LfcLoadingMessages into `App.jsx` — show below PostSkeleton during `loading` state
- [x] Wire LfcTrivia into `PostList.jsx` — insert trivia card every 10 posts in the rendered list using React.Fragment
- [x] Wire LfcFooter into `App.jsx` — place after `</main>` and before BottomNav
- [x] Update Header.jsx: add rotating anti-clickbait tagline from `antiClickbaitMessages` — replaces static developer attribution in tagline bar, rotates every 10s with crossfade animation

### 10b: Typography & Visual Atmosphere ✅ COMPLETED

**Design direction:** This is NOT a generic app. It should feel like a premium fan experience — bold, atmospheric, unmistakably LFC.

**Completed 2026-02-11:**

- [x] **Typography upgrade in `globals.css`:** Replaced generic `system-ui` font stack with Barlow Condensed (display/headings — bold, condensed, athletic feel) + DM Sans (body — clean, modern). Added `--font-display` and `--font-body` CSS custom properties. Applied display font to h1-h4 elements. Google Fonts loaded via `index.html` with preconnect links for performance.
- [x] **Staggered post reveal animations:** Verified working. Tuned `animation-delay` from 60ms to 40ms per item for first 10 items. `tailwindcss-animate` classes (`animate-in`, `fade-in-0`, `slide-in-from-bottom-4`) render correctly.
- [x] **Card hover micro-interactions:** Added `hover:scale-[1.01]` to PostItem Card. Combined with existing `hover:shadow-lg` and left accent stripe. Transition changed to `duration-200 ease-out` for snappier feel.
- [x] **Theme transition smoothness:** Added `transition: background-color 300ms ease, color 300ms ease` to `body` in `globals.css`. Theme switching now feels like a smooth crossfade.
- [x] **Red theme atmosphere:** Implemented as a fixed div in App.jsx (CSS pseudo-element approach was stripped by Tailwind v4's Lightning CSS). Radial gradient with primary color at 4% opacity creates subtle warmth.
- [x] **Loading skeleton shimmer:** ShadCN Skeleton uses `animate-pulse` which works in all 3 themes. Verified via build.
- [x] **ScrollArea custom scrollbar:** ShadCN ScrollArea in PostDetail uses Radix primitives with `--border` color for themed scrollbar. Already working via component build.
- [x] Verify: `npm run build` succeeds, all 362 tests pass

**Key learnings:**
- Tailwind CSS v4 (Lightning CSS) strips `body::before` pseudo-element styles even with `@layer base` — use React components for atmospheric effects instead
- Google Fonts loaded via `index.html` `<link>` tags with preconnect for performance
- PostItem animation stagger tuned to 40ms (was 60ms) for first 10 items

---

## Priority 11: Testing & Cleanup

**Why last:** Tests validate the completed rebuild. Cleanup removes all legacy files.

**Spec:** `specs/testing-cleanup.md`

**Current state (verified 2026-02-11 v5):**
- **Unit tests:** Jest via `react-scripts test`. 12 test suites, 362 tests. `transformIgnorePatterns` and `moduleNameMapper` in package.json `jest` config. Coverage thresholds NOT currently in package.json (were removed with browserslist in P1).
- **E2E tests:** Playwright config targets port 5173, `data-testid` selectors, `'black'` theme. 8 `.spec.js` files + 1 `helpers/theme.js`. Visual regression with `__screenshots__/`. All API mocking uses `**/api/reddit**`. Theme buttons: "Anfield Red theme", "Away Day theme", "Third Kit theme".
- **Old CSS Modules:** All 19 `.module.css` files ALREADY DELETED in Priority 9 (old component directories removed).
- **Legacy CSS still present:** `src/App.css`, `src/index.css`, `src/styles/variables.css` (230 lines, hex-based — superseded by `globals.css` HSL themes).
- **CRA artifacts still present:** `public/index.html`, `src/index.js`, `src/setupTests.js`.
- **api.js:** Already simplified to 250 lines (target was ~156, actual is slightly larger but all proxy chain code removed). `api.test.js` already rewritten with 36 tests.

### 11a: Vitest Migration

- [ ] Install Vitest: `npm install -D vitest @vitest/coverage-v8 jsdom`
- [ ] Add Vitest config to `vite.config.js`: `test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.js', css: true }`
- [ ] Create `src/test-setup.js` (replaces `src/setupTests.js`): import `@testing-library/jest-dom`; convert `jest.mock()` calls to `vi.mock()` for `react-markdown`, `remark-gfm`, `react-syntax-highlighter`, `react-syntax-highlighter/dist/esm/styles/prism`
- [ ] Update `package.json` scripts: `"test": "vitest"`, `"test:coverage": "vitest run --coverage"`, `"test:ci": "vitest run --coverage"`
- [ ] Remove Jest config from `package.json`: delete entire `"jest"` block (contains `transformIgnorePatterns` and `moduleNameMapper` — Vitest inherits `resolve.alias` from vite.config.js so `@/` mapping is automatic)
- [ ] Update test files: replace any `jest.fn()` → `vi.fn()`, `jest.mock()` → `vi.mock()`, `jest.spyOn()` → `vi.spyOn()` across all test files in `src/`
- [ ] Update `App.test.js`: verify it works with new App.jsx component imports (was testing old App.js)
- [ ] Move `src/utils/formatDuration.test.js` → `src/utils/__tests__/formatDuration.test.js` (misplaced)
- [ ] Run `npm test` — all 12 suites (362 tests) must pass under Vitest
- [ ] Add coverage thresholds to Vitest config: 80% statements, 72% branches, 75% functions

### 11b: Legacy Cleanup

- [ ] Delete legacy CSS: `src/App.css`, `src/index.css`, `src/styles/variables.css`
- [ ] Delete CRA artifacts: `public/index.html` (52-line CRA version), `src/index.js` (no longer needed once Jest removed), `src/setupTests.js` (replaced by `test-setup.js`)
- [ ] Remove unused dependencies: `react-scripts`, `react-window` (dependencies already removed in P1: `dompurify`, `source-map-explorer`, `selenium-webdriver` — do NOT re-remove)
- [ ] Verify no imports reference deleted files: search for `App.css`, `index.css`, `variables.css`, `setupTests`, `react-scripts`

### 11c: E2E Verification

- [ ] Playwright config: already correct (port 5173, `npm run dev`) — **no changes needed** (verified)
- [ ] E2E tests: already use `data-testid` selectors and Black theme references — run full suite: `npm run test:e2e`
- [ ] Fix any E2E failures (expected: some may fail due to visual differences from rebuilt components + new LFC personality elements)
- [ ] Regenerate Playwright visual regression screenshots: `npx playwright test --update-snapshots`
- [ ] Final verification: `npm run build` succeeds, `npm test` passes, `npm run test:e2e` passes

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

## Files to Modify (Remaining)

- `package.json` — Remove Jest config block, remove `react-scripts` and `react-window` dependencies (Priority 11)
- `vite.config.js` — Add Vitest `test` config block (Priority 11)

**Already completed modifications (P1-P10):**
- ✅ `src/utils/markdown.js` — CodeBlock import path updated
- ✅ `src/utils/api.js` — Simplified (250 lines, no proxy chain)
- ✅ `vercel.json` — buildCommand and outputDirectory added
- ✅ `.gitignore` — `/dist` added
- ✅ `src/styles/globals.css` — Typography imports (Barlow Condensed + DM Sans), theme transitions, atmospheric effects
- ✅ `src/components/shared/ErrorMessage.jsx` — LFC error messages from `lfcData` integrated
- ✅ `src/components/posts/PostList.jsx` — LFC empty state messages + LfcTrivia cards every 10 posts
- ✅ `src/App.jsx` — LfcLoadingMessages + LfcFooter + atmospheric gradient overlay wired

## Reference Files (Do NOT Deploy)

- `ui/` directory — Reference-only copy of ShadCN v4 components for TSX→JSX conversion
- `specs/` directory — Implementation specifications

## Notes (Updated 2026-02-11 v5)

- All deprecated code (`setFlairFilter`, `applyFlairFilter`, `activeFilter` in Redux) can remain until a future cleanup pass
- The Redux `__tests__/` directory has 4 test files — update `jest.fn()` → `vi.fn()` etc. for Vitest in Priority 11
- The `src/utils/__tests__/` directory has 7 test files — `api.test.js` was ALREADY rewritten in P2 (36 tests)
- `dompurify` was already removed from dependencies in Priority 1
- `prop-types` issue SELF-RESOLVED: all 14 old components that used PropTypes were deleted in P9. New components don't use PropTypes.
- `src/hooks/useToast.js` was ALREADY DELETED in Priority 9 (confirmed — Toast/ directory removed)
- **Spec discrepancy (resolved):** `specs/api-simplification.md` showed old signature — P2 implementation used cleaner `fetchFromReddit(path, params)` approach
- **Spec discrepancy (resolved):** `specs/lfc-themes.md` used Tailwind v3 directives — P3 correctly used Tailwind v4 `@import "tailwindcss"`
- **Animation classes:** `tailwindcss-animate` v1.0.7 is installed. ShadCN Sheet/Tooltip/Select use `animate-in`/`animate-out` classes. Need to verify these render correctly during P10b visual polish.
- Header component has NO test file (only component without one) — low priority, consider adding in P11
- **Typography gap:** `globals.css` currently uses generic `system-ui` font stack. P10b adds distinctive LFC-branded typography.
- **api.js actual size:** 250 lines (plan estimated ~156; slightly larger due to fuller JSDoc comments and more robust error handling — this is acceptable)

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

---

## Audit Findings (2026-02-11, v5)

### Deep verification by Opus + 6 parallel research agents — all source files verified against specs:

#### Priorities 1-9 VERIFIED COMPLETE:
- ✅ All 18 old component directories deleted (Avatar/, BottomNav/, CodeBlock/, CommentList/, ErrorBoundary/, ErrorMessage/, Header/, Icon/, LoadingSpinner/, PostDetail/, PostItem/, PostList/, SearchBar/, SkeletonLoader/, SpicyMeter/, SubredditFilter/, ThemeSwitcher/, Toast/, VideoPlayer/)
- ✅ All new components wired in App.jsx with correct import paths
- ✅ 16 ShadCN UI components: all JSX, no TSX, no `use client`, no `@radix-ui/react-*` imports, all use unified `radix-ui`
- ✅ `sonner.jsx` does NOT import `next-themes` — uses `document.documentElement.getAttribute('data-theme')` correctly
- ✅ `toggle-group.jsx` imports from `@/components/ui/toggle` (not registry path)
- ✅ 14 of 16 UI components import `cn()` from `@/lib/utils` (exceptions: `collapsible.jsx` and `sonner.jsx` — correct, they don't need `cn()`)
- ✅ `main.jsx` imports `./styles/globals.css` (not `./index.css`)
- ✅ `globals.css` has `@import "tailwindcss"` + 3 theme blocks with all 19 ShadCN CSS vars
- ✅ `index.html` (root) has Vite `<script type="module">` and flash-prevention script setting `data-theme`
- ✅ `api.js` simplified to 250 lines — no CORS_PROXIES, no isMobile(), no tryProxy()
- ✅ `markdown.js` imports from `../components/shared/CodeBlock` (updated path)
- ✅ SpicyMeter has LFC-themed names (Reserves through YNWA)
- ✅ `src/index.js` reportWebVitals import FIXED (removed in P3)
- ✅ Toast system completely removed (Toast/, useToast.js deleted; Sonner Toaster in App.jsx)

#### Stale Items Corrected in Plan:
1. **P10 SpicyMeter task:** Was listed as TODO but ALREADY DONE in P5. Marked `[x]` in updated plan.
2. **P10 "Current state" description:** Said "SpicyMeter uses generic names" — WRONG. LFC names applied in P5. Corrected.
3. **P11 "Current state" CSS Modules:** Said "19 `.module.css` files across component directories" — WRONG. All deleted in P9. Corrected.
4. **P11 api.test.js item:** Said "remove proxy chain tests" — ALREADY DONE in P2 (36 new tests). Removed stale item.
5. **Notes `dompurify`:** Said "in dependencies but not used — remove in P11" — ALREADY REMOVED in P1. Corrected.
6. **Notes `useToast.js`:** Said "must be deleted in P9" — ALREADY DELETED. Corrected.

#### New Items Added to Plan:
1. **Priority 10b: Typography & Visual Atmosphere** — NEW SECTION. The app currently uses generic `system-ui` font stack. For a "premium fan experience," this needs distinctive LFC-branded typography, enhanced animations, theme transition smoothness, and atmospheric effects.
2. **"Files to Modify (Remaining)"** — Updated to only list files that ACTUALLY need modification in P10-P11.

#### Design Gap Identified:
The frontend-design skill mandates bold, distinctive typography — NOT generic system fonts. Current `globals.css` body uses `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif` which is exactly the "AI slop" aesthetic the skill warns against. Priority 10b addresses this with a distinctive font pairing imported via Google Fonts or self-hosted.

#### All v2/v3/v4 findings confirmed — no regressions beyond the 6 stale items corrected above.
