# xTred — Production Deployment Guide

This guide covers deploying xTred to **Vercel** and connecting it with your **Supabase** backend.

---

## 📋 Pre-Deployment Checklist

1. **Supabase Project**: Active project at [supabase.com](https://supabase.com).
2. **Delta Exchange Account**: API Key and API Secret from [Delta Exchange API Keys](https://www.delta.exchange/app/account/api-keys).
3. **Gemini API Key**: API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **Alpha Vantage Key**: Free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key).

---

## 🗄️ Step 1: Database Migration Execution

Run the SQL migration script against your Supabase SQL Editor:

1. Open Supabase Dashboard → **SQL Editor**.
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
3. Click **Run** to generate all tables (`profile`, `watchlist`, `analysis_snapshots`, `market_data_cache`, `news_items`, `alerts`, `macro_events`, `trade_journal`) and RLS policies.
4. (Optional) Run `npx tsx scripts/seed-db.ts` to seed initial macro and news events.

---

## 🚀 Step 2: Deploy to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository.
3. Set Build Command: `pnpm run build`
4. Set Output Directory: `.next`

### Environment Variables to Configure on Vercel:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Publishable / Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key (Server-only) |
| `DELTA_API_KEY` | Your Delta Exchange API Key |
| `DELTA_API_SECRET` | Your Delta Exchange API Secret |
| `DELTA_ENV` | Set to `mainnet` for live trading or `testnet` for dev |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `GEMINI_MODEL_PRO` | `gemini-2.5-pro` |
| `GEMINI_MODEL_FLASH` | `gemini-2.5-flash` |
| `ALPHA_VANTAGE_API_KEY` | Your Alpha Vantage API Key |

---

## ⏰ Step 3: Verify Background Ingestion Crons

xTred utilizes `vercel.json` to automatically schedule background data ingestion jobs:

- `/api/cron/poll-macro`: Ingests FOMC/CPI calendar (Runs every 6 hours)
- `/api/cron/poll-news`: Ingests and classifies crypto news (Runs every hour)
- `/api/cron/poll-flows`: Ingests market dominance & ETF flows (Runs every 30 minutes)
- `/api/cron/early-warning`: Section 30 volatility scan (Runs every 30 minutes)

Verify status under Vercel Project Settings → **Cron Jobs**.

---

## ⚡ Step 4: Verification Commands

Before deploying, run local verification:

```bash
# Typecheck
pnpm run typecheck

# Unit Tests
pnpm run test

# Production Build Test
pnpm run build
```
