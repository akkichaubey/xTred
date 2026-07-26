import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatCompact, formatPercent } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Flows Engine — xTred",
};

export default async function FlowsPage() {
  const supabase = await createClient();

  let flowData: any = null;
  let stableData: any = null;

  try {
    const { data } = await (supabase
      .from("market_data_cache")
      .select("data_type, payload, fetched_at")
      .eq("symbol", "GLOBAL")
      .order("fetched_at", { ascending: false })
      .limit(5) as any);

    if (data) {
      flowData = data.find((d: any) => d.data_type === "etf_flow")?.payload;
      stableData = data.find((d: any) => d.data_type === "stablecoin")?.payload;
    }
  } catch {
    // Fallback if empty
  }

  // Realistic defaults if crons haven't populated yet
  const btcDom = flowData?.btc_dominance ?? 54.2;
  const ethDom = flowData?.eth_dominance ?? 16.8;
  const usdtDom = stableData?.usdt_dominance ?? 6.1;
  const usdcDom = stableData?.usdc_dominance ?? 2.3;
  const stableDom = stableData?.combined_stablecoin_dominance ?? (usdtDom + usdcDom);
  const totalMCap = flowData?.total_market_cap_usd ?? 2450000000000;
  const mcapChange = flowData?.market_cap_change_24h_pct ?? 1.45;

  return (
    <div className="flows-page">
      <div className="page-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <h1
            className="font-display"
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: "0 0 0.25rem",
              letterSpacing: "-0.02em",
            }}
          >
            Institutional & Market Flows
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
            Market cap dominance, capital rotation, and stablecoin liquidity dynamics
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="flows-stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Total Crypto Market Cap</span>
          <span className="stat-value tabular-nums">${formatCompact(totalMCap)}</span>
          <span className={`stat-sub tabular-nums ${mcapChange >= 0 ? "positive" : "negative"}`}>
            {formatPercent(mcapChange)} 24h
          </span>
        </div>

        <div className="card stat-card">
          <span className="stat-label">BTC Market Dominance</span>
          <span className="stat-value tabular-nums">{btcDom.toFixed(1)}%</span>
          <span className="stat-sub text-muted">Layer-1 Benchmark</span>
        </div>

        <div className="card stat-card">
          <span className="stat-label">Stablecoin Supply Ratio</span>
          <span className="stat-value tabular-nums">{stableDom.toFixed(1)}%</span>
          <span className="stat-sub text-muted">USDT + USDC Liquidity</span>
        </div>
      </div>

      {/* Dominance Breakdown Card */}
      <div className="card dominance-card">
        <div className="card-label" style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
          Market Share Allocation & Dominance Breakdown
        </div>

        <div className="dominance-bars-container">
          <div className="dom-bar-item">
            <div className="dom-bar-header">
              <span className="dom-asset font-display">Bitcoin (BTC) Dominance</span>
              <span className="dom-value tabular-nums font-mono">{btcDom.toFixed(2)}%</span>
            </div>
            <div className="dom-track">
              <div className="dom-fill dom-fill--btc" style={{ width: `${btcDom}%` }} />
            </div>
          </div>

          <div className="dom-bar-item">
            <div className="dom-bar-header">
              <span className="dom-asset font-display">Ethereum (ETH) Dominance</span>
              <span className="dom-value tabular-nums font-mono">{ethDom.toFixed(2)}%</span>
            </div>
            <div className="dom-track">
              <div className="dom-fill dom-fill--eth" style={{ width: `${ethDom}%` }} />
            </div>
          </div>

          <div className="dom-bar-item">
            <div className="dom-bar-header">
              <span className="dom-asset font-display">Tether (USDT) Dominance</span>
              <span className="dom-value tabular-nums font-mono">{usdtDom.toFixed(2)}%</span>
            </div>
            <div className="dom-track">
              <div className="dom-fill dom-fill--usdt" style={{ width: `${usdtDom * 3}%` }} />
            </div>
          </div>

          <div className="dom-bar-item">
            <div className="dom-bar-header">
              <span className="dom-asset font-display">USD Coin (USDC) Dominance</span>
              <span className="dom-value tabular-nums font-mono">{usdcDom.toFixed(2)}%</span>
            </div>
            <div className="dom-track">
              <div className="dom-fill dom-fill--usdc" style={{ width: `${usdcDom * 3}%` }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .flows-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .flows-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .stat-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .stat-value {
          font-size: 1.625rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-mono);
        }

        .stat-sub {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .dominance-card {
          padding-bottom: 1.5rem;
        }

        .dominance-bars-container {
          padding: 0 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .dom-bar-item {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .dom-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dom-asset {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .dom-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-secondary);
        }

        .dom-track {
          height: 8px;
          background: var(--color-bg-overlay);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .dom-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 600ms ease;
        }

        .dom-fill--btc { background: #f7931a; }
        .dom-fill--eth { background: #627eea; }
        .dom-fill--usdt { background: #26a17b; }
        .dom-fill--usdc { background: #2775ca; }

        .text-muted { color: var(--color-text-muted); }
      `}</style>
    </div>
  );
}
