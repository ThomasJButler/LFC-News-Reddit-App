# Implementation Plan — LFC Reddit Viewer v2.0

## Priority 1: Foundation (Vite Migration)
- [ ] Create `vite.config.js` with `@/` path alias and `/api/reddit` dev proxy
- [ ] Create `postcss.config.js` with `@tailwindcss/postcss` plugin
- [ ] Move `public/index.html` to project root as Vite `index.html` with `<script type="module" src="/src/main.jsx">`
- [ ] Create `src/main.jsx` as new entry point (replaces `src/index.js`)
- [ ] Create `src/lib/utils.js` with ShadCN `cn()` function (clsx + tailwind-merge)
- [ ] Update `package.json`: remove react-scripts/react-window/web-vitals, add vite/@vitejs/plugin-react/tailwindcss/CVA/clsx/tailwind-merge/sonner/Radix UI primitives
- [ ] Update `vercel.json` with `buildCommand` and `outputDirectory: "dist"`
- [ ] Delete CRA artifacts: `src/index.js`, `src/reportWebVitals.js`, `src/setupTests.js`, `src/logo.svg`, `public/index.html`
- [ ] Verify: `npm run dev` starts, `npm run build` produces `dist/`, app renders

## Priority 2: Fix Mobile (API Simplification)
- [ ] Simplify `src/utils/api.js`: remove CORS_PROXIES array, tryProxy(), isMobile(), all fallback logic
- [ ] Implement new `fetchFromReddit()` that routes all requests through `/api/reddit?path=...`
- [ ] Keep: RateLimiter, processPostData, processCommentData, validateSubreddit, cache, all exported functions
- [ ] Verify: posts load on mobile browser without CORS errors

## Priority 3: Theme System
- [ ] Create `src/styles/globals.css` with Tailwind directives + 3 theme definitions (Red, White, Black)
- [ ] Convert existing theme hex values to HSL format for ShadCN CSS variables
- [ ] Red theme (default `:root`): dark bg #0f0f0f, LFC red #C8102E
- [ ] White theme (`[data-theme="white"]`): cream bg #f5f0e8, red accents
- [ ] Black theme (`[data-theme="black"]`): pure black #000000, red accents, OLED-friendly

## Priority 4: ShadCN Components
- [ ] Copy ~15 ShadCN components from `ui/apps/v4/registry/new-york-v4/ui/` to `src/components/ui/`
- [ ] Convert each TSX file to JSX (remove type annotations, remove "use client")
- [ ] Components: card, button, badge, sheet, tabs, skeleton, scroll-area, separator, toggle, toggle-group, tooltip, select, avatar, input, collapsible
- [ ] Install Radix UI dependencies
- [ ] Verify: each component imports and renders correctly

## Priority 5: Rebuild Components — Leaf Components First
- [ ] Rebuild Avatar (`src/components/shared/Avatar.jsx`) — ShadCN Avatar + colorHash utility
- [ ] Rebuild SpicyMeter (`src/components/lfc/SpicyMeter.jsx`) — Tailwind, LFC-themed level names
- [ ] Rebuild CodeBlock (`src/components/shared/CodeBlock.jsx`) — Tailwind classes
- [ ] Rebuild VideoPlayer (`src/components/shared/VideoPlayer.jsx`) — keep HLS.js, Tailwind classes

## Priority 6: Rebuild Components — Post Components
- [ ] Rebuild PostItem (`src/components/posts/PostItem.jsx`) — ShadCN Card + Badge, Tailwind responsive
- [ ] Rebuild PostSkeleton (`src/components/posts/PostSkeleton.jsx`) — ShadCN Skeleton in Card
- [ ] Rebuild PostList (`src/components/posts/PostList.jsx`) — remove react-window, keep filters/pagination
- [ ] Rebuild PostDetail (`src/components/posts/PostDetail.jsx`) — ShadCN Sheet, ScrollArea

## Priority 7: Rebuild Components — Layout & Navigation
- [ ] Rebuild Header (`src/components/layout/Header.jsx`) — sticky, backdrop-blur, tagline
- [ ] Rebuild SearchBar (`src/components/shared/SearchBar.jsx`) — ShadCN Input + Button
- [ ] Rebuild SortBar (`src/components/layout/SortBar.jsx`) — ShadCN Tabs for sort, Select for time range
- [ ] Rebuild FilterPanel (`src/components/layout/FilterPanel.jsx`) — Collapsible + ToggleGroup
- [ ] Rebuild ThemeSwitcher (`src/components/layout/ThemeSwitcher.jsx`) — ToggleGroup, 3 swatches
- [ ] Rebuild BottomNav (`src/components/layout/BottomNav.jsx`) — mobile only, Button ghost

## Priority 8: Rebuild Components — Comments
- [ ] Rebuild CommentList (`src/components/comments/CommentList.jsx`) — ScrollArea, Separator
- [ ] Rebuild Comment (`src/components/comments/Comment.jsx`) — Collapsible, Avatar, Badge
- [ ] Rebuild CommentSkeleton (`src/components/comments/CommentSkeleton.jsx`) — ShadCN Skeleton

## Priority 9: Rebuild Components — Error/Toast/App
- [ ] Rebuild ErrorMessage (`src/components/shared/ErrorMessage.jsx`) — Card + LFC error messages
- [ ] Rebuild ErrorBoundary (`src/components/shared/ErrorBoundary.jsx`) — Tailwind styling
- [ ] Replace Toast system with Sonner (delete Toast/, add sonner.jsx, add Toaster to App)
- [ ] Delete Icon component directory (use direct Lucide imports everywhere)
- [ ] Rebuild App.jsx — wire up all components, lazy load PostDetail, Toaster

## Priority 10: LFC Personality
- [ ] Create `src/utils/lfcData.js` with loading messages, trivia, empty states, errors, anti-clickbait
- [ ] Create LfcLoadingMessages component — rotating messages during loading
- [ ] Create LfcTrivia component — random "Did you know?" card
- [ ] Create LfcFooter component — YNWA + anti-clickbait tagline
- [ ] Apply LFC-themed SpicyMeter levels
- [ ] Add LFC humor to error and empty states

## Priority 11: Testing & Cleanup
- [ ] Migrate test runner from Jest to Vitest (add config to vite.config.js)
- [ ] Update api.test.js for simplified api.js (no more proxy chain tests)
- [ ] Update Playwright config for Vite dev server port (5173)
- [ ] Delete all 19 CSS Module files
- [ ] Delete App.css, index.css, styles/variables.css
- [ ] Delete Icon/, LoadingSpinner/, Toast/ component directories
- [ ] Remove unused dependencies from package.json
- [ ] Verify: all unit tests pass, all e2e tests pass, build succeeds
- [ ] Final verification on mobile devices
