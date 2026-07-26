# projectstyle.md — xTred Design System & Project Architecture

> 🎨 **PROJECT-SPECIFIC FILE** — Edit this file for xTred. This defines the exact folder paths, libraries, color tokens, typography, z-index hierarchy, component inventories, and Next.js / Tailwind CSS architecture rules for **xTred Trading Intelligence**.

---

## ⚡ MANDATORY: Read This Entire File Before Starting Any Work

Before generating any code, markup, or styles for xTred, the AI must:

1. **Read `.agents/AGENTS.md`**, **`.agents/rules/skill.md`**, and **`.agents/rules/projectstyle.md`** completely.
2. **Understand the dark-mode design system** — CSS variables & Tailwind v4 `@theme` tokens in `src/app/globals.css`.
3. **Understand the project structure** — Next.js 15 App Router under `src/app/`, UI components under `src/components/`, state in `src/stores/`.
4. **Understand the state management rule** — TanStack Query for server data, Zustand for UI state, Server Actions for mutations.
5. **Understand financial data rules** — Always use `font-variant-numeric: tabular-nums` (`.tabular-nums`) for numbers.

---

## 0. Project Identity

| Setting             | Value                                                              |
| ------------------- | ------------------------------------------------------------------ |
| **Project Name**    | `xTred AI Trading Intelligence` (`xtred`)                          |
| **Tech Stack**      | `Next.js 15 App Router / React 19 / TypeScript strict / Tailwind CSS v4` |
| **Styling Approach**| `Tailwind v4 @theme tokens + CSS variables (src/app/globals.css)`  |
| **Database & Auth** | `Supabase (PostgreSQL + Auth + RLS policies)`                      |
| **AI Integration**  | `@google/genai` (Gemini API — JSON output only)                     |
| **State Libraries** | `TanStack Query (server state), Zustand (UI state)`               |
| **Validation**      | `Zod` (Strict payload schema validation)                           |
| **Charts**          | `Lightweight Charts` (TradingView canvas integration)               |

---

## 1. Project Folder Structure

```
xtred/
├── src/
│   ├── app/                    # App Router pages & layouts
│   │   ├── globals.css         # Tailwind v4 @theme tokens & core utility styles
│   │   ├── layout.tsx          # Root app layout
│   │   └── page.tsx            # Trading Intelligence Dashboard entry page
│   ├── components/             # React 19 UI components
│   │   ├── charts/             # Lightweight Charts canvas wrappers
│   │   ├── dashboard/          # Intelligence cards, tickers, market overview
│   │   └── ui/                 # Reusable UI primitives (cards, badges, modals)
│   ├── hooks/                  # Custom React hooks (useMarketData, useGeminiInsights)
│   ├── lib/                    # Server utilities & API integrations
│   │   ├── delta/              # Delta Exchange API REST & WebSocket client
│   │   ├── gemini/             # Gemini API client (@google/genai structured output)
│   │   ├── supabase/           # Supabase client/server singletons
│   │   └── validators/         # Zod schemas for payload validation
│   ├── stores/                 # Zustand UI-only state stores (symbol selection, layout settings)
│   ├── types/                  # TypeScript interface declarations
│   └── middleware.ts           # Supabase auth session middleware
├── supabase/                   # Migration SQL scripts & DB definitions
└── public/                     # Static assets (favicons, SVGs, static logos)
```

---

## 2. Libraries & Third-Party Dependencies

| Role                  | Library / Tool                                                           |
| --------------------- | ------------------------------------------------------------------------ |
| **Framework**         | `Next.js 15.2.10` / `React 19.2.4`                                       |
| **AI Engine**         | `@google/genai` (Configured via `GEMINI_MODEL_PRO` & `GEMINI_MODEL_FLASH` env vars) |
| **Financial Charts**  | `lightweight-charts 5.2.0`                                               |
| **State Management**  | `@tanstack/react-query 5.x` (Server state), `zustand 5.x` (UI state)     |
| **Validation**        | `zod 4.x`                                                                |
| **Icons**             | `lucide-react`                                                           |
| **Class Utilities**   | `clsx`, `tailwind-merge`                                                 |

---

## 3. Design System — Color Tokens

Defined in `src/app/globals.css` `@theme` block:

### Background & Surface Layers

