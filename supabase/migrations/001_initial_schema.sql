-- ============================================================
-- xTred — Initial Database Schema
-- Migration: 001_initial_schema
-- Run in Supabase SQL Editor or via: supabase db push
-- ============================================================

-- Auth is handled by Supabase auth.users.
-- Everything below references auth.uid().

-- ─── Profile ──────────────────────────────────────────────────────────────────

create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  risk_max_trade_pct numeric default 1.0 check (risk_max_trade_pct > 0 and risk_max_trade_pct <= 10),
  risk_max_daily_pct numeric default 3.0 check (risk_max_daily_pct > 0 and risk_max_daily_pct <= 20),
  risk_max_weekly_pct numeric default 6.0 check (risk_max_weekly_pct > 0 and risk_max_weekly_pct <= 40),
  created_at timestamptz default now() not null
);

comment on table public.profile is 'Single-user profile with risk management limits (Section 29)';
comment on column public.profile.risk_max_trade_pct is 'Max risk per trade as % of account (default 1%)';
comment on column public.profile.risk_max_daily_pct is 'Max daily loss as % of account (default 3%)';
comment on column public.profile.risk_max_weekly_pct is 'Max weekly loss as % of account (default 6%)';

-- ─── Watchlist ────────────────────────────────────────────────────────────────

create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  symbol text not null check (length(symbol) >= 3),
  created_at timestamptz default now() not null,
  unique (user_id, symbol)
);

create index if not exists idx_watchlist_user on public.watchlist (user_id);

comment on table public.watchlist is 'User watchlist of Delta Exchange symbols';

-- ─── Analysis Snapshots ───────────────────────────────────────────────────────

create table if not exists public.analysis_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  symbol text not null,
  bullish_pct numeric not null check (bullish_pct >= 0 and bullish_pct <= 100),
  bearish_pct numeric not null check (bearish_pct >= 0 and bearish_pct <= 100),
  sideways_pct numeric not null check (sideways_pct >= 0 and sideways_pct <= 100),
  confidence smallint not null check (confidence between 1 and 5),
  risk_score numeric check (risk_score >= 0 and risk_score <= 100),
  reasoning jsonb not null,    -- per-engine structured reasoning
  raw_inputs jsonb not null,   -- exact market data fed to model (audit trail)
  model_version text not null, -- e.g. "gemini-2.5-pro-20250115"
  created_at timestamptz default now() not null,
  -- probabilities must sum to 100 (±1 for rounding)
  constraint probabilities_sum check (
    abs(bullish_pct + bearish_pct + sideways_pct - 100) <= 1
  )
);

create index if not exists idx_snapshots_user_symbol_time
  on public.analysis_snapshots (user_id, symbol, created_at desc);

comment on table public.analysis_snapshots is 'Persisted AI analysis results per symbol (Section 3 output format)';
comment on column public.analysis_snapshots.raw_inputs is 'Exact market context data fed to Gemini — audit trail so any number can be verified';

-- ─── Market Data Cache ────────────────────────────────────────────────────────

create table if not exists public.market_data_cache (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  data_type text not null check (data_type in ('ohlc', 'funding', 'oi', 'liquidation', 'orderbook', 'ticker', 'macro', 'etf_flow', 'whale', 'stablecoin', 'onchain')),
  payload jsonb not null,
  fetched_at timestamptz default now() not null
);

create index if not exists idx_market_cache_symbol_type_time
  on public.market_data_cache (symbol, data_type, fetched_at desc);

comment on table public.market_data_cache is 'Cached market data from Delta Exchange and external sources';

-- ─── News Items ───────────────────────────────────────────────────────────────

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  headline text not null,
  url text,
  classification text check (classification in (
    'Positive', 'Negative', 'Neutral', 'Rumor', 'Confirmed', 'Breaking', 'Fake'
  )),
  sentiment_score numeric check (sentiment_score >= -1 and sentiment_score <= 1),
  published_at timestamptz,
  ingested_at timestamptz default now() not null
);

create index if not exists idx_news_published on public.news_items (published_at desc);
create index if not exists idx_news_classification on public.news_items (classification);

comment on table public.news_items is 'Ingested and Gemini-classified news items';

-- ─── Alerts ───────────────────────────────────────────────────────────────────

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  symbol text,
  alert_type text not null check (alert_type in (
    'high_volatility', 'liquidation_cascade', 'macro_event',
    'funding_extreme', 'oi_spike', 'whale_movement', 'etf_flow_large',
    'stablecoin_mint', 'volume_spike', 'breaking_news'
  )),
  severity smallint check (severity between 1 and 3), -- 1=low, 2=high, 3=critical
  message text not null,
  metadata jsonb,  -- signal breakdown for Section 30 alerts
  is_read boolean default false not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_alerts_user_unread
  on public.alerts (user_id, is_read, created_at desc);

comment on table public.alerts is 'Early Warning System alerts (Section 30) and other system notifications';

-- ─── Macro Events ─────────────────────────────────────────────────────────────

create table if not exists public.macro_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  scheduled_at timestamptz not null,
  actual_value text,
  forecast_value text,
  previous_value text,
  impact smallint check (impact between 1 and 3), -- 1=low, 2=medium, 3=high
  currency text default 'USD',
  created_at timestamptz default now() not null
);

create index if not exists idx_macro_events_scheduled
  on public.macro_events (scheduled_at);

comment on table public.macro_events is 'Economic calendar events (FOMC, CPI, NFP, etc.)';

-- ─── Trade Journal ────────────────────────────────────────────────────────────

create table if not exists public.trade_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  symbol text not null,
  direction text check (direction in ('long', 'short')), -- user's own log, never AI-suggested
  entry_price numeric,
  exit_price numeric,
  size numeric,
  pnl numeric,
  notes text,
  linked_snapshot_id uuid references public.analysis_snapshots(id) on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists idx_journal_user_time
  on public.trade_journal (user_id, created_at desc);

comment on table public.trade_journal is 'Personal trade log — direction is user-entered, never AI-suggested';
comment on column public.trade_journal.direction is 'User-recorded direction only. xTred AI never suggests Buy/Sell.';

-- ============================================================
-- Row Level Security
-- ============================================================

-- User-scoped tables: owner-only access
alter table public.profile enable row level security;
alter table public.watchlist enable row level security;
alter table public.analysis_snapshots enable row level security;
alter table public.alerts enable row level security;
alter table public.trade_journal enable row level security;

create policy "owner_only" on public.profile
  for all using (auth.uid() = id);

create policy "owner_only" on public.watchlist
  for all using (auth.uid() = user_id);

create policy "owner_only" on public.analysis_snapshots
  for all using (auth.uid() = user_id);

create policy "owner_only" on public.alerts
  for all using (auth.uid() = user_id);

create policy "owner_only" on public.trade_journal
  for all using (auth.uid() = user_id);

-- Shared reference tables: authenticated read, service-role write only
alter table public.market_data_cache enable row level security;
alter table public.news_items enable row level security;
alter table public.macro_events enable row level security;

create policy "read_only_authenticated" on public.market_data_cache
  for select using (auth.role() = 'authenticated');

create policy "read_only_authenticated" on public.news_items
  for select using (auth.role() = 'authenticated');

create policy "read_only_authenticated" on public.macro_events
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profile (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
