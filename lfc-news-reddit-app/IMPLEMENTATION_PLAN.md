# Implementation Plan

*Last updated: January 2026*

---

## Current Status

The app is functionally complete with strong test coverage:
- **Test Coverage**: 82.43% statements, 75.36% branches
- **Unit Tests**: 773 passing tests
- **E2E Tests**: 492 functional tests (Playwright)
- **Components**: 20 React components

**Remaining work: Final 5% polish**

---

## Priority Summary

| Priority | Category | Status | Remaining Items | Est. Effort |
|----------|----------|--------|-----------------|-------------|
| **P0** | Theme Final Polish | 100% | 0 items | Complete |
| **P1** | Comment Threading | 95% | 2 items | 1-2 hours |
| **P1** | Post Card Polish | 90% | 4 items | 2-3 hours |
| **P1** | Visual Testing | 89% | 3 test additions | 1-2 hours |
| **P2** | Test Coverage Gaps | N/A | 2 components | 1-2 hours |
| **P3** | Production Audits | 0% | Optional | 2-4 hours |

**Target**: 9+/10 production quality

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

## P1 - Comment Threading Polish (95% Complete)

### 1. Indentation Values

**Status**: NEEDS UPDATE

**Current** (`src/components/CommentList/CommentList.js` lines 97-99):
```javascript
const levelIndent = isMobile
  ? Math.min(comment.level * 12, 40)  // Mobile: 12px per level, max 40px
  : Math.min(comment.level * 20, 100);  // Desktop: 20px per level, max 100px
```

**Required** (per spec):
```javascript
const levelIndent = isMobile
  ? Math.min(comment.level * 16, 64)  // Mobile: 16px per level, max 64px (4 levels)
  : Math.min(comment.level * 24, 120);  // Desktop: 24px per level, max 120px (5 levels)
```

**Checklist**:
- [ ] Change mobile indent from `12` to `16` (line 98)
- [ ] Change mobile max from `40` to `64` (line 98)
- [ ] Change desktop indent from `20` to `24` (line 99)
- [ ] Change desktop max from `100` to `120` (line 99)

---

### 2. Max-Level Flattening

**Status**: NOT IMPLEMENTED

**Current Behavior**: Only caps pixel indent, doesn't flatten comments at depth 6+

**Required**: Flatten threads beyond depth 6 (show at level 6 indent regardless of actual depth)

**File**: `src/components/CommentList/CommentList.js`

**Change in `flattenComments` function** (lines 61-77):
- [ ] Add `maxLevel` constant (value: 6)
- [ ] In traverse function, cap level at maxLevel: `Math.min(level, maxLevel)`
- [ ] This ensures comments at depth 7, 8, 9+ all render at depth 6 indent

**Implementation**:
```javascript
const MAX_NESTING_LEVEL = 6;

// In traverse function:
flat.push({ ...comment, level: Math.min(level, MAX_NESTING_LEVEL) });
```

---

## P1 - Post Card Polish (90% Complete)

### 1. Gradient Stripe Position

**Status**: NEEDS UPDATE

**File**: `src/components/PostItem/PostItem.module.css`

**Current** (lines 43-53):
```css
.postItem::before {
  top: 0;
  left: 0;
  right: 0;
  height: 3px;  /* TOP stripe */
}
```

**Required**:
```css
.postItem::before {
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;  /* LEFT stripe */
}
```

**Checklist**:
- [ ] Change `right: 0` to `bottom: 0` (line 48)
- [ ] Change `height: 3px` to `width: 4px` (line 49)

---

### 2. Hover Transform

**Status**: NEEDS UPDATE

**File**: `src/components/PostItem/PostItem.module.css`

**Current** (line 58):
```css
transform: translateY(-2px);
```

**Required**:
```css
transform: translateY(-2px) scale(1.005);
```

**Checklist**:
- [ ] Add `scale(1.005)` to hover transform (line 58)

---

### 3. Thumbnail Gallery Indicator

**Status**: NOT IMPLEMENTED

**Current**: Gallery icon appears inline after title (`PostItem.js` lines 205-207)

**Required**: Gallery indicator as overlay on thumbnail (bottom-right corner)

**Files**:
- `src/components/PostItem/PostItem.js` - Move gallery icon inside `thumbnailSection`
- `src/components/PostItem/PostItem.module.css` - Add `.thumbnailOverlay` positioning

**Checklist**:
- [ ] Create `.thumbnailOverlay` CSS class (absolute positioned, bottom-right)
- [ ] Move gallery `<Icon>` from title area to thumbnail section
- [ ] Style with semi-transparent dark background (`rgba(0,0,0,0.7)`)
- [ ] Add small gallery count if available

---

### 4. Video Duration Overlay

**Status**: NOT IMPLEMENTED

**Current**: Video icon appears inline after title (`PostItem.js` lines 202-204)

**Required**: Video duration overlay on thumbnail (e.g., "3:24")

**Implementation Notes**:
- Reddit API provides video duration in `post.media.reddit_video.duration` (seconds)
- Format as "M:SS" for display
- **Missing utility**: No video duration formatter exists in codebase

**Checklist**:
- [ ] Create duration formatter utility (`src/utils/formatDuration.js`)
  ```javascript
  export const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  ```
