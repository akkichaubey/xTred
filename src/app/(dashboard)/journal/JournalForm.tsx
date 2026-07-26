"use client";

import { useState, useTransition } from "react";
import { addJournalEntry } from "./actions";

export default function JournalForm() {
  const [symbol, setSymbol] = useState("BTCUSD");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [exitPrice, setExitPrice] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [pnl, setPnl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await addJournalEntry({
          symbol: symbol.toUpperCase(),
          direction,
          entry_price: parseFloat(entryPrice),
          exit_price: exitPrice ? parseFloat(exitPrice) : undefined,
          size: size ? parseFloat(size) : undefined,
          pnl: pnl ? parseFloat(pnl) : undefined,
          notes: notes.trim() || undefined,
        });

        // Reset form
        setEntryPrice("");
        setExitPrice("");
        setSize("");
        setPnl("");
        setNotes("");
        setIsOpen(false);
      } catch (err: any) {
        alert(err.message || "Failed to log trade");
      }
    });
  };

  return (
    <div className="journal-form-container">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="btn-open-form font-display">
          + Record Personal Trade Log
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card journal-card">
          <div className="card-header-row">
            <span className="card-label">Record Personal Trade Entry</span>
            <button type="button" onClick={() => setIsOpen(false)} className="btn-close">
              ✕
            </button>
          </div>

          <p className="rule-reminder">
            ℹ Note: Direction (Long/Short) is recorded by you for personal retrospectives. xTred AI never outputs Buy/Sell signals.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="input-field font-mono"
                placeholder="BTCUSD"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Direction</label>
              <div className="direction-toggle">
                <button
                  type="button"
                  onClick={() => setDirection("long")}
                  className={`dir-btn dir-btn--long ${direction === "long" ? "active" : ""}`}
                >
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("short")}
                  className={`dir-btn dir-btn--short ${direction === "short" ? "active" : ""}`}
                >
                  Short
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Entry Price ($)</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="input-field font-mono"
                placeholder="66400"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Exit Price ($)</label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="input-field font-mono"
                placeholder="67200"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Position Size</label>
              <input
                type="number"
                step="any"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="input-field font-mono"
                placeholder="1.5"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Realized PnL ($)</label>
              <input
                type="number"
                step="any"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                className="input-field font-mono"
                placeholder="+1200"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Retrospective Strategy</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Entered following DXY weakness and Probability Engine 52% bullish outlook..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-submit font-display">
              {isPending ? "Saving..." : "Save Log Entry"}
            </button>
          </div>
        </form>
      )}

      <style>{`
        .journal-form-container {
          margin-bottom: 1.5rem;
        }

        .btn-open-form {
          padding: 0.75rem 1.25rem;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: var(--color-brand-400);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .btn-open-form:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .journal-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 1rem;
        }

        .rule-reminder {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          background: var(--color-bg-overlay);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .input-field {
          padding: 0.5rem 0.75rem;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
        }

        .input-field:focus {
          border-color: var(--color-brand-400);
        }

        .direction-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.25rem;
          background: var(--color-bg-surface);
          padding: 2px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-subtle);
        }

        .dir-btn {
          padding: 0.35rem 0;
          font-size: 0.75rem;
          font-weight: 700;
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: var(--radius-xs);
        }

        .dir-btn--long.active {
          background: var(--color-bullish-dim);
          color: var(--color-bullish);
        }

        .dir-btn--short.active {
          background: var(--color-bearish-dim);
          color: var(--color-bearish);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.625rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border-subtle);
        }

        .btn-cancel {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--color-border-subtle);
          color: var(--color-text-muted);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          cursor: pointer;
        }

        .btn-submit {
          padding: 0.5rem 1rem;
          background: var(--color-brand-500);
          border: none;
          color: #ffffff;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
        }

        .font-mono { font-family: var(--font-mono); }
      `}</style>
    </div>
  );
}
