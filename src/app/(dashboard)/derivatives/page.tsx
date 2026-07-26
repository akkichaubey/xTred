import type { Metadata } from "next";
import { getAllTickers } from "@/lib/delta/client";
import { MARKET_REGISTRY } from "@/lib/constants/markets";
import { formatPrice, formatCompact, formatPercent, getPnLClass } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Derivatives Engine — xTred",
};

export default async function DerivativesPage() {
  let tickers: any[] = [];

  try {
    tickers = await getAllTickers();
  } catch (err) {
    console.warn("[DerivativesPage] Delta API notice:", err);
  }

  // Fallback to Market Registry definitions if API unreachable
  if (tickers.length === 0) {
    tickers = Object.values(MARKET_REGISTRY).map((m) => ({
      symbol: m.symbol,
      mark_price: m.basePrice.toString(),
      close: m.basePrice.toString(),
      open: (m.basePrice / (1 + m.change24hPct / 100)).toString(),
      open_interest: (m.volume24hUsd * 0.4).toString(),
      volume: m.volume24hUsd.toString(),
      funding_rate: "0.0001",
    }));
  }

  // Sort tickers by Open Interest descending
  const sortedByOI = [...tickers].sort(
    (a, b) => parseFloat(b.open_interest || b.oi || "0") - parseFloat(a.open_interest || a.oi || "0")
  );

  const avgFunding =
    sortedByOI.reduce((sum, item) => sum + parseFloat(item.funding_rate || "0"), 0) /
    (sortedByOI.length || 1);
  const avgFundingPct = (avgFunding * 100).toFixed(4);

  return (
    <div className="derivatives-page">
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
            Derivatives Intelligence
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
            Open Interest ranking, Funding Rate squeeze zones, and Delta Exchange perpetuals metrics
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="derivatives-stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Active Perpetual Contracts</span>
          <span className="stat-value tabular-nums">{tickers.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Top OI Contract</span>
          <span className="stat-value tabular-nums">{sortedByOI[0]?.symbol || "—"}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Avg Funding Rate</span>
          <span className="stat-value tabular-nums positive">+{avgFundingPct}%</span>
        </div>
      </div>

      {/* Main Open Interest & Funding Rate Table */}
      <div className="card derivatives-table-card">
        <div className="card-label" style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
          Perpetual Futures Depth (Delta Exchange)
        </div>

        <div className="derivatives-table-wrapper">
          <table className="derivatives-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right">Mark Price</th>
                <th className="text-right">24h Change</th>
                <th className="text-right">24h Volume</th>
                <th className="text-right">Open Interest</th>
                <th className="text-right">Funding Rate (8h)</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedByOI.map((item) => {
                const markPrice = parseFloat(item.mark_price || "0");
                const closePrice = parseFloat(item.close || item.last_price || "0");
                const openPrice = parseFloat(item.open || "0");
                const change24h = openPrice > 0 ? (closePrice - openPrice) / openPrice : 0;
                const changeClass = getPnLClass(change24h);

                const funding = parseFloat(item.funding_rate || "0");
                const fundingPct = (funding * 100).toFixed(4);
                const isFundingExtreme = Math.abs(funding) > 0.0005; // >0.05% per 8h

                const oi = parseFloat(item.open_interest || item.oi || "0");
                const volume = parseFloat(item.volume || "0");

                return (
                  <tr key={item.symbol}>
                    <td>
                      <span className="symbol-cell font-display">{item.symbol}</span>
                    </td>
                    <td className="text-right tabular-nums font-mono">
                      ${formatPrice(markPrice)}
                    </td>
                    <td className={`text-right tabular-nums font-mono ${changeClass}`}>
                      {formatPercent(change24h * 100)}
                    </td>
                    <td className="text-right tabular-nums font-mono">
                      ${formatCompact(volume)}
                    </td>
                    <td className="text-right tabular-nums font-mono">
                      ${formatCompact(oi)}
                    </td>
                    <td className="text-right tabular-nums font-mono">
                      <span
                        className={
                          isFundingExtreme
                            ? funding > 0
                              ? "funding-extreme-positive"
                              : "funding-extreme-negative"
                            : "funding-normal"
                        }
                      >
                        {funding >= 0 ? `+${fundingPct}%` : `${fundingPct}%`}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/markets/${item.symbol}`}
                        className="btn-analyse-link font-display"
                      >
                        Analyze →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .derivatives-page {
          display: flex;
          flex-direction: column;
        }

        .derivatives-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-mono);
        }

        .derivatives-table-card {
          overflow: hidden;
        }

        .derivatives-table-wrapper {
          overflow-x: auto;
        }

        .derivatives-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        .derivatives-table th {
          padding: 0.75rem 1.25rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          background: var(--color-bg-surface);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .derivatives-table td {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--color-border-subtle);
          color: var(--color-text-primary);
        }

        .derivatives-table tr:last-child td {
          border-bottom: none;
        }

        .symbol-cell {
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .text-right {
          text-align: right;
        }

        .funding-extreme-positive {
          color: var(--color-bearish);
          font-weight: 700;
          background: rgba(239, 68, 68, 0.15);
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-xs);
        }

        .funding-extreme-negative {
          color: var(--color-bullish);
          font-weight: 700;
          background: rgba(16, 185, 129, 0.15);
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-xs);
        }

        .funding-normal {
          color: var(--color-text-secondary);
        }

        .btn-analyse-link {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-brand-400);
          text-decoration: none;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-xs);
          background: rgba(59, 130, 246, 0.1);
          transition: all 150ms ease;
        }

        .btn-analyse-link:hover {
          background: rgba(59, 130, 246, 0.25);
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .derivatives-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
