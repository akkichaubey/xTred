-- ============================================================================
-- xTred Demo Trading Schema & RLS Policies
-- PostgreSQL migration script for virtual trading wallet, positions, and orders
-- ============================================================================

-- 1. Demo Wallets Table
CREATE TABLE IF NOT EXISTS public.demo_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    starting_balance NUMERIC(18, 4) NOT NULL DEFAULT 100000.0000,
    balance NUMERIC(18, 4) NOT NULL DEFAULT 100000.0000,
    used_margin NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    realized_pnl NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_demo_wallet UNIQUE (user_id)
);

-- 2. Demo Positions Table
CREATE TABLE IF NOT EXISTS public.demo_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    side VARCHAR(8) NOT NULL CHECK (side IN ('buy', 'sell')),
    size NUMERIC(18, 4) NOT NULL CHECK (size > 0),
    entry_price NUMERIC(18, 4) NOT NULL,
    leverage INT NOT NULL DEFAULT 10 CHECK (leverage >= 1 AND leverage <= 100),
    initial_margin NUMERIC(18, 4) NOT NULL,
    liquidation_price NUMERIC(18, 4) NOT NULL,
    stop_loss NUMERIC(18, 4),
    take_profit NUMERIC(18, 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Demo Orders Table
CREATE TABLE IF NOT EXISTS public.demo_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    side VARCHAR(8) NOT NULL CHECK (side IN ('buy', 'sell')),
    order_type VARCHAR(24) NOT NULL CHECK (order_type IN ('market', 'limit', 'stop_market', 'take_profit_market')),
    price NUMERIC(18, 4),
    stop_price NUMERIC(18, 4),
    size NUMERIC(18, 4) NOT NULL CHECK (size > 0),
    filled_size NUMERIC(18, 4) NOT NULL DEFAULT 0,
    leverage INT NOT NULL DEFAULT 10,
    status VARCHAR(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'partially_filled', 'cancelled', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Demo Trades Execution History
CREATE TABLE IF NOT EXISTS public.demo_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.demo_orders(id) ON DELETE SET NULL,
    symbol VARCHAR(32) NOT NULL,
    side VARCHAR(8) NOT NULL,
    price NUMERIC(18, 4) NOT NULL,
    size NUMERIC(18, 4) NOT NULL,
    fee NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    realized_pnl NUMERIC(18, 4) DEFAULT 0.0000,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.demo_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow access to authenticated user's own rows)
CREATE POLICY "Users can manage own demo wallet" ON public.demo_wallets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own demo positions" ON public.demo_positions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own demo orders" ON public.demo_orders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own demo trades" ON public.demo_trades
    FOR ALL USING (auth.uid() = user_id);
