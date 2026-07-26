"use client";

import { useTickerStore } from "@/stores/useTickerStore";
import { formatPrice, formatPercent, getPnLClass } from "@/lib/utils";

export default function DashboardHeader() {
  const activeSymbol = useTickerStore((s) => s.activeSymbol);
  const setActiveSymbol = useTickerStore((s) => s.setActiveSymbol);
  const ticker = useTickerStore((s) => s.tickers[activeSymbol]);

  const symbols = ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD"];

  const markPrice = ticker?.markPrice || 0;
  const change24h = ticker?.change24hPct || 0;
  const pnlClass = getPnLClass(change24h);

  return (
    <div className="dashboard-header-bar card">
      <div className="header-title-group">
        <h1 className="page-title font-display">Trading Intelligence</h1>
        <p className="page-subtitle">
          AI-powered market analysis — probability-based, never directional
        </p>
      </div>

      <div className="header-ticker-group">
        {/* Symbol Selector Pills */}
        <div className="symbol-pills">
          {symbols.map((sym) => (
            <button
              key={sym}
              onClick={() => setActiveSymbol(sym)}
              className={`symbol-pill font-display ${activeSymbol === sym ? "active" : ""}`}
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Live Ticker Metric Badge (Updates every 5s from Zustand) */}
        <div className="live-ticker-badge">
          <span className="live-dot" />
          <span className="ticker-sym font-display">{activeSymbol}</span>
          <span className="ticker-price tabular-nums font-mono">${formatPrice(markPrice)}</span>
          <span className={`ticker-change tabular-nums font-mono ${pnlClass}`}>
            {formatPercent(change24h)}
          </span>
        </div>
      </div>

      <style>{`
        .dashboard-header-bar {
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        .header-ticker-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .symbol-pills {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--color-bg-surface);
          padding: 3px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
        }

        .symbol-pill {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .symbol-pill:hover {
          color: var(--color-text-primary);
        }

        .symbol-pill.active {
          background: var(--color-brand-500);
          color: #ffffff;
        }

        .live-ticker-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--color-bg-surface);
          padding: 0.5rem 0.875rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-bullish);
          box-shadow: 0 0 8px var(--color-bullish);
          animation: pulse 2s infinite;
        }

        .ticker-sym {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .ticker-price {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .ticker-change {
          font-size: 0.75rem;
          font-weight: 600;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
