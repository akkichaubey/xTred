import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatTimeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Macro Engine — xTred",
};

interface MacroEvent {
  id: string;
  event_name: string;
  scheduled_at: string;
  actual_value: string | null;
  forecast_value: string | null;
  previous_value: string | null;
  impact: number | null;
  currency: string;
}

export default async function MacroPage() {
  const supabase = await createClient();

  let events: MacroEvent[] = [];

  try {
    const { data } = await (supabase
      .from("macro_events")
      .select("*")
      .order("scheduled_at", { ascending: true }) as any);

    if (data) {
      events = data as MacroEvent[];
    }
  } catch {
    // Fallback if not yet seeded
  }

  return (
    <div className="macro-page">
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
            Macro Economic Calendar
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
            Global monetary policy, inflation metrics (CPI/PPI), and economic release schedule
          </p>
        </div>
      </div>

      <div className="card macro-events-card">
        <div className="card-label" style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
          Economic Releases & Policy Events
        </div>

        {events.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No upcoming macro events currently scheduled in database. Run poll-macro cron to refresh.
          </div>
        ) : (
          <div className="macro-table-wrapper">
            <table className="macro-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Impact</th>
                  <th>Scheduled</th>
                  <th className="text-right">Forecast</th>
                  <th className="text-right">Previous</th>
                  <th className="text-right">Actual</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const impactScore = evt.impact ?? 1;
                  const impactClass = impactScore === 3 ? "high" : impactScore === 2 ? "medium" : "low";
                  const impactLabel = impactScore === 3 ? "HIGH" : impactScore === 2 ? "MED" : "LOW";
                  const eventDate = new Date(evt.scheduled_at);

                  return (
                    <tr key={evt.id}>
                      <td className="font-display font-semibold">
                        <span className="currency-tag">{evt.currency || "USD"}</span>
                        {evt.event_name}
                      </td>
                      <td>
                        <span className={`impact-badge impact-badge--${impactClass}`}>
                          {impactLabel}
                        </span>
                      </td>
                      <td className="tabular-nums text-muted" title={eventDate.toLocaleString()}>
                        {eventDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="tabular-nums text-right">
                        {evt.forecast_value || "—"}
                      </td>
                      <td className="tabular-nums text-right text-muted">
                        {evt.previous_value || "—"}
                      </td>
                      <td className="tabular-nums text-right font-semibold">
                        {evt.actual_value || "—"}
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
        .macro-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .macro-events-card {
          overflow: hidden;
        }

        .macro-table-wrapper {
          overflow-x: auto;
        }

        .macro-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.8125rem;
        }

        .macro-table th {
          padding: 0.75rem 1.25rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border-subtle);
          background: var(--color-bg-surface);
        }

        .macro-table td {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--color-border-subtle);
          color: var(--color-text-primary);
        }

        .macro-table tr:last-child td {
          border-bottom: none;
        }

        .currency-tag {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.15rem 0.35rem;
          background: var(--color-bg-overlay);
          border-radius: var(--radius-sm);
          color: var(--color-brand-400);
          margin-right: 0.5rem;
        }

        .impact-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .impact-badge--high {
          background: rgba(239, 68, 68, 0.2);
          color: var(--color-bearish);
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .impact-badge--medium {
          background: rgba(245, 158, 11, 0.2);
          color: var(--color-alert-high);
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .impact-badge--low {
          background: var(--color-bg-overlay);
          color: var(--color-text-muted);
        }

        .text-right { text-align: right; }
        .text-muted { color: var(--color-text-muted); }
        .font-semibold { font-weight: 600; }
      `}</style>
    </div>
  );
}
