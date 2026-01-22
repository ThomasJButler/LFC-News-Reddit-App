# Post Card Visual Polish

## Overview

Refine post card (PostItem) visual hierarchy for a cleaner, more scannable feed. Inspired by Reddit's card design but tailored for the LFC theme aesthetic.

## Current State

- Card layout with thumbnail on right
- Metadata header (subreddit, author, time)
- Title with media type icons
- Footer with upvotes, comments, SpicyMeter
- Flair badges implemented
- Glass morphism effect on desktop

## Requirements

### Card Layout Refinements

- Consistent internal padding using spacing scale
- Clear visual separation between cards (gap: --spacing-md)
- Subtle shadow elevation on hover (desktop only)
- **Gradient accent stripe** on left edge (4px, theme primary color)
- Stripe opacity increases on hover

### Typography Hierarchy

1. **Title**: Most prominent, bold, --font-size-lg
2. **Preview text**: Secondary, max 2 lines with ellipsis, --font-size-sm, muted
3. **Metadata**: Tertiary, --font-size-xs, muted color
4. **Score/Comments**: Clear but not dominant, --font-size-sm

### Metadata Bar (top of card)

- Compact single-line format: `r/LiverpoolFC • u/author • 2h`
- Subreddit with subtle icon/indicator
- Stickied indicator (pin icon) inline if applicable
- Spoiler badge inline if applicable

### Flair Badge Placement

- Move flair badge to appear before title (current: after)
- Compact pill style with theme-aware colors
- Icon prefix for special flairs (match, transfer, etc.)

### Footer Actions (pill style)

```
[▲ 1.2K] [💬 234] [🌶️ SpicyMeter]
```

- Pill-style containers with subtle background
- Score with up arrow icon
- Comment count with message icon
- SpicyMeter integrated (existing component)
- On mobile: horizontal scroll if needed, or stack

### Thumbnail Improvements

- Consistent aspect ratio container (16:9)
- Rounded corners matching card radius (--radius-md)
- Placeholder icon for missing thumbnails (image icon, muted)
- Lazy loading with fade-in transition
- Gallery indicator overlay (if multi-image)
- Video indicator overlay (play icon)

### Hover/Focus States

- Subtle scale transform (1.005x - very subtle)
- Border color shifts to theme accent
- Gradient stripe opacity increases
- Shadow elevation increases
- Clear focus ring for keyboard navigation (3px outline)

### Mobile Layout

- Single column, full width
- Thumbnail below title (or hide if small)
- Preview text: 2 lines max
- Footer actions in single row
- No hover effects (touch-only)

## CSS Variables to Add

```css
--card-stripe-width: 4px;
--card-hover-scale: 1.005;
--card-thumbnail-ratio: 56.25%; /* 16:9 */
```

## Acceptance Criteria

- [ ] Gradient accent stripe visible on left edge
- [ ] Typography hierarchy is clear and scannable
- [ ] Flair badges appear before title
- [ ] Footer uses pill-style action buttons
- [ ] Thumbnails have consistent aspect ratio
- [ ] Hover state provides subtle feedback
- [ ] All content readable at 320px width
- [ ] Consistent appearance across all 3 themes
- [ ] No layout shift during image load
- [ ] Focus states meet WCAG 2.4.7
