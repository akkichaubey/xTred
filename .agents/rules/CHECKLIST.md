# Pre-Delivery Checklist — xTred

Before completing any task or delivering code for xTred, verify every item below:

---

## 1. Read Phase
- [ ] Read `.agents/rules/skill.md`
- [ ] Read `.agents/rules/projectstyle.md`
- [ ] Inspect target component or page context

## 2. Trading & Security Phase
- [ ] NO Buy/Sell directional signals generated (probability % + confidence score 1-5 only)
- [ ] Zero API secret keys (`GEMINI_MODEL_*`, `DELTA_*`) exposed in Client Components
- [ ] All external market payloads validated with Zod schemas
- [ ] External API calls execute on server side only

## 3. Architecture & State Management Phase
- [ ] Server data uses TanStack Query ONLY
- [ ] Client browser UI state uses Zustand ONLY
- [ ] Form mutations use React 19 Server Actions / `useActionState`
- [ ] TypeScript strict mode satisfied (no `any`)

## 4. Design & UI Phase
- [ ] Follows dark-mode design system from `src/app/globals.css`
- [ ] Zero hardcoded hex colors in TSX (uses CSS variable `@theme` tokens)
- [ ] All financial numbers display with `.tabular-nums`
- [ ] No `<div>` tags used as interactive buttons or links

## 5. Verification Phase
- [ ] `npm run typecheck` passes cleanly
- [ ] Run `.agents/rules/QA.md` audit checks
- [ ] Updated `.agents/rules/FEATURES.md` with progress %, completed tasks, and remaining tasks
- [ ] Code is production-ready
