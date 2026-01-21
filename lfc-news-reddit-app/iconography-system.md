# Iconography System

## Overview

The app needs a consistent, high-quality icon system that works across all themes and screen sizes. Icons should be instantly recognizable and enhance usability.

## Requirements

### Icon Library

- Use a consistent icon library (recommend: Lucide, Heroicons, or Phosphor)
- All icons must be SVG-based for crisp rendering at any size
- Icons should have consistent stroke width and style
- Support for both outlined and filled variants where needed

### Icon Usage Guidelines

- **Navigation**: Clear icons for home, search, settings, refresh
- **Actions**: Upvote/downvote, comment, share, save, expand/collapse
- **Status**: Loading, error, success, empty state
- **Media**: Image, video, link, gallery indicators
- **Subreddit**: Visual indicator for which subreddit a post is from
- **Sorting**: Hot, new, top, viral (spiciness meter)
- **Theme**: Theme switcher icons for red/white/green

### Sizing Standards

- Small (16px): Inline with text, metadata
- Medium (20-24px): Buttons, list items
- Large (32px+): Empty states, feature highlights

### Accessibility

- All icons must have appropriate aria-labels
- Icons used alone (without text) must have screen reader text
- Sufficient contrast against all theme backgrounds
- Icons should not be the only indicator of state (use text/color too)

## Acceptance Criteria

- [ ] Single icon library used throughout
- [ ] All icons are SVG, not PNG/font icons
- [ ] Icons work on all three colour themes
- [ ] Icons have consistent sizing within contexts
- [ ] All interactive icons have hover/active states
- [ ] All icons have appropriate accessibility labels
- [ ] Icons render crisply on retina displays
