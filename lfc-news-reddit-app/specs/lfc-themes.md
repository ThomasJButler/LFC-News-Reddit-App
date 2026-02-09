# LFC Themes

## Why
The app needs 3 switchable themes using LFC colors (Red, White, Black). ShadCN uses CSS custom properties (HSL values) for theming, which makes theme switching simple — just change a `data-theme` attribute on `<html>`.

## Theme Definitions

Create `src/styles/globals.css` with Tailwind directives and 3 theme definitions:

### Red Theme (Default) — Home Kit / Anfield Night
```
Selector: :root
Background: #0f0f0f (very dark, almost black)
Foreground: #ffffff
Card: #1a1a1a
Card Foreground: #ffffff
Primary: #C8102E (LFC Red)
Primary Foreground: #ffffff
Secondary: #252525
Secondary Foreground: #ffffff
Muted: #252525
Muted Foreground: #808080
Accent: #C8102E
Accent Foreground: #ffffff
Border: rgba(255, 255, 255, 0.1)
Ring: #C8102E
Radius: 0.75rem
```

### White Theme — Away Kit / Clean
```
Selector: [data-theme="white"]
Background: #f5f0e8 (warm cream)
Foreground: #1a1a1a
Card: #fcf9f4
Card Foreground: #1a1a1a
Primary: #C8102E (LFC Red stays constant)
Primary Foreground: #ffffff
Secondary: #e8e2d8
Secondary Foreground: #1a1a1a
Muted: #e8e2d8
Muted Foreground: #737373
Accent: #C8102E
Accent Foreground: #ffffff
Border: rgba(0, 0, 0, 0.1)
Ring: #C8102E
Radius: 0.75rem
```

### Black Theme — Third Kit / OLED
```
Selector: [data-theme="black"]
Background: #000000 (pure black — OLED friendly)
Foreground: #e5e5e5
Card: #0a0a0a
Card Foreground: #e5e5e5
Primary: #C8102E (LFC Red stays constant)
Primary Foreground: #ffffff
Secondary: #141414
Secondary Foreground: #e5e5e5
Muted: #141414
Muted Foreground: #737373
Accent: #C8102E
Accent Foreground: #ffffff
Border: rgba(255, 255, 255, 0.08)
Ring: #C8102E
Radius: 0.75rem
```

## CSS Variable Format

ShadCN expects HSL values (without `hsl()` wrapper). Convert hex values to HSL for the CSS variables:

```css
:root {
  --background: 0 0% 6%;
  --foreground: 0 0% 100%;
  --card: 0 0% 10%;
  --primary: 352 86% 43%;
  /* etc. */
}
```

## globals.css Structure

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { /* Red theme variables */ }
  [data-theme="white"] { /* White theme variables */ }
  [data-theme="black"] { /* Black theme variables */ }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
}
```

## Theme Switching

- Persist in localStorage under key `lfc-theme`
- On page load: read from localStorage, set `data-theme` attribute on `<html>`
- ThemeSwitcher component: 3 color swatches using `ToggleGroup`
- Default theme (no `data-theme` attribute): Red

## Reference

Existing theme values are in `src/styles/variables.css` — use as reference for color decisions, then delete after migration.

## Acceptance Criteria
- Red theme renders correctly (dark bg, red accents)
- White theme renders correctly (cream bg, red accents)
- Black theme renders correctly (pure black bg, red accents, OLED-friendly)
- Theme persists across page refresh via localStorage
- All ShadCN components correctly respond to theme changes
- Primary color (#C8102E) is consistent across all themes
- Sufficient contrast ratios for WCAG AA compliance
