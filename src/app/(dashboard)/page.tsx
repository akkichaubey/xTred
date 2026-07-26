import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProbabilityGauge } from "@/components/dashboard/ProbabilityEngine";
import SnapshotComparator from "@/components/dashboard/SnapshotComparator";
import type { AnalysisOutput } from "@/lib/ai/schemas";

export const metadata: Metadata = {
  title: "Dashboard",
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

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title font-display">Trading Intelligence</h1>
          <p className="page-subtitle">
            AI-powered market analysis — probability-based, never directional
          </p>
        </div>
        <div className="page-header-badges">
          <span className="phase-badge">Phase 5 — AI Engine Active</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Live Probability Engine */}
        <div className="dashboard-card-full">
          <ProbabilityGauge analysis={analysis} />
        </div>

        {/* Retrospective Forecast Comparator */}
        <div className="dashboard-card-full">
          <SnapshotComparator />
        </div>

        {/* Phase Progress Tracker */}
        <div className="card dashboard-card">
          <div className="card-label">Phase Progress</div>
          <div className="progress-list">
            {[
              { label: "Foundations", done: true },
              { label: "Auth & Shell", done: true },
              { label: "Delta Exchange", done: true },
              { label: "Database & RLS", done: true },
              { label: "Macro / News / Flows", done: true },
              { label: "AI Engine", done: true },
              { label: "Early Warning", done: true },
              { label: "Risk & Journal", done: true },
            ].map((phase) => (
              <div key={phase.label} className="progress-item">
                <div className={`progress-dot ${phase.done ? "progress-dot--done" : ""}`} />
                <span className={phase.done ? "progress-label--done" : "progress-label"}>
                  {phase.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Stack */}
        <div className="card dashboard-card">
          <div className="card-label">Stack</div>
          <div className="stack-list">
            {[
              ["Next.js 15", "App Router"],
              ["React 19", "Server Actions"],
              ["Tailwind v4", "@theme tokens"],
              ["Supabase", "Postgres + Auth"],
              ["Gemini API", "Structured output"],
              ["Delta Exchange", "REST + WebSocket"],
              ["TanStack Query", "Server state"],
              ["Zustand", "UI state"],
            ].map(([name, detail]) => (
              <div key={name} className="stack-item">
                <span className="stack-name">{name}</span>
                <span className="stack-detail">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 0.25rem;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        .page-header-badges {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .phase-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.25rem 0.625rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--color-bullish);
          border-radius: var(--radius-full);
          letter-spacing: 0.02em;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.15);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 280px 280px;
          gap: 1rem;
          align-items: start;
        }

        .dashboard-card-full { grid-column: 1; }
        .dashboard-card { }

        .card-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          padding: 1rem 1rem 0.5rem;
        }

        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0 1rem 1rem;
        }

        .progress-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.4rem 0;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .progress-item:last-child { border-bottom: none; }

        .progress-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-border-strong);
          flex-shrink: 0;
        }

        .progress-dot--done {
          background: var(--color-bullish);
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
        }

        .progress-label {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        .progress-label--done {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
        }

        .stack-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0 1rem 1rem;
        }

        .stack-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .stack-item:last-child { border-bottom: none; }

        .stack-name {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .stack-detail {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
