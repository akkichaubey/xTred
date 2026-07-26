# PROMPTS.md — Ready-to-Use AI Prompts for xTred

---

## 🛠️ Development Mode Prompt
*Use this at the start of every xTred development session.*

```
Follow .agents/AGENTS.md.
Read .agents/rules/skill.md.
Read .agents/rules/projectstyle.md.
Follow .agents/rules/CHECKLIST.md.
Follow .agents/rules/WORKFLOW.md.
Enforce xTred trading rules: no Buy/Sell signals, Zod validation, server state in TanStack Query, UI state in Zustand, dark mode tokens.
Self-review before responding.
```

---

## 🧪 QA Testing Mode Prompts
*Use these to audit xTred features.*

---

### 1. Full xTred Audit
```
Read .agents/rules/QA.md completely.
Run a full QA audit on xTred following every check in QA.md.
Check: Security & secrets, trading rules (no Buy/Sell), TypeScript types, state architecture (TanStack Query vs Zustand), design tokens, charts.
Report every issue found with severity (Critical / High / Medium / Low).
Fix all Critical and High issues.
```

---

### 2. TypeScript & Build Check
```
Read .agents/rules/skill.md.
Run typecheck (`npm run typecheck`) and lint (`npm run lint`).
Report any type errors or lint warnings.
Fix all errors without introducing `any` types.
```

---

### 3. Security & API Secret Audit
```
Audit the codebase to verify:
1. No Gemini API or Delta Exchange secret keys are exposed in client components ('use client').
2. All external API calls run server-side.
3. Every payload is validated with Zod.
Report any violation.
```

---

### 4. UI & Design System Audit
```
Read .agents/rules/projectstyle.md.
Check components for:
- Dark mode theme compliance using globals.css variables.
- Zero hardcoded hex colors.
- All numbers formatted with tabular-nums.
Fix any styling inconsistencies.
```
