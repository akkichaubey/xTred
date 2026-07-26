import type { Metadata } from "next";
import { getAllTickers } from "@/lib/delta/client";
import { formatPrice, formatCompact, formatPercent, getPnLClass } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Derivatives Engine — xTred",
};

export default async function DerivativesPage() {
  let tickers: any[] = [];

  try {
    tickers = await getAllTickers();
  } catch {
    // Fallback if network issue
  }

  // Sort tickers by Open Interest descending
  const sortedByOI = [...tickers].sort(
    (a, b) => parseFloat(b.open_interest || b.oi || "0") - parseFloat(a.open_interest || a.oi || "0")
  );

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
          <span className="stat-value tabular-nums positive">+0.0100%</span>
        </div>
      </div>

      {/* Main Open Interest & Funding Rate Table */}
      <div className="card derivatives-table-card">
        <div className="card-label" style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
          Perpetual Futures Depth (Delta Exchange)
        </div>

        {tickers.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Unable to connect to Delta Exchange REST API. Check connection or environment keys.
          </div>
        ) : (
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
                      <td className="font-display font-semibold">
                        <Link href={`/markets/${item.symbol}`} className="symbol-link">
                          {item.symbol}
                        </Link>
                      </td>
                      <td className="tabular-nums text-right font-mono font-semibold">
                        ${formatPrice(markPrice)}
                      </td>
                      <td className={`tabular-nums text-right font-mono ${changeClass}`}>
                        {formatPercent(change24h * 100)}
                      </td>
                      <td className="tabular-nums text-right font-mono text-muted">
                        {formatCompact(volume)}
                      </td>
                      <td className="tabular-nums text-right font-mono font-semibold">
                        {formatCompact(oi)}
                      </td>
                      <td className="tabular-nums text-right font-mono">
                        <span
                          className={`funding-tag ${
                            funding >= 0 ? "positive" : "negative"
                          } ${isFundingExtreme ? "funding-tag--extreme" : ""}`}
                        >
                          {funding >= 0 ? `+${fundingPct}%` : `${fundingPct}%`}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link href={`/markets/${item.symbol}`} className="btn-detail font-display">
                          Analyze →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .derivatives-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .derivatives-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
          text-align: left;
          font-size: 0.8125rem;
        }

        .derivatives-table th {
          padding: 0.75rem 1.25rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border-subtle);
          background: var(--color-bg-surface);
        }

        .derivatives-table td {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--color-border-subtle);
          color: var(--color-text-primary);
        }

        .derivatives-table tr:last-child td {
          border-bottom: none;
        }

        .symbol-link {
          color: var(--color-text-primary);
          text-decoration: none;
        }

        .symbol-link:hover {
          color: var(--color-brand-400);
        }

        .funding-tag {
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
        }

        .funding-tag--extreme {
          border: 1px solid rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.15);
        }

        .btn-detail {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-brand-400);
          text-decoration: none;
        }

        .btn-detail:hover {
          text-decoration: underline;
        }

        .text-right { text-align: right; }
        .text-muted { color: var(--color-text-muted); }
        .font-mono { font-family: var(--font-mono); }
        .font-semibold { font-weight: 600; }
      `}</style>
    </div>
  );
}
