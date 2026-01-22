# Toast Notifications

## Overview

Provide non-intrusive feedback for user actions and system events. Create a reusable toast system with React Context.

## Current State

No toast notification system exists. User feedback is limited to inline loading states and error messages.

## Requirements

### Toast Types

#### Success (green accent)
- "Link copied to clipboard"
- "Theme changed to [name]"
- "Filters cleared"

#### Error (red accent)
- "Failed to load posts"
- "Network error - check your connection"
- "Failed to copy link"

#### Info (blue/theme accent)
- "New posts available - tap to refresh"
- "Viewing cached content"
- "Scroll to top for latest"

#### Warning (yellow/orange accent)
- "Some images failed to load"
- "Slow connection detected"

### Toast Anatomy

```
┌─────────────────────────────────────────┐
│ [Icon]  Message text here               │
│         Secondary text (optional)    [X]│
│ ═══════════════════════════════════════ │ ← Progress bar
└─────────────────────────────────────────┘
```

- **Icon**: Type-specific (CheckCircle, AlertCircle, Info, AlertTriangle)
- **Message**: Primary text, max 2 lines
- **Secondary**: Optional detail text
- **Close button**: X icon, always visible
- **Progress bar**: Shows time remaining, theme-colored

### Toast Behavior

#### Positioning
- Mobile: Bottom of screen, above BottomNav
- Desktop: Top-right corner
- Padding from edges: --spacing-md

#### Timing
- Auto-dismiss after 4 seconds (default)
- Error toasts: 6 seconds
- Configurable per toast

#### Interactions
- Swipe to dismiss (mobile, horizontal)
- Click X to dismiss (desktop)
- Hover pauses auto-dismiss timer
- Click toast body: optional action callback

#### Stacking
- Max 3 toasts visible simultaneously
- New toasts appear at top (desktop) or bottom (mobile)
- Queue overflow, show next when space available
- Smooth height transition when toasts stack/unstack

### Animation

#### Enter
- Slide in from right (desktop) or bottom (mobile)
- Fade in simultaneously
- Duration: 250ms ease-out

#### Exit
- Slide out in same direction
- Fade out simultaneously
- Duration: 200ms ease-in

#### Stack Transition
- Smooth translateY when toasts reorder
- Duration: 200ms

### Accessibility

- `role="alert"` for error/warning toasts
- `role="status"` for success/info toasts
- `aria-live="polite"` for non-urgent
- `aria-live="assertive"` for errors
- Focus not stolen from current element
- Pause timer on keyboard focus
- Screen reader announces toast message

### Implementation Architecture

#### ToastProvider (Context)

```jsx
<ToastProvider>
  <App />
</ToastProvider>
```

#### useToast Hook

```jsx
const { showToast, dismissToast, dismissAll } = useToast();

// Usage
showToast({
  type: 'success', // 'success' | 'error' | 'info' | 'warning'
  message: 'Link copied!',
  secondary: 'Share it with friends', // optional
  duration: 4000, // optional, ms
  action: { label: 'Undo', onClick: handleUndo }, // optional
});
```

#### Toast Component

- Renders via React Portal to document.body
- Manages own animation state
- Handles swipe gesture detection
- Progress bar synced to duration

### File Structure

```
src/components/Toast/
├── Toast.js           # Individual toast component
├── Toast.module.css   # Toast styles
├── ToastContainer.js  # Manages toast list and positioning
├── ToastProvider.js   # Context provider
├── useToast.js        # Hook for consuming
└── index.js           # Exports
```

### Theme Integration

```css
.toast {
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.toast--success { border-left: 4px solid var(--color-success); }
.toast--error { border-left: 4px solid var(--color-error); }
.toast--info { border-left: 4px solid var(--color-primary); }
.toast--warning { border-left: 4px solid var(--color-warning); }
```

### CSS Variables to Add

```css
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-info: var(--color-primary);
--toast-width: 360px;
--toast-width-mobile: calc(100vw - var(--spacing-lg) * 2);
```

## Acceptance Criteria

- [ ] ToastProvider wraps app in index.js
- [ ] useToast hook available throughout app
- [ ] All 4 toast types render with correct styling
- [ ] Auto-dismiss with progress indicator
- [ ] Swipe to dismiss on mobile
- [ ] Hover pauses timer on desktop
- [ ] Proper ARIA attributes for accessibility
- [ ] Works correctly in all 3 themes
- [ ] No layout shift when toasts appear/disappear
- [ ] Max 3 toasts with proper queuing
