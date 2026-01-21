# Comment Threading Visual Polish

## Overview

Improve comment threading visuals to match modern Reddit UI patterns while maintaining the LFC theme aesthetic. Inspired by official Reddit UI with avatars, user badges, and pill-style action bars.

## Current State

- Basic thread lines with depth-based coloring
- Collapse/expand functionality working
- OP badge implemented
- No avatars or additional user badges
- Basic action display (no pill styling)

## Requirements

### Avatar Placeholders

- Circular avatar (32px on desktop, 28px on mobile)
- Generated from username hash (consistent color per user)
- First letter of username displayed
- Subtle border matching thread depth color

### User Badges (like Reddit's "Top 1% Poster")

- **OP Badge**: Already exists, ensure prominent (pill style, theme accent color)
- **Mod Badge**: Green pill if user is distinguished as moderator
- **Submitter Badge**: If user is the post author
- Display badges inline after username

### Thread Line Improvements

- Thicker thread lines (3px) with rounded caps
- Full height extension through all nested replies
- Clickable thread line to collapse entire branch
- Hover state: subtle glow effect
- Color progression for depth (use existing theme colors)

### Comment Header Layout

```
[Avatar] [Username] [Badges] • [Time] • [Score]
```

- Username: Bold, slightly larger (--font-size-sm)
- Badges: Inline pills with icons
- Time: Relative format ("2h ago"), muted color
- Score: With small arrow icon, muted

### Action Bar (per comment)

- Pill-style buttons with icons
- Show on hover (desktop) or always visible (mobile)
- Actions:
  - Reply (links to Reddit)
  - Share (copy permalink)
  - Collapse/expand chevron
- Subtle background on hover
- All pills use `--radius-full` for rounded appearance

### Collapse Behavior

- Smooth height animation (300ms ease-out)
- Collapsed summary: `[Avatar] [Username] • [Score] • [reply count] replies`
- Chevron rotates 90° when collapsed
- Collapsed state uses muted colors

### Visual Hierarchy

- Clear indentation stepping (16px mobile, 24px desktop)
- Maximum visual nesting: 6 levels (flatten display after)
- Alternating subtle background tints for depth clarity (optional, theme-dependent)
- Generous spacing between comments (--spacing-md)

### Mobile Adaptations

- Smaller avatars (28px)
- Reduced indent (12px per level)
- Action bar always visible (no hover)
- Touch-friendly collapse targets (full header clickable)

## CSS Variables to Add

```css
--comment-avatar-size: 32px;
--comment-avatar-size-mobile: 28px;
--comment-indent: 24px;
--comment-indent-mobile: 12px;
--comment-thread-width: 3px;
```

## Acceptance Criteria

- [ ] Avatar placeholders render with username-based colors
- [ ] OP and Mod badges display as styled pills
- [ ] Thread lines are thicker and clickable for collapse
- [ ] Action bar uses pill-style buttons
- [ ] Collapse animation is smooth (300ms)
- [ ] Collapsed state shows summary with reply count
- [ ] Works correctly in all 4 themes (red, white, green, night)
- [ ] Maintains WCAG AA contrast in all states
- [ ] Mobile touch targets >= 44x44px
- [ ] Respects prefers-reduced-motion
