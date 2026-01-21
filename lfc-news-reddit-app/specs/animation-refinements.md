# Animation Refinements

## Overview

Subtle, purposeful animations that enhance UX without being distracting. Focus on high-impact moments that create delight.

## Current State

- Basic transitions on hover (transform, opacity)
- Theme transition (300ms ease-in-out)
- Modal fade/slide animations
- No staggered list animations
- Limited micro-interactions

## Requirements

### Staggered List Animations

#### Post List Entry
- Posts appear with stagger (50ms delay between items)
- Animation: fade in + slide up (20px)
- Duration: 300ms per item
- Only on initial load, not on scroll/filter

```css
.postItem {
  opacity: 0;
  transform: translateY(20px);
  animation: slideIn 300ms ease-out forwards;
}

.postItem:nth-child(1) { animation-delay: 0ms; }
.postItem:nth-child(2) { animation-delay: 50ms; }
.postItem:nth-child(3) { animation-delay: 100ms; }
/* ... up to 10 items, then no delay */
```

#### Comment List Entry
- Comments stagger (30ms delay)
- Nested replies animate after parent
- Lighter animation (fade only, 200ms)

#### Filter Pills Entry
- Subreddit filter pills stagger on mount (25ms)
- Subtle scale + fade

### Micro-Interactions

#### Score Display
- Number "bumps" slightly on load (scale 1.1 → 1.0)
- Duration: 150ms
- Only for scores > 100

#### Collapse Button
- Chevron rotates smoothly (90° when collapsed)
- Duration: 200ms ease-out

#### Theme Switch
- Smooth color morph (already 300ms)
- Add subtle "pulse" on theme button click

#### Button Press Feedback
- Scale down to 0.97 on active
- Duration: 100ms
- Apply to all interactive buttons

#### Upvote/Like Animation
- Heart/arrow fills with color
- Subtle bounce (scale 1.0 → 1.2 → 1.0)
- Duration: 300ms with bounce easing

### Page Transitions

#### Modal Open
1. Overlay fades in (200ms)
2. Content slides up from bottom (300ms, ease-out)
3. Content fades in simultaneously

#### Modal Close
1. Content slides down (200ms, ease-in)
2. Content fades out simultaneously
3. Overlay fades out (150ms)

#### Post Detail Content
- After skeleton, content fades in (200ms)
- Images fade in independently as loaded

### Pull-to-Refresh

- Spinner appears with scale animation (0 → 1)
- Rotation animation while loading
- "Snap back" when released below threshold
- "Bounce" effect when refresh triggers

### Error State Animation

- Retry button: subtle shake animation on error
- 3 quick horizontal movements
- Duration: 400ms total

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

### Performance Constraints

- All animations use `transform` and `opacity` only
- No animations triggered by scroll position
- Use `will-change` sparingly (only on animating elements)
- Target 60fps on mobile devices
- Batch DOM reads/writes

### Easing Curves

```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Guidelines

| Type | Duration |
|------|----------|
| Micro-interactions | 100-150ms |
| State changes | 200-300ms |
| Page transitions | 300-400ms |
| Maximum | 500ms |

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Allow essential transitions */
  .modal {
    transition-duration: 150ms !important;
  }
}
```

## Acceptance Criteria

- [ ] Post list items stagger on initial load
- [ ] Comment list items stagger appropriately
- [ ] Collapse chevron animates rotation
- [ ] Button press provides tactile feedback
- [ ] Modal open/close transitions are smooth
- [ ] All animations run at 60fps
- [ ] Reduced motion preference fully respected
- [ ] No jank or layout shift during animations
- [ ] Animations enhance, not distract from content
