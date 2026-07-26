// Shared domain types for xTred
// All types are derived from Zod schemas in lib/*/types.ts — this file re-exports
// the inferred TypeScript types for use throughout the app.

// ─── Market / Delta ──────────────────────────────────────────────────────────

export type Side = "buy" | "sell";
export type TimeInForce = "gtc" | "ioc" | "fok";

export interface Ticker {
  symbol: string;
  mark_price: string;
  last_price: string;
  volume: string;
  turnover: string;
  open: string;
  high: string;
  low: string;
  close: string;
  change_24h: number; // percentage
  funding_rate: string;
  next_funding_realization: string;
  open_interest: string;
  timestamp: number;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBook {
  symbol: string;
  buy: OrderBookLevel[];
  sell: OrderBookLevel[];
  timestamp: number;
}

export interface FundingRate {
  symbol: string;
  funding_rate: string;
  predicted_funding_rate: string;
  next_funding_realization: string;
}

export interface OpenInterest {
  symbol: string;
  open_interest: string;
  open_interest_usd: string;
  timestamp: number;
}

export interface LiquidationRecord {
  id: number;
  symbol: string;
  side: Side;
  size: number;
  price: number;
  timestamp: number;
}

export type CandleResolution =
  | "1m" | "3m" | "5m" | "15m" | "30m"
  | "1h" | "2h" | "4h" | "6h" | "12h"
  | "1d" | "1w" | "1M";

// ─── AI Analysis (Section 3 output format) ───────────────────────────────────

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;
export type MarketDirection = "bullish" | "bearish" | "sideways";
export type NewsClassification =
  | "Positive" | "Negative" | "Neutral"
  | "Rumor" | "Confirmed" | "Breaking" | "Fake";

export interface Probabilities {
  bullish: number;  // 0-100
  bearish: number;  // 0-100
  sideways: number; // 0-100
}

export interface EngineOutlook {
  signal: MarketDirection | "mixed" | "neutral";
  summary: string;
  data_points: string[];
}

export interface AnalysisResult {
  symbol: string;
  // Per-engine outputs
  market_summary: string;
  macro_outlook: EngineOutlook;
  fundamental_outlook: EngineOutlook;
  news_sentiment: {
    signal: MarketDirection | "mixed" | "neutral";
    summary: string;
    items: Array<{ headline: string; classification: NewsClassification; impact: string }>;
  };
  institutional_activity: {
    etf_flow: EngineOutlook;
    whale_activity: EngineOutlook;
    dxy: EngineOutlook;
    treasury_yield: EngineOutlook;
  };
  derivatives: {
    open_interest: EngineOutlook;
    funding_rate: EngineOutlook;
    liquidation: EngineOutlook;
  };
  onchain: EngineOutlook;
  volume: EngineOutlook;
  ohlc: EngineOutlook;
  market_structure: EngineOutlook;
  // Synthesis
  probabilities: Probabilities;
  confidence: ConfidenceLevel;
  risk_score: number; // 0-100
  reasoning: string;
  conclusion: string;
  // Metadata
  model_version: string;
  analyzed_at: string; // ISO timestamp
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertType =
  | "high_volatility"
  | "liquidation_cascade"
  | "macro_event"
  | "funding_extreme"
  | "oi_spike"
  | "whale_movement"
  | "etf_flow_large"
  | "stablecoin_mint"
  | "volume_spike"
  | "breaking_news";

export type AlertSeverity = 1 | 2 | 3; // 1=low, 2=high, 3=critical

export interface Alert {
  id: string;
  symbol: string | null;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Macro ───────────────────────────────────────────────────────────────────

export interface MacroEvent {
  id: string;
  event_name: string;
  scheduled_at: string;
  actual_value: string | null;
  forecast_value: string | null;
  previous_value: string | null;
  impact: 1 | 2 | 3;
}

// ─── News ────────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  source: string;
  headline: string;
  url: string | null;
  classification: NewsClassification | null;
  sentiment_score: number | null;
  published_at: string | null;
  ingested_at: string;
}

// ─── Risk ────────────────────────────────────────────────────────────────────

export interface RiskLimits {
  risk_max_trade_pct: number;  // default 1.0
  risk_max_daily_pct: number;  // default 3.0
  risk_max_weekly_pct: number; // default 6.0
}

export interface RiskStatus {
  daily_used_pct: number;
  weekly_used_pct: number;
  is_daily_breached: boolean;
  is_weekly_breached: boolean;
  should_stop_trading: boolean;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface UISymbolState {
  symbol: string;
  resolution: CandleResolution;
}
