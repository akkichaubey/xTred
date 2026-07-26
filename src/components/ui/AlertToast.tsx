"use client";

import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";

export function AlertToastContainer() {
  const { activeToast, dismissToast } = useRealtimeAlerts();

  if (!activeToast) return null;

  const severity = activeToast.severity ?? 1;
  const severityClass = severity === 3 ? "critical" : severity === 2 ? "high" : "info";

  return (
    <div className={`alert-toast alert-toast--${severityClass}`}>
      <div className="toast-header">
        <span className="toast-tag">
          ⚠ {activeToast.alert_type.replace(/_/g, " ").toUpperCase()}
        </span>
        <button onClick={dismissToast} className="toast-dismiss">
          ✕
        </button>
      </div>

      <p className="toast-message">{activeToast.message}</p>

      <style>{`
        .alert-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          width: 360px;
          max-width: calc(100vw - 3rem);
          padding: 1rem;
          border-radius: var(--radius-md);
          background: #0f172a;
          border: 1px solid var(--color-border-strong);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(59, 130, 246, 0.2);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          animation: toastSlideUp 250ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .alert-toast--critical {
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(239, 68, 68, 0.3);
        }

        .alert-toast--high {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.3);
        }

        .toast-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .toast-tag {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--color-brand-400);
        }

        .alert-toast--critical .toast-tag { color: var(--color-bearish); }
        .alert-toast--high .toast-tag { color: var(--color-alert-high); }

        .toast-dismiss {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .toast-dismiss:hover { color: var(--color-text-primary); }

        .toast-message {
          font-size: 0.8125rem;
          color: var(--color-text-primary);
          line-height: 1.45;
          margin: 0;
        }

        @keyframes toastSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
