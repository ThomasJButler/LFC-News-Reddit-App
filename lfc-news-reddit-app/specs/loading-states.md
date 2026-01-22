# Comprehensive Loading States

## Overview

Every async operation should have appropriate loading feedback. Replace generic spinners with skeleton loaders that match the content shape.

## Current State

- PostListSkeleton: Implemented
- CommentsSkeleton: Implemented
- LoadingSpinner: Basic 3-bounce animation

## Requirements

### Skeleton Loaders Needed

#### 1. Header Skeleton (initial app load)
- Logo placeholder (rounded rectangle)
- Theme switcher placeholder (circle)
- Search bar placeholder (rounded rectangle)
- Use during initial hydration

#### 2. SubredditFilter Skeleton
- Button-shaped placeholders for each filter category
- Match actual filter button dimensions
- Horizontal scrollable row

#### 3. PostDetail Skeleton (when opening modal)
- Media area placeholder (16:9 aspect ratio box)
- Title placeholder (2 lines, varying widths)
- Author/metadata placeholder (single line)
- Content placeholder (multiple lines, decreasing widths)
- Action bar placeholder (row of circles)

#### 4. Search Results Skeleton
- Same as PostListSkeleton
- Include search context indicator

#### 5. Individual PostItem Skeleton
- For use when refreshing single cards
- Match PostItem dimensions exactly

### Skeleton Animation

- **Shimmer effect**: Gradient moving left-to-right
- Animation: `shimmer 1.5s ease-in-out infinite`
- Use CSS only (no JavaScript)
- Theme-aware colors:
  - Light themes: `--bg-secondary` to `--bg-tertiary`
  - Dark themes: Subtle lighter shimmer

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

### Loading Spinner Usage

Reserve spinner for:
- Pull-to-refresh indicator
- "Load more" button during fetch
- Quick operations (< 500ms expected)
- Inline loading (e.g., retry button)

### Empty States

#### No Posts Found
- Illustrated empty state (LFC-themed icon)
- Message: "No posts found"
- Suggestion: "Try a different filter or check back later"
- Retry button

#### No Comments
- Message: "No comments yet"
- Secondary: "Be the first to discuss on Reddit"
- Link to Reddit post

#### Search No Results
- Message: "No results for '[query]'"
- Suggestions: Check spelling, try different keywords
- Clear search button

#### Network Error
- Distinct from loading (use error accent color)
- Message: "Unable to connect"
- Mobile-specific: "Check your connection"
- Retry button with spinner on click

### Transition Between States

- Fade in content when loaded (200ms)
- Skeleton dimensions must match actual content (no layout shift)
- Use `min-height` on containers to prevent collapse

## CSS Variables to Add

```css
--skeleton-base: var(--bg-secondary);
--skeleton-highlight: var(--bg-tertiary);
--skeleton-radius: var(--radius-sm);
```

## Acceptance Criteria

- [ ] Every loading state has skeleton or spinner
- [ ] Skeleton dimensions match actual content exactly
- [ ] Shimmer animation is smooth (60fps)
- [ ] Respects prefers-reduced-motion (pulse instead)
- [ ] Works correctly in all 3 themes
- [ ] Empty states are helpful with clear actions
- [ ] Error states are distinct from loading
- [ ] No layout shift between skeleton and content
