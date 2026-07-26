# xTred — Coding Agent Guidelines

## Project Overview
xTred is a personal, single-user, dark-mode-only AI Trading Intelligence platform.
It is NOT a signal bot. It NEVER outputs "Buy" or "Sell".

## Non-negotiable Rules
1. Never output directional trading signals (Buy/Sell). Always output probability % + confidence 1-5.
2. All market data comes from Delta Exchange — never invented.
3. All external API calls are server-side only — never from the browser.
4. Every external payload is Zod-validated before use.
5. Delta Exchange keys and Gemini API key are NEVER exposed to the client bundle.
6. Feature Tracker Sync: Whenever any feature or component is added, modified, completed, or removed, update `.agents/rules/FEATURES.md` with progress % and task status.

## Stack
- Next.js 15 App Router, TypeScript strict mode
- React 19 (useActionState, useOptimistic, Server Actions)
- Tailwind CSS v4 with @theme tokens (see globals.css)
- Supabase for DB + Auth + RLS
- Gemini API via @google/genai — structured JSON output only
- Lightweight Charts (TradingView) for all charts
- TanStack Query for server state, Zustand for UI-only state
- Zod for all external payload validation

## State Management Rule
- Server data (prices, analysis, DB rows) → TanStack Query ONLY
- Browser session state (active symbol, layout) → Zustand ONLY
- Form/mutation state → useActionState + Server Actions

## File Structure
See `/src/` directory. Follow the established pattern exactly.

## Design System
All UI uses CSS variables from globals.css @theme block.
Never hardcode hex colors in components. Use var(--color-*) tokens.
All number displays must use `font-variant-numeric: tabular-nums`.

## Gemini Model Config
Models are configured in .env.local as GEMINI_MODEL_PRO and GEMINI_MODEL_FLASH.
Never hardcode model strings at call sites.
