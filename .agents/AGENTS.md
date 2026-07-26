# AI Agent Rules — xTred Trading Intelligence
# Universal rules file — works across all AI IDEs (Antigravity, Cursor, Windsurf, GitHub Copilot, etc.)
# Scope: Project-wide. Applied on every task automatically.

---

## Project Overview
xTred is a personal, single-user, dark-mode-only AI Trading Intelligence platform.
It is NOT a signal bot. It NEVER outputs "Buy" or "Sell".

---

## Non-Negotiable Core Rules
1. **Never output directional trading signals (Buy/Sell)**. Always output probability % + confidence scale (1 to 5).
2. **All market data comes from Delta Exchange** — never invent synthetic or fake prices.
3. **All external API calls are server-side only** — never make calls to exchange or AI endpoints from the browser.
4. **Every external payload must be Zod-validated** before use.
5. **API keys (Delta Exchange, Gemini API) are secret** — never expose them to client component bundles.
6. **Feature Tracker Sync**: Whenever any feature or route is created, modified, completed, or removed, the AI MUST update `.agents/rules/FEATURES.md` immediately with updated progress %, completed tasks, and remaining tasks.

---

## Mandatory Files to Read First

Before writing **any** code, the AI MUST read all of the following files in order:

1. `.agents/rules/skill.md` — Universal Code Standards & Technical Anti-Patterns
2. `.agents/rules/projectstyle.md` — Project Design Tokens, File Paths & Component Inventory
3. `.agents/rules/FEATURES.md` — Complete Features Inventory & Module Breakdown
4. `.agents/rules/QA.md` — QA Requirements & Checklist
5. `.agents/rules/CHECKLIST.md` — Pre-Delivery Checklist
6. `.agents/rules/WORKFLOW.md` — Development Workflow Steps
6. The target component or page file where changes will be made.

**Do not skip any of these steps. Do not write code before reading all files.**

---

## Mandatory 5-Phase Execution Protocol

### Phase 1 — Read the Entire Context
- Read all `.agents/rules/` files listed above.
- Inspect existing components in `src/components/`.
- Inspect design system tokens in `src/app/globals.css`.
- Inspect Zustand UI stores (`src/stores/`) and custom hooks (`src/hooks/`).

### Phase 2 — Analyze Before Coding
Provide an explicit analysis:
- Which existing components can be reused.
- Which CSS variables and Tailwind v4 `@theme` tokens apply.
- State management division: TanStack Query (server state), Zustand (UI-only state), Server Actions (mutations).

> **Rule**: If an existing component or utility can be reused, you MUST reuse it. Do NOT create duplicate code.

### Phase 3 — Compare the Design System
- Dark-mode-only aesthetic.
- Financial numbers must use `tabular-nums`.
- Colors must use `var(--color-*)` tokens defined in `src/app/globals.css`.

### Phase 4 — Plan Before Building
Explain before writing code:
- Which files will be modified or created.
- Which components will be reused.
- Which Zod schemas or types need to be declared.

### Phase 5 — Build & Verify
- Implement modular, production-ready code.
- Validate types with TypeScript (`npm run typecheck`).
- Verify zero runtime console errors or exposed secrets.

---

## Tech Stack & Architecture

- **Framework**: Next.js 15 App Router (`src/app`), TypeScript strict mode
- **UI & React**: React 19 (`useActionState`, `useOptimistic`, Server Actions)
- **Styling**: Tailwind CSS v4 with `@theme` tokens in `src/app/globals.css`
- **Database & Auth**: Supabase (PostgreSQL + Auth + RLS policies)
- **AI Engine**: Gemini API via `@google/genai` (structured JSON output only)
- **Charts**: Lightweight Charts (TradingView integration)
- **State Management**:
  - Server Data (prices, analysis, DB rows) → **TanStack Query ONLY**
  - Browser UI State (active symbol, chart settings, modal toggles) → **Zustand ONLY**
  - Form & Data Mutations → **useActionState + Server Actions**
- **Validation**: Zod for all API request/response payloads

---

## Project File Structure Reference

```
src/
  app/                  <- Next.js App Router (pages, layouts, route handlers)
    globals.css         <- Tailwind v4 @theme design tokens & global CSS
    layout.tsx          <- Root layout
    page.tsx            <- Main dashboard page
  components/           <- UI components
    charts/             <- Lightweight Charts wrappers
    ui/                 <- Reusable UI primitives (cards, badges, buttons)
  hooks/                <- Custom React hooks
  lib/                  <- Core utilities, API clients (Delta, Gemini), Zod schemas
    gemini/             <- Gemini API client & prompts
    delta/              <- Delta Exchange REST/WS clients
    supabase/           <- Supabase client & server instances
  stores/               <- Zustand UI-only state stores
  types/                <- Shared TypeScript definitions
supabase/               <- Schema migrations & seed data
.agents/
  AGENTS.md             <- THIS FILE — master rules (auto-loaded by all AI IDEs)
  rules/
    skill.md            <- Universal code standards & anti-patterns
    projectstyle.md     <- Design tokens, colors, fonts, components
    QA.md               <- Full QA/QC audit checklist
    CHECKLIST.md        <- Pre-delivery checklist
    WORKFLOW.md         <- Step-by-step development workflow
    PROMPTS.md          <- Ready-to-use AI prompt templates
    README.md           <- System overview
```

---

## Self-Review Checklist Before Responding

- [ ] Read `.agents/rules/skill.md`
- [ ] Read `.agents/rules/projectstyle.md`
- [ ] Read `.agents/rules/QA.md`
- [ ] Reused existing components & design system tokens from `globals.css`
- [ ] Enforced server state vs UI state separation (TanStack Query vs Zustand)
- [ ] All external API payloads Zod-validated
- [ ] Financial display uses `tabular-nums`
- [ ] Code is fully typed without `any`
- [ ] Verified build / typecheck readiness

---

## Absolute Prohibitions

- Do NOT output Buy/Sell directional trade signals.
- Do NOT make external API calls directly from client components.
- Do NOT hardcode hex colors — always use `@theme` CSS variables (`var(--color-*)`).
- Do NOT invent fake market prices.
- Do NOT expose Gemini or Delta Exchange secret keys to the browser.
- Do NOT use inline styles when Tailwind utility classes or `@theme` tokens exist.
- Do NOT use `<div>` tags as interactive buttons or links.

---

*Auto-discovered by Antigravity (workspace customization root: `.agents/`). Compatible with Cursor, Windsurf, GitHub Copilot, and all assistants that support `AGENTS.md`.*
