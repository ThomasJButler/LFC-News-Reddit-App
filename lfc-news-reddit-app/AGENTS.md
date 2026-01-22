# LFC News Reddit App - Operational Guide

## Build & Run

```bash
# Install dependencies
npm install

# Start development server (localhost:3000)
npm start

# Production build
npm run build
```

## Validation

Run these after implementing to get immediate feedback:

```bash
# Run all tests
npm test -- --watchAll=false --coverage

# Build check (catches type errors via react-scripts)
npm run build

# Visual regression tests (after Playwright setup)
npx playwright test
```

## E2E / Visual Testing

```bash
# Install Playwright (first time)
npm install -D @playwright/test
npx playwright install chromium

# Run visual tests
npx playwright test --project=chromium
```

## Codebase Patterns

### Component Structure
- Location: `src/components/ComponentName/ComponentName.js`
- Styles: `src/components/ComponentName/ComponentName.module.css`
- Import styles as: `import styles from './ComponentName.module.css'`

### Theming
- CSS variables defined in: `src/styles/variables.css`
- 3 themes matching LFC kits: red/Home (default), white/Away, green/Keeper
- Theme applied via `data-theme` attribute on `<html>` element
- Always use CSS custom properties: `var(--color-primary)`, `var(--bg-primary)`, etc.

### State Management
- Redux store: `src/redux/store.js`
- Actions: `src/redux/actions/*.js`
- Reducers: `src/redux/reducers/*.js`
- Use Redux Thunk for async actions

### Icons
- Library: `lucide-react`
- Wrapper component: `src/components/Icon/Icon.js`
- Usage: `<Icon name="Home" size="md" />`

### Utilities
- API client: `src/utils/api.js`
- Caching: `src/utils/cache.js`
- Time formatting: `src/utils/formatTime.js`
- Markdown: `src/utils/markdown.js`

## Accessibility Requirements

- WCAG AA compliance required
- Minimum touch targets: 44x44px on mobile
- All interactive elements need visible focus states
- Use semantic HTML and proper ARIA attributes
- Support `prefers-reduced-motion` for animations

## Git Conventions

- Commit messages: Brief, descriptive, present tense
- Tags: Semantic versioning (1.1.x)
- Branch: Currently on v1.1
