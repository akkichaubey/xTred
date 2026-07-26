"use client";

import { useState, useTransition } from "react";
import { markAlertAsRead, markAllAlertsAsRead } from "./actions";
import { formatTimeAgo } from "@/lib/utils";

export interface AlertItem {
  id: string;
  symbol: string | null;
  alert_type: string;
  severity: number | null;
  message: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

interface AlertListProps {
  initialAlerts: AlertItem[];
}

export default function AlertList({ initialAlerts }: AlertListProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [isPending, startTransition] = useTransition();

  const filteredAlerts = initialAlerts.filter((a) => {
    if (filter === "unread") return !a.is_read;
    if (filter === "high") return (a.severity ?? 1) >= 2;
    return true;
  });

  const unreadCount = initialAlerts.filter((a) => !a.is_read).length;

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markAlertAsRead(id);
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAlertsAsRead();
    });
  };

  return (
    <div className="alerts-container">
      {/* Control bar */}
      <div className="alerts-controls">
        <div className="filter-pills">
          <button
            onClick={() => setFilter("all")}
            className={`filter-pill ${filter === "all" ? "filter-pill--active" : ""}`}
          >
            All ({initialAlerts.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`filter-pill ${filter === "unread" ? "filter-pill--active" : ""}`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("high")}
            className={`filter-pill ${filter === "high" ? "filter-pill--active" : ""}`}
          >
            High Volatility
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="btn-mark-all"
          >
            {isPending ? "Updating…" : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Alert list */}
      {filteredAlerts.length === 0 ? (
        <div className="card empty-alerts">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p>No alerts match the selected filter.</p>
        </div>
      ) : (
        <div className="alert-cards">
          {filteredAlerts.map((alert) => {
            const severity = alert.severity ?? 1;
            const severityClass = severity === 3 ? "critical" : severity === 2 ? "high" : "low";
            const severityLabel = severity === 3 ? "CRITICAL" : severity === 2 ? "HIGH" : "INFO";

            return (
              <div
                key={alert.id}
                className={`alert-card card ${!alert.is_read ? "alert-card--unread" : ""}`}
              >
                <div className="alert-card-header">
                  <div className="alert-badges">
                    <span className={`severity-badge severity-badge--${severityClass}`}>
                      {severityLabel}
                    </span>
                    <span className="alert-type-badge">
                      {alert.alert_type.replace(/_/g, " ")}
                    </span>
                    {alert.symbol && (
                      <span className="alert-symbol-badge">{alert.symbol}</span>
                    )}
                  </div>
                  <div className="alert-header-right">
                    <span className="alert-time tabular-nums">
                      {formatTimeAgo(alert.created_at)}
                    </span>
                    {!alert.is_read && (
                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        disabled={isPending}
                        className="btn-read-check"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>

                <p className="alert-message">{alert.message}</p>

                {alert.metadata?.triggered_signals && (
                  <div className="alert-signals-breakdown">
                    <span className="signals-title">Triggered Signals:</span>
                    <div className="signals-list">
                      {alert.metadata.triggered_signals.map((sig: any, idx: number) => (
                        <div key={idx} className="signal-tag">
                          <span className="sig-name">{sig.name.replace(/_/g, " ")}</span>
                          {sig.value && <span className="sig-val">{sig.value}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .alerts-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .alerts-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-pills {
          display: flex;
          gap: 0.375rem;
        }

        .filter-pill {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 120ms ease;
        }

        .filter-pill:hover {
          color: var(--color-text-primary);
          border-color: var(--color-border-strong);
        }

        .filter-pill--active {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
          color: var(--color-brand-400);
        }

        .btn-mark-all {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-brand-400);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .btn-mark-all:hover {
          text-decoration: underline;
        }

        .empty-alerts {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .alert-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .alert-card {
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          border-left: 3px solid var(--color-border-subtle);
          transition: border-color 150ms ease;
        }

        .alert-card--unread {
          border-left-color: var(--color-brand-500);
          background: rgba(30, 41, 59, 0.5);
        }

        .alert-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .alert-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .severity-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
          letter-spacing: 0.04em;
        }

        .severity-badge--critical {
          background: rgba(239, 68, 68, 0.2);
          color: var(--color-bearish);
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .severity-badge--high {
          background: rgba(245, 158, 11, 0.2);
          color: var(--color-alert-high);
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .severity-badge--low {
          background: var(--color-bg-overlay);
          color: var(--color-text-muted);
        }

        .alert-type-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }

        .alert-symbol-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--color-brand-400);
          font-family: var(--font-mono);
        }

        .alert-header-right {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .alert-time {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .btn-read-check {
          background: var(--color-bg-overlay);
          border: 1px solid var(--color-border-subtle);
          color: var(--color-bullish);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background 120ms ease;
        }

        .btn-read-check:hover {
          background: rgba(16, 185, 129, 0.2);
        }

        .alert-message {
          font-size: 0.875rem;
          color: var(--color-text-primary);
          line-height: 1.5;
          margin: 0;
        }

        .alert-signals-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border-subtle);
        }

        .signals-title {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }

        .signals-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }

        .signal-tag {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.2rem 0.5rem;
          background: var(--color-bg-overlay);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
        }

        .sig-name {
          color: var(--color-text-secondary);
          font-weight: 500;
          text-transform: capitalize;
        }

        .sig-val {
          color: var(--color-brand-400);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
