"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ margin: 0, padding: 0, background: "#0b0f17", color: "#f8fafc" }}>
        <div className="error-container">
          <div className="error-card">
            <span className="error-icon">⚠</span>
            <h1 className="error-title">System Execution Error</h1>
            <p className="error-desc">
              {error?.message || "An unexpected error occurred during client execution."}
            </p>
            <button onClick={() => reset()} className="btn-reset">
              ↻ Retry Execution
            </button>
          </div>
        </div>

        <style>{`
          .error-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1.5rem;
            font-family: system-ui, -apple-system, sans-serif;
          }

          .error-card {
            background: #151d2a;
            border: 1px solid #28364c;
            border-radius: 12px;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1rem;
            max-width: 440px;
          }

          .error-icon {
            font-size: 2rem;
            color: #ef4444;
          }

          .error-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0;
          }

          .error-desc {
            font-size: 0.875rem;
            color: #94a3b8;
            line-height: 1.5;
            margin: 0;
          }

          .btn-reset {
            margin-top: 0.5rem;
            padding: 0.625rem 1.25rem;
            background: #3b82f6;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
          }

          .btn-reset:hover {
            background: #60a5fa;
          }
        `}</style>
      </body>
    </html>
  );
}
