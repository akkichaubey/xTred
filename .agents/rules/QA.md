# QA.md — xTred Quality Assurance & Quality Control Audit

> **Purpose**: Run this full QA/QC audit on xTred before delivery or key milestones. Ensure all security, design, state management, and type safety standards pass.

---

## Section A — xTred Route & Feature Inventory

Audited Pages & Routes:

| # | Feature / Route | Location / Path | Status |
|---|-----------------|-----------------|--------|
| 1 | Main Dashboard | `src/app/page.tsx` | |
| 2 | Symbol Analysis Detail | `src/app/symbol/[symbol]/page.tsx` | |
| 3 | Market Data API Route | `src/app/api/market/route.ts` | |
| 4 | Gemini AI Analysis API Route | `src/app/api/ai/analyze/route.ts` | |
| 5 | Auth & Middleware | `src/middleware.ts` / Supabase Auth | |

---

## Section B — Feature-Wise Audit Checklist

### B1. Security & Key Privacy Audit

| # | Check | Status |
|---|---|---|
| 1 | `GEMINI_MODEL_PRO` and `GEMINI_MODEL_FLASH` accessed ONLY on server side | |
| 2 | Delta Exchange secret keys NEVER imported into client components | |
| 3 | Zero environment variable secrets exposed in browser `window` or bundle | |
| 4 | Supabase Row Level Security (RLS) policies enabled on all database tables | |
| 5 | API endpoints enforce authenticated Supabase session checking | |

---

### B2. Trading Rules Compliance Audit

| # | Check | Status |
|---|---|---|
| 1 | ZERO directional trading advice ("Buy" or "Sell") output by system | |
| 2 | All AI outputs formatted as Probability % + Confidence Score (1-5) | |
| 3 | All market data derived strictly from Delta Exchange API (no fake data) | |
| 4 | Every external payload passed through Zod validation schemas | |

---

### B3. TypeScript & Code Quality

| # | Check | Status |
|---|---|---|
| 1 | `npm run typecheck` (`tsc --noEmit`) passes with 0 errors | |
| 2 | `npm run lint` passes without ESLint errors | |
| 3 | No `any` type usage anywhere in codebase | |
| 4 | All server responses strictly typed | |
| 5 | Server Actions use React 19 `useActionState` pattern properly | |

---

### B4. State Architecture Compliance

| # | Check | Status |
|---|---|---|
| 1 | Server data (prices, market analysis, DB rows) fetched via TanStack Query ONLY | |
| 2 | Browser UI state (active symbol, layout toggles) stored in Zustand ONLY | |
| 3 | Mutation forms utilize Server Actions | |
| 4 | No duplicate local state duplicating Zustand or Query caches | |

---

### B5. Design System & UI Compliance

| # | Check | Status |
|---|---|---|
| 1 | Dark-mode theme rendered seamlessly (`--color-bg-base`, etc.) | |
| 2 | No hardcoded hex values in component TSX (uses CSS variables/tokens) | |
| 3 | All financial numbers formatted with `font-variant-numeric: tabular-nums` | |
| 4 | Bullish (`#10b981`), Bearish (`#ef4444`), and Sideways (`#f59e0b`) colors match globals.css | |
| 5 | Glassmorphism (`.glass`) and card components styled consistently | |
| 6 | Interactive controls (buttons, links) have accessible focus rings | |

---

### B6. Charts & Visualizations Audit

| # | Check | Status |
|---|---|---|
| 1 | Lightweight Charts canvases render without console errors | |
| 2 | Canvas destruction & cleanup handled on component unmount | |
| 3 | Chart colors match xTred CSS `@theme` tokens | |
| 4 | Responsive chart resizing behaves smoothly across window resizes | |

---

## Section C — Final Sign-Off Table

| # | Category | Tested By | Date | Status |
|---|---|---|---|---|
| 1 | Security & Privacy | | | |
| 2 | Trading Rules Compliance | | | |
| 3 | TypeScript & Build Verification | | | |
| 4 | State Management Audit | | | |
| 5 | Design System & UI Audit | | | |
| 6 | Financial Charts Audit | | | |

> **All items must pass before marking the feature complete.**
