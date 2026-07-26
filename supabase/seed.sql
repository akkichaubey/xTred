-- ============================================================
-- xTred — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Upcoming macro events (update with real dates)
insert into public.macro_events (event_name, scheduled_at, forecast_value, previous_value, impact, currency)
values
  ('FOMC Interest Rate Decision', now() + interval '14 days', '5.25%', '5.50%', 3, 'USD'),
  ('US CPI (MoM)', now() + interval '7 days', '0.3%', '0.4%', 3, 'USD'),
  ('US NFP (Non-Farm Payrolls)', now() + interval '10 days', '185K', '206K', 3, 'USD'),
  ('US PPI (MoM)', now() + interval '8 days', '0.2%', '0.2%', 2, 'USD'),
  ('US Retail Sales (MoM)', now() + interval '12 days', '0.3%', '-0.1%', 2, 'USD'),
  ('Federal Reserve Meeting Minutes', now() + interval '21 days', null, null, 2, 'USD'),
  ('US GDP (QoQ)', now() + interval '30 days', '2.1%', '1.6%', 3, 'USD');

-- Note: Watchlist and profile rows are created automatically via the trigger
-- when the user account is set up in Supabase Auth.
-- Seed them manually after creating the user if needed:
--
-- insert into public.watchlist (user_id, symbol) values
--   ('YOUR_USER_UUID', 'BTCUSD'),
--   ('YOUR_USER_UUID', 'ETHUSD'),
--   ('YOUR_USER_UUID', 'SOLUSD');
