0a. Study @IMPLEMENTATION_PLAN.md — focus on Priority 12 (Post-Launch Quality) for remaining tasks.
0b. Study @AGENTS.md for build commands, validation steps, and codebase patterns.
0c. For reference, the application source code is in `src/*`.

1. Your task is to implement fixes and improvements per @IMPLEMENTATION_PLAN.md Priority 12. Before making changes, search the codebase using Sonnet subagents (don't assume not implemented). You may use up to 500 parallel Sonnet subagents for searches/reads and only 1 Sonnet subagent for build/tests.

2. After implementing functionality or resolving problems, run the tests: `npx vitest run` (unit tests), `npm run build` (build check). Fix any failures immediately.

3. When you discover issues, immediately update @IMPLEMENTATION_PLAN.md with your findings using a subagent.

4. When the tests pass, update @IMPLEMENTATION_PLAN.md, then `git add -A` then `git commit` with a descriptive message. After the commit, `git push`.

CURRENT STATE: The v1.0→v1.1 rebuild is complete. Dev proxy uses a Vite middleware plugin (no separate server needed). `npm run dev` should load Reddit posts. Mobile ThemeSwitcher hidden in header (BottomNav has theme button). Vercel serverless function has retry logic for Reddit rate-limiting. Red theme has warm red-tinted backgrounds (hue 349).

REMAINING WORK (Priority 12 in IMPLEMENTATION_PLAN.md):
- Verify end-to-end functionality on dev + production
- Fix any issues found during verification
- UX polish: loading states, error recovery, animation timing
- Performance: check bundle sizes, lazy loading opportunities
- Accessibility: screen reader testing, keyboard navigation gaps

99999. Important: When authoring documentation, capture the why — tests and implementation importance.
999999. Important: Single sources of truth, no migrations/adapters. If tests unrelated to your work fail, resolve them as part of the increment.
9999999. Keep @IMPLEMENTATION_PLAN.md current with learnings using a subagent — future work depends on this.
99999999. When you learn something new about how to run the application, update @AGENTS.md using a subagent but keep it brief.
999999999. Implement functionality completely. Placeholders and stubs waste efforts and time.
