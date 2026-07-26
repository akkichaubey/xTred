"use client";

import { calculateJournalAnalytics, JournalTrade } from "@/lib/journal/analytics";
import { formatPercent } from "@/lib/utils";

interface JournalAnalyticsProps {
  trades: JournalTrade[];
}

export default function JournalAnalytics({ trades }: JournalAnalyticsProps) {
  const stats = calculateJournalAnalytics(trades);

  return (
    <div className="card analytics-card">
      <div className="card-label" style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
        Performance Analytics & Win Rate Matrix
      </div>

      <div className="analytics-grid">
        <div className="stat-box">
          <span className="stat-name">Win Rate</span>
          <span className={`stat-num tabular-nums ${stats.winRatePct >= 50 ? "positive" : "negative"}`}>
            {stats.winRatePct}%
          </span>
          <span className="stat-sub">{stats.winningTrades}W / {stats.losingTrades}L</span>
        </div>

        <div className="stat-box">
          <span className="stat-name">Profit Factor</span>
          <span className={`stat-num tabular-nums ${stats.profitFactor >= 1.5 ? "positive" : "neutral"}`}>
            {stats.profitFactor.toFixed(2)}
          </span>
          <span className="stat-sub">Gross Wins / Losses</span>
        </div>

        <div className="stat-box">
          <span className="stat-name">Net Realized PnL</span>
          <span className={`stat-num tabular-nums ${stats.netPnlUsd >= 0 ? "positive" : "negative"}`}>
            {stats.netPnlUsd >= 0 ? `+$${stats.netPnlUsd}` : `-$${Math.abs(stats.netPnlUsd)}`}
          </span>
          <span className="stat-sub">Cumulative Profit</span>
        </div>

        <div className="stat-box">
          <span className="stat-name">Expectancy Per Trade</span>
          <span className="stat-num tabular-nums">
            {stats.expectancyUsd >= 0 ? `+$${stats.expectancyUsd}` : `-$${Math.abs(stats.expectancyUsd)}`}
          </span>
          <span className="stat-sub">Avg PnL Per Trade</span>
        </div>
      </div>

      <style>{`
        .analytics-card {
          margin-bottom: 1.5rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          padding: 1rem 1.25rem 1.25rem;
        }

        .stat-box {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: var(--color-bg-surface);
          padding: 0.875rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-subtle);
        }

        .stat-name {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .stat-num {
          font-size: 1.375rem;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .stat-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
