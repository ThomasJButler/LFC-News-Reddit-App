# Mobile-First Responsive Design

## Overview

The app must provide an excellent experience on mobile devices first, then scale up gracefully to desktop. Currently the app is desktop-focused and has issues on mobile browsers.

## Requirements

### Mobile (320px - 767px)

- Single column layout
- Touch-friendly tap targets (minimum 44x44px)
- Thumb-reachable navigation
- Swipe gestures where appropriate
- No horizontal scrolling ever
- Readable text without zooming (minimum 16px base)
- Collapsible/expandable sections to manage screen space
- Bottom navigation bar for primary actions

### Tablet (768px - 1023px)

- Flexible layout that can be single or two-column
- Larger tap targets than desktop but smaller than mobile
- Optional sidebar that can be toggled

### Desktop (1024px+)

- Multi-column layout with sidebar
- Hover states for interactive elements
- Keyboard navigation support
- More information density acceptable

## Acceptance Criteria

- [x] App is fully usable on iPhone SE (320px width)
- [x] App is fully usable on standard phones (375px - 414px)
- [x] App scales gracefully to tablet sizes
- [x] Desktop retains current functionality
- [x] No content is cut off or inaccessible at any breakpoint
- [x] Text remains readable at all sizes
- [x] Touch targets meet accessibility guidelines

## Implementation Notes (January 2026)

**Modal Improvements:**
- Desktop: Increased to 1200px max-width, 95vh height
- Mobile: Full-height (95vh) on open, no half-state bottom sheet
- Swipe gestures removed for cleaner UX (X button only)
- Comment virtualization height fixed for modal context

**Known Limitations:**
- npm audit vulnerabilities in react-scripts (dev dependencies only, no production impact)
