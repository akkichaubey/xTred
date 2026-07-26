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
      {/* Header */}
      <div className="market-header card" style={{ padding: "1.25rem" }}>
        <div className="market-symbol-row">
          <h1 className="market-symbol font-display">{upperSymbol}</h1>
          <div className="live-dot" title="Live 5s Feed" />
        </div>

        {/* Price Row (Updates every 5s from Zustand) */}
        <div className="market-price-row">
          <span className="market-price tabular-nums font-mono">
            ${formatPrice(markPrice)}
          </span>
          <span className={`market-change tabular-nums font-mono ${changeClass}`}>
            {formatPercent(change24h)}
          </span>
        </div>

        {/* Stats Row */}
        <div className="market-stats">
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
            <div key={label} className="market-stat">
              <span className="market-stat-label">{label}</span>
              <span className="market-stat-value tabular-nums font-mono">{value}</span>
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
        <CandlestickChart candles={candles} height={480} symbol={upperSymbol} livePrice={markPrice} />
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
          gap: 0.75rem;
        }

        .market-symbol-row {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-bullish);
          box-shadow: 0 0 8px var(--color-bullish);
          animation: pulse 2s infinite;
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
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.03em;
        }

        .market-change {
          font-size: 1rem;
          font-weight: 600;
        }

        .market-stats {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--color-border-subtle);
        }

        .market-stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .market-stat-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .market-stat-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

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
          .market-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 640px) {
          .market-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
