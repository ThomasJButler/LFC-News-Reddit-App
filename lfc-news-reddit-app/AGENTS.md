## Build & Run

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- The app is a React SPA deployed to Vercel with a serverless function at `api/reddit.js`

## Validation

Run these after implementing to get immediate feedback:

- Tests: `npm test -- --watchAll=false`
- Build check: `npm run build` (must succeed with no errors)
- E2E tests: `npm run test:e2e`

## Operational Notes

- Source code: `src/`
- Vercel serverless function: `api/reddit.js` — CORS proxy to Reddit API. DO NOT MODIFY this file.
- ShadCN v4 component reference: `ui/apps/v4/registry/new-york-v4/ui/` — copy components from here, convert TSX to JSX
- Redux state management: `src/redux/` (store, actions, reducers) — keep unchanged unless a spec explicitly requires changes
- Utilities: `src/utils/` (api.js, cache.js, formatTime.js, formatDuration.js, colorHash.js, sanitize.js, markdown.js)
- Deployment: Vercel auto-deploys from git push. Config in `vercel.json`
- Current build tool is CRA (react-scripts) — first task is migrating to Vite

### Codebase Patterns

- ShadCN components go in `src/components/ui/` as JSX (not TSX — this project uses JavaScript)
- ShadCN `cn()` utility at `src/lib/utils.js` — uses clsx + tailwind-merge
- Vite path alias: `@/` maps to `src/`
- Theme switching: `data-theme` attribute on `<html>` element, persisted in localStorage
- All components use Tailwind CSS utility classes — no CSS Modules
- Import Lucide icons directly in each component (no Icon wrapper)
- Use ShadCN `Sheet` for modals/slide-in panels, `Sonner` for toast notifications
- LFC brand colors: Red #C8102E, White #FFFFFF, Black #000000
- Three switchable themes: Red (dark), White (cream/light), Black (pure dark/OLED)
