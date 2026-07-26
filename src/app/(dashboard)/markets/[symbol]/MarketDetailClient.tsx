"use client";

import { useState } from "react";
import { useDeltaTicker, useDeltaCandles } from "@/hooks/useDeltaData";
import { useUIStore } from "@/stores/ui-store";
import CandlestickChart from "@/components/charts/CandlestickChart";
import VolumePane from "@/components/charts/VolumePane";
import { formatPrice, formatPercent, formatCompact, getPnLClass } from "@/lib/utils";
import type { CandleResolution } from "@/types";

const RESOLUTIONS: { label: string; value: CandleResolution }[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "1d", value: "1d" },
  { label: "1w", value: "1w" },
];

export default function MarketDetailClient({ symbol }: { symbol: string }) {
  const { activeResolution, setActiveResolution } = useUIStore();
  const { data: ticker, isLoading: tickerLoading } = useDeltaTicker(symbol);
  const { data: candles = [], isLoading: candlesLoading } = useDeltaCandles(
    symbol,
    activeResolution
  );

  const change24h = ticker ? parseFloat(ticker.last_price) / parseFloat(ticker.open) - 1 : 0;
  const changeClass = getPnLClass(change24h);

  return (
    <div className="market-detail">
      {/* Header */}
      <div className="market-header">
        <div className="market-symbol-row">
          <h1 className="market-symbol font-display">{symbol}</h1>
          <div className="live-dot" title="Live" />
        </div>

        {tickerLoading ? (
          <div className="skeleton" style={{ height: 40, width: 200 }} />
        ) : ticker ? (
          <div className="market-price-row">
            <span className="market-price tabular-nums">
              ${formatPrice(parseFloat(ticker.last_price))}
            </span>
            <span className={`market-change tabular-nums ${changeClass}`}>
              {formatPercent(change24h * 100)}
            </span>
          </div>
        ) : null}

        {/* Stats row */}
        {ticker && (
          <div className="market-stats">
            {[
              { label: "Mark Price", value: `$${formatPrice(parseFloat(ticker.mark_price))}` },
              { label: "24h High", value: `$${formatPrice(parseFloat(ticker.high))}` },
              { label: "24h Low", value: `$${formatPrice(parseFloat(ticker.low))}` },
              { label: "Volume", value: formatCompact(parseFloat(ticker.volume)) },
              {
                label: "Open Interest",
                value: formatCompact(parseFloat(ticker.open_interest)),
              },
              {
                label: "Funding Rate",
                value: (
                  <span className={parseFloat(ticker.funding_rate) >= 0 ? "positive" : "negative"}>
                    {(parseFloat(ticker.funding_rate) * 100).toFixed(4)}%
                  </span>
                ),
              },
            ].map(({ label, value }) => (
              <div key={label} className="market-stat">
                <span className="market-stat-label">{label}</span>
                <span className="market-stat-value tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="card market-chart-card">
        {/* Resolution selector */}
        <div className="chart-toolbar">
          <div className="resolution-pills">
            {RESOLUTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveResolution(value)}
                className={`resolution-pill ${activeResolution === value ? "resolution-pill--active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          {candlesLoading && (
            <span className="chart-loading-text">Loading…</span>
          )}
        </div>
        <CandlestickChart candles={candles} height={380} symbol={symbol} />
        <VolumePane candles={candles} height={100} />
      </div>

      <style>{`
        .market-detail {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .market-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .market-symbol-row {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .market-symbol {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .market-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }

        .market-price {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-mono);
          letter-spacing: -0.02em;
        }

        .market-change {
          font-size: 1rem;
          font-weight: 600;
          font-family: var(--font-mono);
        }

        .market-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .market-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0.625rem 1rem;
          border-right: 1px solid var(--color-border-subtle);
          min-width: 110px;
        }

        .market-stat:last-child { border-right: none; }

        .market-stat-label {
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .market-stat-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .market-chart-card {
          overflow: hidden;
        }

        .chart-toolbar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .resolution-pills {
          display: flex;
          gap: 2px;
        }

        .resolution-pill {
          padding: 0.3rem 0.625rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: background 120ms ease, color 120ms ease;
        }

        .resolution-pill:hover {
          background: var(--color-bg-overlay);
          color: var(--color-text-secondary);
        }

        .resolution-pill--active {
          background: rgba(59, 130, 246, 0.15);
          color: var(--color-brand-400);
        }

        .chart-loading-text {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-left: auto;
        }
      `}</style>
    </div>
  );
}
