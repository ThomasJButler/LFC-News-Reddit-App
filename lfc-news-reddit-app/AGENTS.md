## Build & Run

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- The app is a React SPA deployed to Vercel with a serverless function at `api/reddit.js`

## Validation

Run these after implementing to get immediate feedback:

- Tests: `npx vitest run` (single run) or `npm test` (watch mode)
- Coverage: `npm run test:coverage`
- Build check: `npm run build` (must succeed with no errors)
- E2E tests: `npm run test:e2e`

## Operational Notes

- Source code: `src/`
- Dev API proxy: Handled by Vite middleware plugin in `vite.config.js` — no separate server needed. `npm run dev` serves `/api/reddit` requests directly.
- Vercel serverless function: `api/reddit.js` — CORS proxy to Reddit API with retry logic for rate-limiting.
- Redux state management: `src/redux/` (store, actions, reducers) — keep unchanged unless a spec explicitly requires changes
- Utilities: `src/utils/` (api.js, cache.js, formatTime.js, formatDuration.js, colorHash.js, sanitize.js, markdown.js). Note: `markdown.js` contains only text utilities (`decodeHtml`, `stripMarkdown`) — no React imports. ReactMarkdown rendering is done inline in PostDetail and Comment components.
- Deployment: Vercel auto-deploys from git push. Config in `vercel.json`
- Build tool: Vite 7. Dev server on port 5173. Tests run under Vitest (no Jest/react-scripts).

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