| Token                    | Hex Value   | Visual Purpose                                     |
| ------------------------ | ----------- | -------------------------------------------------- |
| `--color-bg-base`        | `#080b12`   | Deepest app background                             |
| `--color-bg-surface`     | `#0d1117`   | Cards, panels, container surfaces                  |
| `--color-bg-elevated`    | `#131920`   | Modals, dropdown menus, popovers                   |
| `--color-bg-overlay`     | `#1a2233`   | Hover states, selected table rows                  |
| `--color-bg-input`       | `#0f1622`   | Form inputs, search fields                         |

### Borders & Brand

| Token                    | Hex Value   | Visual Purpose                                     |
| ------------------------ | ----------- | -------------------------------------------------- |
| `--color-border-subtle`  | `#1e2a3a`   | Soft divider lines, subtle borders                 |
| `--color-border-default` | `#243044`   | Standard card borders                              |
| `--color-border-strong`  | `#2d3d57`   | Active/focused container borders                   |
| `--color-border-focus`   | `#3b82f6`   | Keyboard focus ring outline                        |
| `--color-brand-500`      | `#3b82f6`   | Primary Electric Blue brand color                  |

### Financial & Market Status Tokens

| Token                    | Hex Value   | Visual Purpose                                     |
| ------------------------ | ----------- | -------------------------------------------------- |
| `--color-bullish`        | `#10b981`   | Bullish probability indicator (Emerald 500)        |
| `--color-bullish-dim`    | `#064e3b`   | Bullish background tint                            |
| `--color-bearish`        | `#ef4444`   | Bearish probability indicator (Red 500)            |
| `--color-bearish-dim`    | `#450a0a`   | Bearish background tint                            |
| `--color-sideways`       | `#f59e0b`   | Neutral / Sideways probability indicator (Amber 500)|
| `--color-sideways-dim`   | `#451a03`   | Neutral background tint                            |

---

## 4. Typography System

| Token                | Font Family                                     | Usage                               |
| -------------------- | ----------------------------------------------- | ----------------------------------- |
| `--font-sans`        | `"Inter", system-ui, sans-serif`                | Main app typography                 |
| `--font-display`     | `"Outfit", system-ui, sans-serif`               | Headers, title banners, key metrics |
| `--font-mono`        | `"JetBrains Mono", "Fira Code", monospace`     | Code, JSON payloads, technical metrics|

### Financial Number Formatting Rule
All financial figures, prices, probabilities, percentages, and timestamps MUST include `.tabular-nums`:
```css
font-variant-numeric: tabular-nums;
```

---

## 5. Z-Index Scale

| Layer                | Token / Z-Index |
| -------------------- | --------------- |
| Base content         | `--z-base: 0`   |
| Dropdowns            | `--z-dropdown: 10` |
| Sidebar              | `--z-sidebar: 20` |
| Topbar / Header      | `--z-topbar: 30`  |
| Modals / Dialogs     | `--z-modal: 50`   |
| Toast notifications  | `--z-toast: 100`  |

---

## 6. Pre-Built UI Component Inventory

All components reference classes defined in `src/app/globals.css`:

1. **Standard Panel Card**: `<div class="card p-4">...</div>`
2. **Elevated Card / Modal**: `<div class="card-elevated p-6">...</div>`
3. **Glassmorphism Container**: `<div class="glass p-5">...</div>`
4. **Probability Bar Track**:
   ```tsx
   <div class="prob-bar-track">
     <div class="prob-bar-bullish" style={{ width: `${bullishPct}%` }} />
     <div class="prob-bar-sideways" style={{ width: `${sidewaysPct}%` }} />
     <div class="prob-bar-bearish" style={{ width: `${bearishPct}%` }} />
   </div>
   ```
5. **Live Connection Indicator Dot**: `<span class="live-dot" />`
6. **Financial Data Table**: `<table class="data-table">...</table>`
7. **Color Status Helpers**: `.positive`, `.negative`, `.neutral`

---

## 7. Development Guidelines & Conventions

- **Component Creation**: Use React 19 Client Components (`'use client'`) only when interactive state or browser APIs are required; otherwise default to Server Components.
- **Server Actions**: Place server mutations in dedicated files or inline Server Actions with `'use server'`.
- **CSS Token Enforcement**: Never hardcode `#hex` colors in component JSX/TSX. Use Tailwind `@theme` classes or `var(--color-*)`.
- **Zod Validation**: Validate all incoming market payload data via `lib/validators/`.
