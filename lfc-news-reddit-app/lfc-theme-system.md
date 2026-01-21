# LFC Kit Colour Themes

## Overview

The app features three colour themes based on Liverpool FC kits. These themes must be maintained and enhanced to provide a cohesive, beautiful experience while ensuring all content remains accessible.

## Themes

### Red Theme (Home Kit)

The primary theme representing the iconic Anfield red.

- **Primary**: LFC Red (#C8102E)
- **Background**: Light cream/off-white (#FAFAFA or similar)
- **Text**: Dark charcoal (#1A1A1A)
- **Accent**: Gold/yellow for highlights (#F6EB61)
- **Secondary**: Darker red for depth (#8B0000)

### White Theme (Away Kit)

Clean, minimal white kit aesthetic.

- **Primary**: White (#FFFFFF)
- **Background**: Pure white or very light grey (#FFFFFF / #F5F5F5)
- **Text**: Dark charcoal (#1A1A1A)
- **Accent**: LFC Red (#C8102E) for highlights
- **Secondary**: Light grey for borders/dividers (#E0E0E0)

### Green Theme (Goalkeeper Kit)

The distinctive keeper kit green.

- **Primary**: Keeper Green (#00A651 or similar)
- **Background**: Dark green or light mint depending on preference
- **Text**: White or dark based on background
- **Accent**: Lighter green or gold for highlights
- **Secondary**: Darker green for depth

## Requirements

### Implementation

- Use CSS custom properties (variables) for all theme colours
- Theme class on body or root element
- Smooth transition when switching themes
- Persist theme preference in localStorage

### Contrast & Accessibility

- All text/background combinations must meet WCAG AA (4.5:1)
- Interactive elements must have visible focus states in all themes
- Error/success states must be distinguishable in all themes

### Consistency

- Every component must support all three themes
- No hardcoded colours in components
- Icons must work on all theme backgrounds
- Media (images, videos) should have appropriate borders/shadows per theme

### Theme Switcher

- Easily accessible but not prominent
- Visual preview of theme colours
- Clear indication of current theme
- Keyboard accessible

## Acceptance Criteria

- [ ] All three themes fully implemented
- [ ] CSS variables used throughout
- [ ] Theme persists across sessions
- [ ] Smooth theme transition animation
- [ ] All content readable in all themes
- [ ] Theme switcher is accessible
- [ ] No visual bugs when switching themes
