# Development Workflow — xTred

Every task in xTred follows this exact process. Do not skip steps.

---

Step 1 → Read `.agents/rules/skill.md`

Step 2 → Read `.agents/rules/projectstyle.md`

Step 3 → Inspect target page / component in `src/`

Step 4 → Verify state classification (TanStack Query for server data vs Zustand for UI state vs Server Actions)

Step 5 → Verify Zod schema validation for any new payloads in `src/lib/validators/`

Step 6 → Build / update React 19 component (default to Server Component unless Client Component is required)

Step 7 → Apply design system tokens from `src/app/globals.css` (no hardcoded colors)

Step 8 → Apply `.tabular-nums` formatting to all numbers/percentages

Step 9 → Ensure zero API secrets are exposed to client bundle

Step 10 → Run `npm run typecheck` (`tsc --noEmit`) to verify type safety

Step 11 → Self-review against `.agents/rules/CHECKLIST.md`

Step 12 → Run `.agents/rules/QA.md` audit before finalizing

Step 13 → Update `.agents/rules/FEATURES.md` with feature progress %, completed tasks, remaining tasks, and status.
