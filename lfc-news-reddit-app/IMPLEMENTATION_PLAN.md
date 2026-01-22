# Implementation Plan

*Last updated: January 2026*

---

## Current Status

The app is functionally complete with strong test coverage:
- **Test Coverage**: 82.68% statements, 75.81% branches
- **Unit Tests**: 848 passing tests
- **E2E Tests**: 492 functional tests (Playwright)
- **Components**: 20 React components

**Remaining work: Optional P3 production audits only**

---

## Priority Summary

| Priority | Category | Status | Remaining Items | Est. Effort |
|----------|----------|--------|-----------------|-------------|
| **P0** | Theme Final Polish | 100% | 0 items | Complete |
| **P1** | Comment Threading | 100% | 0 items | Complete |
| **P1** | Post Card Polish | 100% | 0 items | Complete |
| **P1** | Visual Testing | 100% | 0 items | Complete |
| **P2** | Test Coverage Gaps | 100% | 0 items | Complete |
| **P3** | Production Audits | 0% | Optional | 2-4 hours |

**Target**: 9+/10 production quality - **ACHIEVED**

---

## P0 - Theme Final Polish (Current Priority)

**Spec**: `specs/theme-final-polish.md`

### 1. Theme Picker Desktop Redesign

**Status**: COMPLETE

Replaced dropdown `<select>` with visual button group showing colour swatches and kit names (Home, Away, Keeper).

**Implemented**:
- [x] Replace `<select>` with visual button group
- [x] Each button shows: circular colour swatch + short name (Home, Away, Keeper)
- [x] Active state with ring/border highlight (use `--accent` border)
- [x] Hover effect with subtle scale (`transform: scale(1.05)`)
- [x] 44px minimum touch targets

---

### 2. Remove Night Mode

**Status**: COMPLETE

Removed night theme entirely, leaving only 3 themes (red, white, green).

**Implemented**:
- [x] Remove 'night' from themes array in ThemeSwitcher.js
- [x] Update `getSystemPreference()` to return 'red' instead of 'night'
- [x] Remove 'night' from BottomNav.js themes array
- [x] Update modulo from `% 4` to `% 3` in BottomNav.js
- [x] DELETE `[data-theme="night"]` CSS block in variables.css
- [x] Update any tests that reference 'night' theme

---

### 3. Away Kit Cream Colours

**Status**: COMPLETE

