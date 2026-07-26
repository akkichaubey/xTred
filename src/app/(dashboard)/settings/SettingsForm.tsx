"use client";

import { useState, useTransition } from "react";
import { updateRiskSettings } from "./actions";

interface SettingsFormProps {
  initialProfile: {
    risk_max_trade_pct: number;
    risk_max_daily_pct: number;
    risk_max_weekly_pct: number;
  };
}

export default function SettingsForm({ initialProfile }: SettingsFormProps) {
  const [tradePct, setTradePct] = useState<number>(initialProfile.risk_max_trade_pct ?? 1.0);
  const [dailyPct, setDailyPct] = useState<number>(initialProfile.risk_max_daily_pct ?? 3.0);
  const [weeklyPct, setWeeklyPct] = useState<number>(initialProfile.risk_max_weekly_pct ?? 6.0);

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await updateRiskSettings({
          risk_max_trade_pct: tradePct,
          risk_max_daily_pct: dailyPct,
          risk_max_weekly_pct: weeklyPct,
        });
        setMessage({ type: "success", text: "Risk limits updated successfully!" });
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to update risk limits" });
      }
    });
  };

  return (
    <div className="settings-form-container">
      <form onSubmit={handleSubmit} className="card settings-card">
        <div className="card-label" style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
          Section 29 Risk Management Parameters
        </div>

        {message && (
          <div className={`status-banner status-banner--${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-fields">
          <div className="form-group">
            <label htmlFor="tradePct" className="form-label">
              Max Risk Per Trade (%)
            </label>
            <div className="input-suffix-wrapper">
              <input
                id="tradePct"
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={tradePct}
                onChange={(e) => setTradePct(parseFloat(e.target.value) || 0.1)}
                className="input-field tabular-nums"
                required
              />
              <span className="input-suffix">%</span>
            </div>
            <span className="form-help">Recommended: 1.0%. Never exceed 2.5%.</span>
          </div>

          <div className="form-group">
            <label htmlFor="dailyPct" className="form-label">
              Max Daily Loss Limit (%)
            </label>
            <div className="input-suffix-wrapper">
              <input
                id="dailyPct"
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={dailyPct}
                onChange={(e) => setDailyPct(parseFloat(e.target.value) || 0.5)}
                className="input-field tabular-nums"
                required
              />
              <span className="input-suffix">%</span>
            </div>
            <span className="form-help">Breaching this triggers the stop-trading banner for 24h.</span>
          </div>

          <div className="form-group">
            <label htmlFor="weeklyPct" className="form-label">
              Max Weekly Loss Limit (%)
            </label>
            <div className="input-suffix-wrapper">
              <input
                id="weeklyPct"
                type="number"
                step="1.0"
                min="1.0"
                max="40"
                value={weeklyPct}
                onChange={(e) => setWeeklyPct(parseFloat(e.target.value) || 1.0)}
                className="input-field tabular-nums"
                required
              />
              <span className="input-suffix">%</span>
            </div>
            <span className="form-help">Breaching this halts trading for the remainder of the week.</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isPending} className="btn-save font-display">
            {isPending ? "Saving..." : "Save Risk Settings"}
          </button>
        </div>
      </form>

      <style>{`
        .settings-form-container {
          max-width: 640px;
        }

        .settings-card {
          padding-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .status-banner {
          margin: 0 1.25rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .status-banner--success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--color-bullish);
        }

        .status-banner--error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--color-bearish);
        }

        .form-fields {
          padding: 0 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .input-suffix-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-field {
          width: 100%;
          padding: 0.625rem 2.5rem 0.625rem 0.875rem;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.9375rem;
          font-family: var(--font-mono);
          outline: none;
          transition: border-color 150ms ease;
        }

        .input-field:focus {
          border-color: var(--color-brand-400);
        }

        .input-suffix {
          position: absolute;
          right: 1rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .form-help {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .form-actions {
          padding: 0 1.25rem;
          display: flex;
          justify-content: flex-end;
        }

        .btn-save {
          padding: 0.625rem 1.25rem;
          background: var(--color-brand-500);
          color: #ffffff;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .btn-save:hover {
          background: var(--color-brand-400);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
