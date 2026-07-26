"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MARKET_REGISTRY } from "@/lib/constants/markets";
import { useTickerStore } from "@/stores/useTickerStore";
import { useLivePriceStream } from "@/hooks/useLivePriceStream";
import { formatPrice, formatPercent, formatCompact, getPnLClass } from "@/lib/utils";

export default function MarketsOverviewClient() {
  useLivePriceStream();

  const [category, setCategory] = useState<"all" | "crypto" | "commodity" | "fx">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const tickers = useTickerStore((s) => s.tickers);

  const markets = Object.values(MARKET_REGISTRY);

  const filteredMarkets = useMemo(() => {
    return markets.filter((m) => {
      const matchesCategory = category === "all" || m.category === category;
      const matchesSearch =
        !searchQuery ||
        m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [markets, category, searchQuery]);

  return (
    <div className="markets-overview-page">
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
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
            Markets Overview
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
            Real-time market prices, volume metrics, and technical analysis links
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar card">
        <div className="category-tabs">
          {(["all", "crypto", "commodity", "fx"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`cat-tab font-display ${category === cat ? "active" : ""}`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets..."
            className="search-input font-display"
          />
        </div>
      </div>

      {/* Markets Grid */}
      <div className="markets-grid">
        {filteredMarkets.map((m) => {
          const liveTicker = tickers[m.symbol];
          const price = liveTicker?.markPrice || m.basePrice;
          const change = liveTicker?.change24hPct || m.change24hPct;
          const volume = liveTicker?.volume || m.volume24hUsd;
          const pnlClass = getPnLClass(change);

          return (
            <div key={m.symbol} className="card market-card">
              <div className="card-top">
                <div>
                  <h3 className="market-symbol font-display">{m.symbol}</h3>
                  <span className="market-fullname">{m.name}</span>
                </div>
                <span className="category-badge">{m.category}</span>
              </div>

              <div className="card-metrics">
                <div>
                  <span className="metric-label">Mark Price</span>
                  <span className="metric-value tabular-nums font-mono">
                    ${formatPrice(price)}
                  </span>
                </div>

                <div>
                  <span className="metric-label">24h Change</span>
                  <span className={`metric-value tabular-nums font-mono ${pnlClass}`}>
                    {formatPercent(change)}
                  </span>
                </div>

                <div>
                  <span className="metric-label">24h Volume</span>
                  <span className="metric-value tabular-nums font-mono">
                    ${formatCompact(volume)}
                  </span>
                </div>
              </div>

              <Link href={`/markets/${m.symbol}`} className="btn-analyze font-display">
                Open Technical Chart & AI →
              </Link>
            </div>
          );
        })}
      </div>

      <style>{`
        .markets-overview-page {
          display: flex;
          flex-direction: column;
        }

        .filter-bar {
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .category-tabs {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--color-bg-surface);
          padding: 3px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
        }

        .cat-tab {
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

        .cat-tab:hover {
          color: var(--color-text-primary);
        }

        .cat-tab.active {
          background: var(--color-brand-500);
          color: #ffffff;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 240px;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        .search-input {
          width: 100%;
          padding: 0.45rem 0.75rem 0.45rem 2.25rem;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.8125rem;
          outline: none;
        }

        .search-input:focus {
          border-color: var(--color-brand-400);
        }

        .markets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .market-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 150ms ease, border-color 150ms ease;
        }

        .market-card:hover {
          border-color: var(--color-brand-400);
          transform: translateY(-2px);
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .market-symbol {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 0.15rem;
        }

        .market-fullname {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .category-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 0.15rem 0.4rem;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-xs);
          color: var(--color-text-muted);
        }

        .card-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          padding: 0.75rem 0;
          border-top: 1px solid var(--color-border-subtle);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .metric-label {
          display: block;
          font-size: 0.6875rem;
          color: var(--color-text-muted);
          margin-bottom: 0.25rem;
        }

        .metric-value {
          display: block;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .btn-analyze {
          display: block;
          text-align: center;
          padding: 0.5rem;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid var(--color-brand-400);
          color: var(--color-brand-400);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 150ms ease;
        }

        .btn-analyze:hover {
          background: var(--color-brand-500);
          color: #ffffff;
        }

        @media (max-width: 1024px) {
          .markets-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .markets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