Updated white theme from pure white to warm cream colours (#f5f0e8, #fcf9f4, #ebe4d8).

**Implemented**:
- [x] Update `--bg-primary` to `#f5f0e8`
- [x] Update `--bg-secondary` to `#fcf9f4`
- [x] Update `--bg-tertiary` to `#ebe4d8`
- [x] Update `--bg-glass` to `rgba(252, 249, 244, 0.9)`
- [x] Update `--bg-gradient`
- [x] Update `--skeleton-highlight` to `#d9d2c4`
- [x] Verify WCAG AA contrast on text colours (4.5:1 minimum)

---

### 4. Mobile Search Input Zoom Fix

**Status**: COMPLETE

Already implemented at `src/components/SearchBar/SearchBar.module.css` line 121:
```css
font-size: 16px;
```

---

## P1 - Comment Threading Polish (100% Complete)

### 1. Indentation Values

**Status**: COMPLETE

Updated indentation values per spec (`src/components/CommentList/CommentList.js` lines 97-99):
```javascript
const levelIndent = isMobile
  ? Math.min(comment.level * 16, 64)  // Mobile: 16px per level, max 64px (4 levels)
  : Math.min(comment.level * 24, 120);  // Desktop: 24px per level, max 120px (5 levels)
```

**Implemented**:
- [x] Changed mobile indent from `12` to `16`
- [x] Changed mobile max from `40` to `64`
- [x] Changed desktop indent from `20` to `24`
- [x] Changed desktop max from `100` to `120`

---

### 2. Max-Level Flattening

**Status**: COMPLETE

Added `MAX_NESTING_LEVEL = 6` constant and capping logic in `flattenComments` function.

**Implemented**:
- [x] Added `MAX_NESTING_LEVEL = 6` constant
- [x] Comments at depth 7, 8, 9+ now render at depth 6 indent
- [x] Logic: `Math.min(level, MAX_NESTING_LEVEL)` in traverse function

---

## P1 - Post Card Polish (100% Complete)

### 1. Gradient Stripe Position

**Status**: COMPLETE

Updated gradient accent stripe from top (horizontal) to left edge (vertical 4px) per spec.

**Implemented** (`src/components/PostItem/PostItem.module.css` lines 43-56):
- [x] Changed `right: 0` to `bottom: 0`
- [x] Changed `height: 3px` to `width: 4px`

---

### 2. Hover Transform

**Status**: COMPLETE

Added subtle scale(1.005) to hover transform for polish.

**Implemented** (`src/components/PostItem/PostItem.module.css` line 61):
- [x] Transform now: `translateY(-2px) scale(1.005)`

---

### 3. Thumbnail Gallery Indicator

**Status**: COMPLETE

Moved gallery icon from inline title to thumbnail overlay (bottom-right corner).

**Implemented**:
- [x] Created `.galleryOverlay` CSS class (absolute positioned, bottom-right)
- [x] Moved gallery `<Icon>` from title area to thumbnail section
- [x] Styled with semi-transparent dark background (`rgba(0,0,0,0.75)`)
- [x] Added gallery count display when available from galleryData
- [x] Added `xs` icon size to Icon component for compact overlays

---

### 4. Video Duration Overlay

**Status**: COMPLETE

Implemented video duration overlay on thumbnail showing formatted duration (e.g., "3:24").

**Implemented**:
- [x] Created `src/utils/formatDuration.js` utility
- [x] Created `src/utils/formatDuration.test.js` with comprehensive tests (9 test cases)
- [x] Extract video duration from `post.media.reddit_video.duration`
- [x] Moved video indicator to thumbnail section with duration text
- [x] Created `.videoDuration` CSS class (bottom-right, semi-transparent background)
- [x] Added play icon for visual context

---

### 5. Flair Badge Position

**Status**: VERIFIED CORRECT

Current position is BEFORE title (lines 192-197 come before title at line 199).
No changes needed.

---

## P1 - Visual Testing (100% Complete)

### 1. Dynamic Content Masking

**Status**: COMPLETE

Added `getDynamicContentMasks()` helper function and applied masking to all visual tests.

**Implemented**:
- [x] Created `getDynamicContentMasks()` in `e2e/helpers/theme.js`
- [x] Added masking to `home.spec.js` (Default State, Post Card Hover State)
- [x] Added masking to `comments.spec.js` (Thread Lines, User Badges, Deep Nesting)
- [x] Added masking to `post-detail.spec.js` (Modal Open State, Comments Loaded, Modal Overlay)
- [x] Added masking to `components.spec.js` (Post Card Default, Post Card Focused)

---

### 2. Error State Visual Tests

**Status**: COMPLETE

Added error state visual tests to `e2e/visual/home.spec.js`.

**Implemented**:
- [x] Added `test.describe('Error State')` block
- [x] Mock API to abort requests (simulating network failure)
- [x] Capture `home-error` screenshot for each theme

---

### 3. Deep Comment Nesting Tests

**Status**: COMPLETE

Added deep nesting visual tests to `e2e/visual/comments.spec.js`.

**Implemented**:
- [x] Added `test.describe('Deep Nesting')` block
- [x] Logic to find deeply nested comments by checking padding
- [x] Capture `comments-deep` screenshot for each theme
- [x] Graceful skip when no deep comments are found

---

## P2 - Test Coverage Gaps (100% Complete)

### Components with Low Coverage

**Status**: COMPLETE

All P2 test coverage gaps have been addressed:

| Component | Previous | Current | Notes |
|-----------|----------|---------|-------|
| CodeBlock | 16.66% | 100% | Added comprehensive test suite with 28 tests |
| SpicyMeter | 90.9% | 100% | Added dedicated test suite with 31 tests |

**Updated Coverage** (2026-01-22):
- Statements: 82.68% (exceeds 80% target)
- Branches: 75.81% (exceeds 75% target)
- Tests: 848 passing

**Implemented**:
- [x] Add `CodeBlock.test.js` - Tests inline code, syntax highlighting, copy functionality, language detection, accessibility
- [x] Add `SpicyMeter.test.js` - Tests all spiciness levels, boundary values, chili rendering, accessibility

---

## P3 - Optional (Low Priority)

### Production Audits

- [ ] Run Lighthouse audits (target: Performance 90+, Accessibility 95+)
- [ ] Verify Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Add `analyze` script with source-map-explorer to package.json

### Animation Enhancements (Intentionally Deferred)

**Note**: Score bump and upvote bounce animations were intentionally not implemented for distraction-free UX (no interactive voting in this read-only app).

---

## Completed Work (Archive)

The following has been completed and verified:

### Theme Polish
- [x] Mobile Search Input Zoom Fix - font-size: 16px prevents iOS Safari zoom (SearchBar.module.css line 121)

### Toast Notification System (100%)
- [x] All 4 notification types (success, error, warning, info)
- [x] Mobile/desktop positioning
- [x] Auto-dismiss with progress indicator
- [x] Swipe-to-dismiss gesture
- [x] Full accessibility (ARIA live regions)
- [x] Comprehensive test coverage

### Skeleton Loaders (100%)
- [x] All 6 types: Header, SubredditFilter, PostDetail, Search, PostItem, Comments
- [x] Shimmer animation with proper timing
- [x] Reduced motion support
- [x] Theme-aware colours
- [x] Empty state handling
- [x] Test coverage

### Comment Threading (100%)
- [x] Avatar system with initials fallback
- [x] User badges (OP badge, Mod badge)
- [x] Thread lines (3px width, clickable to collapse)
- [x] Collapse animation (300ms ease-out)
- [x] Action bar with pill-style Reply/Share buttons
- [x] Full keyboard accessibility
- [x] Updated indentation values (16px mobile, 24px desktop)
- [x] Max-level flattening (cap at level 6)

### Post Card Polish (100%)
- [x] Typography hierarchy (title, metadata, preview)
- [x] Pill-style footer action buttons
- [x] Staggered list entrance animations
- [x] Metadata bar with timestamps
- [x] Focus states and keyboard navigation
- [x] Mobile responsive layout
- [x] Gradient accent stripe on left edge (4px)
- [x] Hover transform with subtle scale(1.005)
- [x] Thumbnail gallery indicator overlay (bottom-right, shows count)
- [x] Video duration overlay (bottom-right, shows M:SS format)

### Animation Refinements (100%)
- [x] Staggered list animations (50ms delay)
- [x] Chevron rotation on expand/collapse
- [x] Button press feedback (scale transform)
- [x] Error shake animation on retry
- [x] Modal open/close transitions
- [x] Reduced motion media query support

### Visual Testing Infrastructure (100%)
- [x] Playwright configuration
- [x] 3 viewport sizes (mobile, tablet, desktop)
- [x] Theme switching test helpers
- [x] CI workflow integration
- [x] npm scripts for local/CI runs
- [x] Dynamic content masking helper (`getDynamicContentMasks`)
- [x] Error state visual tests
- [x] Deep comment nesting visual tests

### Core Infrastructure
- [x] E2E Functional Tests (492 tests)
- [x] Test Coverage (82.43% - exceeds 80% target)
- [x] React 18.3+ defaultProps Migration
- [x] Empty States
- [x] Reduced Motion Support
- [x] No critical TODOs or FIXMEs in source code

---

## Verification Commands

```bash
# Run all tests
npm test -- --watchAll=false

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Build check
npm run build

# Lint check
npm run lint

# Visual regression tests (requires dev server running)
npm run test:e2e:visual

# Full E2E test suite
npx playwright test

# Update visual baselines (after intentional changes)
npx playwright test --update-snapshots
```

---

## Implementation Order (Completed)

### Phase 1: P0 Theme Polish ✅
1. ~~Remove Night Mode~~ DONE
2. ~~Update Away Kit Cream Colours~~ DONE
3. ~~Theme Picker Desktop Redesign~~ DONE

### Phase 2: P1 Quick Wins ✅
4. ~~Comment indentation values (4 value changes)~~ DONE
5. ~~Post card hover transform (1 line)~~ DONE
6. ~~Gradient stripe position (2 lines)~~ DONE

### Phase 3: P1 Features ✅
7. ~~Max-level comment flattening~~ DONE
8. ~~Thumbnail gallery indicator~~ DONE
9. ~~Video duration overlay~~ DONE

### Phase 4: P1 Testing ✅
10. ~~Dynamic content masking~~ DONE
11. ~~Error state visual tests~~ DONE
12. ~~Deep nesting visual tests~~ DONE

---

## Notes

- Source code has no critical TODOs or FIXMEs requiring attention
- 30 `test.skip()` calls are intentional viewport filtering, not skipped tests
- All animation features verified complete with reduced motion support
- Icon component now supports `xs` size (12px) for compact overlays

---

*Last updated: 2026-01-22*
