"use client";

import { useDeltaTicker, useDeltaCandles } from "@/hooks/useDeltaData";
import { useUIStore } from "@/stores/ui-store";
import { useTickerStore } from "@/stores/useTickerStore";
import { useLivePriceStream } from "@/hooks/useLivePriceStream";
import { getMarketDefinition } from "@/lib/constants/markets";
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
  // Activate 5-second dynamic price streaming hook on market detail view
  useLivePriceStream();

  const upperSymbol = symbol.toUpperCase();
  const { activeResolution, setActiveResolution } = useUIStore();
  const { data: ticker } = useDeltaTicker(upperSymbol);
  const { data: candles = [], isLoading: candlesLoading } = useDeltaCandles(
    upperSymbol,
    activeResolution
  );

  // Subscribe to Zustand store for 5-second dynamic tick updates
  const liveTicker = useTickerStore((s) => s.tickers[upperSymbol]);
  const marketDef = getMarketDefinition(upperSymbol);

  const rawMark = liveTicker?.markPrice || parseFloat(ticker?.mark_price || "0");
  const markPrice = rawMark > 0 ? rawMark : marketDef.basePrice;

  const rawChange = liveTicker?.change24hPct ?? (ticker ? (parseFloat(ticker.last_price || "0") / parseFloat(ticker.open || "1") - 1) * 100 : 0);
  const change24h = rawChange !== 0 ? rawChange : marketDef.change24hPct;
  const changeClass = getPnLClass(change24h);

  const rawVolume = liveTicker?.volume || parseFloat(ticker?.volume || "0");
  const volume24h = rawVolume > 0 ? rawVolume : marketDef.volume24hUsd;

  const high24h = ticker ? parseFloat(ticker.high || "0") : markPrice * 1.025;
  const low24h = ticker ? parseFloat(ticker.low || "0") : markPrice * 0.975;
  const openInterest = ticker ? parseFloat(ticker.open_interest || "0") : volume24h * 0.35;
  const fundingRate = ticker ? parseFloat(ticker.funding_rate || "0") : 0.0001;

  return (
    <div className="market-detail">
      {/* ── Compact single-line header bar ── */}
      <div className="market-header card">
        {/* Left: symbol + live dot */}
        <div className="mh-symbol-group">
          <h1 className="mh-symbol font-display">{upperSymbol}</h1>
          <div className="live-dot" title="Live 5s Feed" />
        </div>

        {/* Divider */}
        <div className="mh-divider" />

        {/* Price + change */}
        <div className="mh-price-group">
          <span className="mh-price tabular-nums font-mono">
            ${formatPrice(markPrice)}
          </span>
          <span className={`mh-change tabular-nums font-mono ${changeClass}`}>
            {formatPercent(change24h)}
          </span>
        </div>

        {/* Divider */}
        <div className="mh-divider" />

        {/* All 6 stats in a row */}
        <div className="mh-stats">
          {[
            { label: "Mark Price", value: `$${formatPrice(markPrice)}` },
            { label: "24h High", value: `$${formatPrice(high24h)}` },
            { label: "24h Low", value: `$${formatPrice(low24h)}` },
            { label: "Volume", value: `$${formatCompact(volume24h)}` },
            { label: "Open Interest", value: `$${formatCompact(openInterest)}` },
            {
              label: "Funding Rate",
              value: (
                <span className={fundingRate >= 0 ? "positive" : "negative"}>
                  {(fundingRate * 100).toFixed(4)}%
                </span>
              ),
            },
          ].map(({ label, value }) => (
            <div key={label} className="mh-stat">
              <span className="mh-stat-label">{label}</span>
              <span className="mh-stat-value tabular-nums font-mono">{value}</span>
            </div>
          ))}
        </div>
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
                className={`resolution-pill font-display ${activeResolution === value ? "resolution-pill--active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          {candlesLoading && (
            <span className="chart-loading-text">Loading candles...</span>
          )}
        </div>
        <CandlestickChart candles={candles} height={580} symbol={upperSymbol} livePrice={markPrice} resolution={activeResolution} />
        <VolumePane candles={candles} height={100} />
      </div>

      <style>{`
        .market-detail {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* ── Single-line header ── */
        .market-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 1rem;
          padding: 0.625rem 1.25rem;
          flex-wrap: nowrap;
          overflow-x: auto;
          white-space: nowrap;
        }

        .mh-symbol-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-bullish);
          box-shadow: 0 0 8px var(--color-bullish);
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }

        .mh-symbol {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .mh-divider {
          width: 1px;
          height: 28px;
          background: var(--color-border-subtle);
          flex-shrink: 0;
        }

        .mh-price-group {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .mh-price {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.025em;
        }

        .mh-change {
          font-size: 0.8125rem;
          font-weight: 600;
        }

        /* 6 stats in a row */
        .mh-stats {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex: 1;
        }

        .mh-stat {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          flex-shrink: 0;
        }

        .mh-stat-label {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          line-height: 1;
        }

        .mh-stat-value {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        /* ── Chart card ── */
        .market-chart-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chart-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .resolution-pills {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--color-bg-surface);
          padding: 3px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
        }

        .resolution-pill {
          padding: 0.3rem 0.625rem;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .resolution-pill:hover {
          color: var(--color-text-primary);
        }

        .resolution-pill--active {
          background: var(--color-brand-500);
          color: #ffffff;
        }

        .chart-loading-text {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        @media (max-width: 1024px) {
          .market-header {
            flex-wrap: wrap;
          }
          .mh-stats {
            flex-wrap: wrap;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