- [ ] Extract video duration from post data in PostItem.js
- [ ] Move video indicator to thumbnail section with duration text
- [ ] Add `.videoDuration` CSS class (similar to gallery overlay)
- [ ] Add unit tests for formatDuration utility

---

### 5. Flair Badge Position

**Status**: VERIFIED CORRECT

Current position is BEFORE title (lines 192-197 come before title at line 199).
No changes needed.

---

## P1 - Visual Testing (89% Complete)

### 1. Dynamic Content Masking

**Status**: NOT IMPLEMENTED

**Problem**: Tests may be flaky due to changing timestamps, scores, and usernames

**Solution**: Add `mask` parameter to screenshot assertions

**Files**: `e2e/visual/*.spec.js`

**Example Change**:
```javascript
await expect(page).toHaveScreenshot('home-default.png', {
  fullPage: true,
  mask: [
    page.locator('[class*="time"]'),    // Relative timestamps
    page.locator('[class*="score"]'),   // Vote counts
    page.locator('[class*="upvotes"]'), // Upvote displays
    page.locator('[class*="author"]')   // Usernames
  ]
});
```

**Checklist**:
- [ ] Add masking to `home.spec.js` (4 test groups)
- [ ] Add masking to `comments.spec.js` (3 test groups)
- [ ] Add masking to `post-detail.spec.js`
- [ ] Add masking to `components.spec.js`

---

### 2. Error State Visual Tests

**Status**: NOT IMPLEMENTED

**File**: `e2e/visual/home.spec.js`

**Required**: Add test for home page error state

**Checklist**:
- [ ] Add `test.describe('Error State')` block
- [ ] Mock API to return error response
- [ ] Capture `home-error` screenshot for each theme

---

### 3. Deep Comment Nesting Tests

**Status**: NOT IMPLEMENTED

**File**: `e2e/visual/comments.spec.js`

**Required**: Test visual appearance of deeply nested comments (5+ levels)

**Checklist**:
- [ ] Add `test.describe('Deep Nesting')` block
- [ ] Navigate to post with deep comment threads
- [ ] Scroll to reveal nested comments (level 5+)
- [ ] Capture `comments-deep` screenshot for each theme

---

## P2 - Test Coverage Gaps

### Components with Low Coverage

Current overall coverage: 82.43% statements, 75.36% branches (exceeds 80% target)

| Component | Coverage | Priority | Notes |
|-----------|----------|----------|-------|
| CodeBlock | 16.66% | Low | No dedicated tests - simple wrapper component |
| SpicyMeter | High coverage | Low | No dedicated test file but tested via integration |

**Note**: These are non-critical as overall coverage exceeds targets. The 30 `test.skip()` calls in the test suite are intentional viewport filtering, not skipped tests.

**Checklist** (Optional):
- [ ] Add `CodeBlock.test.js` with basic render tests
- [ ] Add `SpicyMeter.test.js` with prop validation tests

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

### Comment Threading (95%)
- [x] Avatar system with initials fallback
- [x] User badges (OP badge, Mod badge)
- [x] Thread lines (3px width, clickable to collapse)
- [x] Collapse animation (300ms ease-out)
- [x] Action bar with pill-style Reply/Share buttons
- [x] Full keyboard accessibility

### Post Card Polish (90%)
- [x] Typography hierarchy (title, metadata, preview)
- [x] Pill-style footer action buttons
- [x] Staggered list entrance animations
- [x] Metadata bar with timestamps
- [x] Focus states and keyboard navigation
- [x] Mobile responsive layout

### Animation Refinements (100%)
- [x] Staggered list animations (50ms delay)
- [x] Chevron rotation on expand/collapse
- [x] Button press feedback (scale transform)
- [x] Error shake animation on retry
- [x] Modal open/close transitions
- [x] Reduced motion media query support

### Visual Testing Infrastructure (89%)
- [x] Playwright configuration
- [x] 3 viewport sizes (mobile, tablet, desktop)
- [x] Theme switching test helpers
- [x] CI workflow integration
- [x] npm scripts for local/CI runs

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

## Implementation Order (Recommended)

### Phase 1: P0 Theme Polish (Do First)
1. Remove Night Mode (simplifies theme picker work)
2. Update Away Kit Cream Colours
3. Theme Picker Desktop Redesign

### Phase 2: P1 Quick Wins
4. Comment indentation values (4 value changes)
5. Post card hover transform (1 line)
6. Gradient stripe position (2 lines)

### Phase 3: P1 Features
7. Max-level comment flattening
8. Thumbnail gallery indicator
9. Video duration overlay (requires new utility)

### Phase 4: P1 Testing
10. Dynamic content masking
11. Error state visual tests
12. Deep nesting visual tests

---

## Dependencies

- P0 items are independent and can be done in parallel
- P1 visual tests depend on UI changes being complete
- Video duration overlay requires formatDuration utility to be created first
- P3 items have no dependencies

---

## Notes

- Source code has no critical TODOs or FIXMEs requiring attention
- 30 `test.skip()` calls are intentional viewport filtering, not failing tests
- All animation features verified complete with reduced motion support

---

*Document generated from comprehensive codebase audit on 2026-01-22*
