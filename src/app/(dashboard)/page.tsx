import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import RealtimeDashboardView from "@/components/dashboard/RealtimeDashboardView";
import type { AnalysisOutput } from "@/lib/ai/schemas";

export const metadata: Metadata = {
  title: "Dashboard — xTred",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Try to query the latest analysis snapshot from the database
  let latestSnapshot: any = null;
  try {
    const { data } = await supabase
      .from("analysis_snapshots")
      .select("reasoning, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    latestSnapshot = data;
  } catch {
    // Fallback if DB table not loaded yet
  }

  // Fallback template data if no snapshots exist yet
  const analysis: AnalysisOutput = (latestSnapshot?.reasoning as unknown as AnalysisOutput) || {
    symbol: "BTCUSD",
    market_summary: "AI Market outlook simulation under initial setup conditions.",
    probabilities: { bullish: 52, bearish: 24, sideways: 24 },
    confidence: 3,
    risk_score: 42,
    reasoning: "DXY index weakness and active spot accumulation suggest steady bullish strength. Short-term derivatives show minor funding rate extension but remains moderate.",
    conclusion: "Bullish 52% / Bearish 24% / Sideways 24% — Confidence ★★★☆☆ (3/5). Spot inflow supports positive momentum, though local derivatives funding suggests a minor cool-off period. Risk score 42/100.",
    macro_outlook: { signal: "bullish", summary: "DXY weak, yields neutral", data_points: [] },
    fundamental_outlook: { signal: "bullish", summary: "Positive adoption news", data_points: [] },
    news_sentiment: { signal: "bullish", summary: "Bullish dominance", items: [] },
    institutional_activity: {
      etf_flow: { signal: "bullish", summary: "Positive net inflows", data_points: [] },
      whale_activity: { signal: "bullish", summary: "Active transfers to cold storage", data_points: [] },
      dxy: { signal: "bullish", summary: "DXY down", data_points: [] },
      treasury_yield: { signal: "neutral", summary: "Yield stable", data_points: [] }
    },
    derivatives: {
      open_interest: { signal: "neutral", summary: "OI flat", data_points: [] },
      funding_rate: { signal: "neutral", summary: "Funding rate moderate", data_points: [] },
      liquidation: { signal: "neutral", summary: "No major cascades", data_points: [] }
    },
    onchain: { signal: "bullish", summary: "Exchange reserves dropping", data_points: [] },
    volume: { signal: "bullish", summary: "Volume rising on ups", data_points: [] },
    ohlc: { signal: "bullish", summary: "Higher lows pattern", data_points: [] },
    market_structure: { signal: "bullish", summary: "Bullish market structure", data_points: [] }
  };

  return <RealtimeDashboardView initialAnalysis={analysis} />;
}
