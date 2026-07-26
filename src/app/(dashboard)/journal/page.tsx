import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import JournalForm from "./JournalForm";
import JournalAnalytics from "@/components/journal/JournalAnalytics";
import { formatPrice, getPnLClass } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trade Journal — xTred",
};

interface JournalEntry {
  id: string;
  symbol: string;
  direction: string | null;
  entry_price: number | null;
  exit_price: number | null;
  size: number | null;
  pnl: number | null;
  notes: string | null;
  created_at: string;
}

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let entries: JournalEntry[] = [];

  if (user) {
    const { data } = await (supabase
      .from("trade_journal")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }) as any);

    if (data) {
      entries = data as JournalEntry[];
    }
  }

  return (
    <div className="journal-page">
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
            Personal Trade Journal
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
            Record personal trades for retrospectives against AI probability snapshots
          </p>
        </div>
      </div>

      {/* Analytics Card */}
      <JournalAnalytics trades={entries} />

      {/* Form component */}
      <JournalForm />

      {/* Entries table */}
      <div className="card journal-table-card">
        <div className="card-label" style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
          Logged Trade History
        </div>

        {entries.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No personal trade entries logged yet. Click above to add your first entry.
          </div>
        ) : (
          <div className="journal-table-wrapper">
            <table className="journal-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Direction</th>
                  <th className="text-right">Entry Price</th>
                  <th className="text-right">Exit Price</th>
                  <th className="text-right">Size</th>
                  <th className="text-right">Realized PnL</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item) => {
                  const pnlVal = item.pnl ?? 0;
                  const pnlClass = getPnLClass(pnlVal);
                  const isLong = item.direction === "long";

                  return (
                    <tr key={item.id}>
                      <td className="font-display font-semibold">{item.symbol}</td>
                      <td>
                        <span className={`dir-badge dir-badge--${item.direction || "long"}`}>
                          {item.direction ? item.direction.toUpperCase() : "LONG"}
                        </span>
                      </td>
                      <td className="tabular-nums text-right font-mono">
                        ${formatPrice(item.entry_price ?? 0)}
                      </td>
                      <td className="tabular-nums text-right font-mono text-muted">
                        {item.exit_price ? `$${formatPrice(item.exit_price)}` : "—"}
                      </td>
                      <td className="tabular-nums text-right font-mono text-muted">
                        {item.size ? item.size : "—"}
                      </td>
                      <td className={`tabular-nums text-right font-mono font-semibold ${pnlClass}`}>
                        {item.pnl !== null ? (pnlVal >= 0 ? `+$${pnlVal}` : `-$${Math.abs(pnlVal)}`) : "—"}
                      </td>
                      <td className="text-muted notes-cell">
                        {item.notes || "—"}
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
        .journal-page {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .journal-table-card {
          overflow: hidden;
        }

        .journal-table-wrapper {
          overflow-x: auto;
        }

        .journal-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.8125rem;
        }

        .journal-table th {
          padding: 0.75rem 1.25rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border-subtle);
          background: var(--color-bg-surface);
        }

        .journal-table td {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--color-border-subtle);
          color: var(--color-text-primary);
        }

        .journal-table tr:last-child td {
          border-bottom: none;
        }

        .dir-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .dir-badge--long {
          background: var(--color-bullish-dim);
          color: var(--color-bullish);
        }

        .dir-badge--short {
          background: var(--color-bearish-dim);
          color: var(--color-bearish);
        }

        .notes-cell {
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .text-right { text-align: right; }
        .text-muted { color: var(--color-text-muted); }
        .font-mono { font-family: var(--font-mono); }
        .font-semibold { font-weight: 600; }
      `}</style>
    </div>
  );
}
