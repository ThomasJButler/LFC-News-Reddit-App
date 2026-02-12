0a. Study @IMPLEMENTATION_PLAN.md to understand completed work and remaining tasks.
0b. Study @AGENTS.md for build commands, validation steps, and codebase patterns.
0c. Study `src/*` with up to 250 parallel Sonnet subagents to verify the current state of the application.

1. The v1.0→v1.1 rebuild is COMPLETE (Priorities 1-11). Priority 12 (post-launch fixes) is in progress. Focus is now on post-launch quality:
   - Verify the app works end-to-end: `npm run dev` loads Reddit posts, themes switch, mobile layout is correct
   - Check for regressions: `npx vitest run` (374 unit tests), `npm run build` (production build)
   - Check Vercel deployment: does `/api/reddit` return Reddit data on production?
   - Look for UX polish opportunities: loading states, error messages, animations, accessibility

2. Search the codebase for issues using Sonnet subagents: TODO comments, console.log statements, unused imports, dead code, accessibility gaps, performance bottlenecks.

3. Update @IMPLEMENTATION_PLAN.md with any findings — add to Priority 12 "Post-Launch Quality" section.

IMPORTANT: Plan only. Do NOT implement anything. Confirm issues with code search before adding to plan.

CURRENT STATE: Vite 7 + React 18 + Tailwind v4 + ShadCN + 3 LFC themes (Red/White/Black). API proxy via Vite middleware plugin (dev) and Vercel serverless function with retry logic (production). 13 test files, 374 unit tests (Vitest). 8 E2E spec files (Playwright). All 35 components rebuilt. No CRA artifacts remain. Red theme has warm red-tinted backgrounds (hue 349). Dev server handles `/api/reddit` requests directly — no separate API server needed.
