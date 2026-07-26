# skill.md — xTred Development Standards & Technical Guidelines

> ⚠️ **UNIVERSAL FILE FOR xTRED** — Universal development standards, architecture rules, technical anti-patterns, accessibility guidelines, and TypeScript/Next.js workflows for xTred.

---

## ⚠️ Hard Anti-Patterns & Non-Negotiable Rules

> Violating any of these rules is a **hard failure** of the task, regardless of visual appearance.

### Trading & Security Rules
- **NEVER output directional signals**: Never output "Buy" or "Sell". Always output probability percentages (e.g. 65% Bullish, 25% Sideways, 10% Bearish) + confidence score (1 to 5).
- **Server-Side API Execution Only**: All calls to Delta Exchange REST/WebSocket APIs and Google Gemini API MUST execute on the server side (Server Components, Route Handlers, or Server Actions). Never fetch external APIs directly from browser client components.
- **Strict Payload Validation**: Every external JSON payload received from Delta Exchange or Gemini API MUST be validated with a Zod schema before use.
- **Zero Key Exposure**: Never import or reference secret API keys (`GEMINI_MODEL_PRO`, `DELTA_API_KEY`, etc.) inside Client Components (`'use client'`).

---

### Component & Next.js Architecture Rules

- **Server Components by Default**: Next.js App Router components are Server Components by default. Add `'use client'` only when state (`useState`, `useStore`), browser effects (`useEffect`), or DOM interactions (charts, event listeners) are required.
- **State Architecture Enforcement**:
  - Server Data (market ticks, orderbook, Gemini AI analysis, database records) → **TanStack Query ONLY**.
  - Browser UI State (selected symbol, active timeframes, layout modes, modal toggles) → **Zustand ONLY**.
  - Form/Mutation State → **React 19 `useActionState` + Server Actions**.
- **TypeScript Strictness**:
  - No `any` types allowed. Define explicit TypeScript interfaces in `src/types/` or generate Zod types via `z.infer<typeof schema>`.
- **Financial Number Display**:
  - All financial figures, probabilities, prices, and percentages must have `font-variant-numeric: tabular-nums` (use `.tabular-nums` class).

---

### CSS & Styling Rules

- **Tailwind v4 @theme Enforcement**: Use CSS variable tokens (`var(--color-bg-base)`, `var(--color-bullish)`, `var(--color-text-primary)`) or Tailwind theme classes.
- **No Hardcoded Hex Colors**: Never use inline hardcoded hex values (e.g. `#10b981` or `#ef4444`) inside TSX files. Always reference design system variables.
- **Dark-Mode Only**: xTred is strictly dark-mode-only. Do not build light mode toggles or overrides.
- **Accessible Touch & Click Targets**: Buttons and interactive controls must meet minimum size requirements and maintain clear `:focus-visible` outlines.

---

## 1. Project Architecture & Code Organization

Refer to `.agents/rules/projectstyle.md` for exact folder paths.

### Standard File Responsibilities:
- `src/app/` → Route layout, page components, API route handlers.
- `src/components/` → Modular React 19 UI components.
- `src/lib/gemini/` → `@google/genai` API SDK configuration, structured JSON prompts.
- `src/lib/delta/` → Delta Exchange SDK wrappers & signature generation.
- `src/lib/validators/` → Zod schemas for incoming API responses and form submissions.
- `src/stores/` → Zustand client state definitions.

---

## 2. Gemini AI Integration Standards

- Models are configured via environment variables `GEMINI_MODEL_PRO` and `GEMINI_MODEL_FLASH`.
- Never hardcode model strings (e.g. `"gemini-2.5-flash"`) directly in call sites. Use the configuration helpers in `src/lib/gemini/`.
- Always request **structured JSON output** with response schemas.

---

## 3. Lightweight Charts Integration Standards

- Lightweight Charts containers must be wrapped in `'use client'` React components.
- Chart instances must clean up after themselves in `useEffect` return functions to avoid canvas memory leaks.
- Colors in charts must reference project CSS variable values.

---

## 4. Execution Protocol Summary

1. Inspect existing components before building new ones.
2. Ensure full TypeScript strict typing without compiler warnings.
3. Self-review against `.agents/rules/CHECKLIST.md` before finalizing changes.
