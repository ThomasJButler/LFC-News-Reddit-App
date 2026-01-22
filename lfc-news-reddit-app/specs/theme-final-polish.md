# Theme Final Polish

## Overview

Final refinements to theme system: better desktop picker, 3-kit colour accuracy, remove night mode, fix mobile input zoom.

## Current State

- 4 themes exist (red, white, green, night)
- Theme picker uses dropdown `<select>`
- Away kit uses pure white instead of cream
- Mobile search input causes iOS zoom (font-size 14px)

## Requirements

### 1. Theme Picker Desktop Redesign

**Current**: Dropdown `<select>` with small colour dot
**Target**: Visual button group showing kit colours

#### Implementation

**File**: `src/components/ThemeSwitcher/ThemeSwitcher.js`

- Replace `<select>` with button group
- Each button shows:
  - Circular colour swatch (kit colour)
  - Short name below (Home, Away, Keeper)
- Active state: ring/border highlight
- Hover: subtle scale effect

**File**: `src/components/ThemeSwitcher/ThemeSwitcher.module.css`

- New `.themeButtons` container (flexbox row)
- New `.themeButton` class per button
- Colour swatch `.colorSwatch` (16-20px circle)
- Active state `.active` with accent border
- Hover/focus states
- 44px minimum touch targets

### 2. Remove Night Mode (3 Themes Only)

Keep only 3 themes matching LFC kits:
- **Home Kit** (red) - `id: 'red'` - Anfield Red
- **Away Kit** (cream) - `id: 'white'` - Away Day
- **Keeper Kit** (green) - `id: 'green'` - Goalkeeper

#### Files to Modify

**ThemeSwitcher.js**:
- Remove night mode from themes array (line 22)
- Update `getSystemPreference()` to return 'red' instead of 'night' for dark mode users

**variables.css**:
- DELETE entire `[data-theme="night"]` block (lines 229-268)

**BottomNav.js** (if applicable):
- Remove night mode option from mobile theme picker

### 3. Away Kit Colour Accuracy

**Problem**: Current "white" theme uses pure white `#f8f9fa` but actual away kit is cream/off-white.

**Reference**: `/kits/awaykit.jpg` - Cream base with red and black accents

#### Update variables.css [data-theme="white"]

```css
[data-theme="white"] {
  /* Away kit is cream, not pure white */
  --bg-primary: #f5f0e8;      /* Warm cream (was #f8f9fa) */
  --bg-secondary: #fcf9f4;    /* Light cream (was #ffffff) */
  --bg-tertiary: #ebe4d8;     /* Darker cream (was #e9ecef) */
  --bg-glass: rgba(252, 249, 244, 0.9);
  --bg-gradient: linear-gradient(135deg, #fcf9f4 0%, #f5f0e8 100%);

  /* Skeleton loading colours for cream theme */
  --skeleton-base: var(--bg-tertiary);
  --skeleton-highlight: #d9d2c4;
}
```

#### Verify WCAG AA Contrast

Text colours may need adjustment for cream backgrounds:
- `--text-primary`: #1a1a1a (should be fine)
- `--text-secondary`: May need darkening from #595959
- `--text-muted`: May need darkening from #737373

### 4. Mobile Search Input Zoom Fix

**Bug**: iOS Safari zooms page when tapping search input
**Cause**: `font-size: var(--font-size-sm)` = 14px on mobile
**iOS zooms inputs < 16px font-size**

#### Fix in SearchBar.module.css

```css
@media (max-width: 767px) {
  .searchInput {
    /* WHY: iOS Safari auto-zooms inputs with font-size < 16px */
    font-size: 16px;
  }
}
```

## Files Summary

| File | Changes |
|------|---------|
| `src/components/ThemeSwitcher/ThemeSwitcher.js` | Visual buttons, remove night mode |
| `src/components/ThemeSwitcher/ThemeSwitcher.module.css` | New button styles |
| `src/styles/variables.css` | Delete night theme, cream colours |
| `src/components/SearchBar/SearchBar.module.css` | Mobile font-size 16px |
| `src/components/BottomNav/BottomNav.js` | Remove night if present |

## Acceptance Criteria

- [ ] Theme picker shows visual colour buttons on desktop
- [ ] Only 3 themes available (night mode completely removed)
- [ ] Away theme uses warm cream tones matching actual kit
- [ ] Mobile search input doesn't trigger page zoom on iOS
- [ ] All themes maintain WCAG AA contrast (4.5:1 minimum)
- [ ] Theme selection persists in localStorage
- [ ] Works correctly with `prefers-color-scheme` detection
- [ ] Tests pass: `npm test -- --watchAll=false`
- [ ] Build passes: `npm run build`
