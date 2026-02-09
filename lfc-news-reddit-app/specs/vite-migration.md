# Vite Migration

## Why
Create React App (CRA) is deprecated and no longer maintained. Vite provides faster dev server, native ESM, better Tailwind CSS support, and modern tooling. This is the foundation for the ShadCN rebuild — everything else depends on Vite + Tailwind being set up first.

## What to Do

### Create New Config Files

**`vite.config.js`** (project root):
- Use `@vitejs/plugin-react`
- Path alias: `@/` → `./src/`
- Dev server proxy: `/api/reddit` → `http://localhost:3000` (for local dev)
- Output directory: `dist/`

**`postcss.config.js`** (project root):
- Plugin: `@tailwindcss/postcss`

**`index.html`** (project root — Vite convention, NOT in public/):
- Move content from `public/index.html`
- Add `<script type="module" src="/src/main.jsx"></script>`
- Keep meta tags, favicon, manifest link
- Update theme-color meta to `#C8102E`

**`src/main.jsx`** (new entry point, replaces `src/index.js`):
- Import `./styles/globals.css`
- Import React, ReactDOM, Provider, store, App
- Render with `ReactDOM.createRoot`

**`src/lib/utils.js`** (ShadCN utility):
- Export `cn()` function using `clsx` + `tailwind-merge`
- This is imported by every ShadCN component

### Update package.json

Remove dependencies:
- `react-scripts`
- `react-window`
- `web-vitals`
- `source-map-explorer`

Add dependencies:
- `class-variance-authority` (CVA — ShadCN variant management)
- `clsx` (class merging)
- `tailwind-merge` (Tailwind class deduplication)
- `sonner` (toast notifications, replaces custom Toast)
- Radix UI primitives: `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-tooltip`, `@radix-ui/react-collapsible`, `@radix-ui/react-avatar`, `@radix-ui/react-separator`, `@radix-ui/react-slot`

Add devDependencies:
- `vite`
- `@vitejs/plugin-react`
- `tailwindcss`
- `@tailwindcss/postcss`
- `tailwindcss-animate`

Update scripts:
- `"dev": "vite"`
- `"build": "vite build"`
- `"preview": "vite preview"`

Remove: `browserslist`, `eslintConfig`, `jest` config sections (will be handled by Vitest later)

### Update vercel.json

Add build configuration for Vite output:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/reddit", "destination": "/api/reddit" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

### Delete CRA Artifacts
- `src/index.js` (replaced by `src/main.jsx`)
- `src/reportWebVitals.js`
- `src/setupTests.js`
- `src/logo.svg`
- `public/index.html` (replaced by root `index.html`)

## Acceptance Criteria
- `npm run dev` starts Vite dev server without errors
- `npm run build` produces `dist/` directory
- `@/` alias resolves correctly in imports
- Existing Redux store connects and dispatches
- App renders (even if unstyled at this point)
