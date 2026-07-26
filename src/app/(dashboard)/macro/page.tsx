import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

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

const fallbackMacroEvents: MacroEvent[] = [
  {
    id: "evt-fomc-1",
    event_name: "FOMC Rate Decision",
    currency: "USD",
    impact: 3,
    scheduled_at: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
    forecast_value: "5.25%",
    previous_value: "5.25%",
    actual_value: "Pending",
  },
  {
    id: "evt-cpi-2",
    event_name: "US Consumer Price Index (CPI YoY)",
    currency: "USD",
    impact: 3,
    scheduled_at: new Date(Date.now() + 1 * 86400 * 1000).toISOString(),
    forecast_value: "3.0%",
    previous_value: "3.1%",
    actual_value: "3.0%",
  },
  {
    id: "evt-nfp-3",
    event_name: "Non-Farm Payrolls (NFP)",
    currency: "USD",
    impact: 3,
    scheduled_at: new Date(Date.now() + 4 * 86400 * 1000).toISOString(),
    forecast_value: "+185K",
    previous_value: "+206K",
    actual_value: "Pending",
  },
  {
    id: "evt-ecb-4",
    event_name: "ECB Rate Decision",
    currency: "EUR",
    impact: 3,
    scheduled_at: new Date(Date.now() + 6 * 86400 * 1000).toISOString(),
    forecast_value: "3.75%",
    previous_value: "4.00%",
    actual_value: "3.75%",
  },
  {
    id: "evt-ppi-5",
    event_name: "US Core Producer Price Index (PPI)",
    currency: "USD",
    impact: 2,
    scheduled_at: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    forecast_value: "+0.2%",
    previous_value: "+0.0%",
    actual_value: "Pending",
  },
  {
    id: "evt-claims-6",
    event_name: "US Initial Jobless Claims",
    currency: "USD",
    impact: 2,
    scheduled_at: new Date(Date.now() + 5 * 86400 * 1000).toISOString(),
    forecast_value: "228K",
    previous_value: "222K",
    actual_value: "225K",
  },
];

export default async function MacroPage() {
  const supabase = await createClient();

  let events: MacroEvent[] = [];

  try {
    const { data } = await (supabase
      .from("macro_events")
      .select("*")
      .order("scheduled_at", { ascending: true }) as any);

    if (data && data.length > 0) {
      events = data as MacroEvent[];
    }
  } catch {
    // Fallback if DB table not populated
  }

  if (events.length === 0) {
    events = fallbackMacroEvents;
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
                      {eventDate.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="text-right tabular-nums font-mono">
                      {evt.forecast_value || "—"}
                    </td>
                    <td className="text-right tabular-nums font-mono text-muted">
                      {evt.previous_value || "—"}
                    </td>
                    <td className="text-right tabular-nums font-mono font-semibold">
                      <span className={evt.actual_value === "Pending" ? "text-muted" : "positive"}>
                        {evt.actual_value || "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .macro-page {
          display: flex;
          flex-direction: column;
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
          font-size: 0.8125rem;
        }

        .macro-table th {
          padding: 0.75rem 1.25rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          background: var(--color-bg-surface);
          border-bottom: 1px solid var(--color-border-subtle);
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
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-xs);
          color: var(--color-brand-400);
          margin-right: 0.625rem;
        }

        .impact-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-xs);
        }

        .impact-badge--high {
          background: rgba(239, 68, 68, 0.15);
          color: var(--color-bearish);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .impact-badge--medium {
          background: rgba(245, 158, 11, 0.15);
          color: var(--color-alert-high);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .impact-badge--low {
          background: rgba(59, 130, 246, 0.15);
          color: var(--color-brand-400);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .text-right {
          text-align: right;
        }

        .text-muted {
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
