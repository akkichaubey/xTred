import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="card not-found-card">
        <span className="not-found-code font-display">404</span>
        <h1 className="not-found-title font-display">Page Not Found</h1>
        <p className="not-found-desc">
          The terminal page or asset you requested does not exist or has been moved.
        </p>
        <Link href="/" className="btn-home font-display">
          ← Return to Dashboard
        </Link>
      </div>

      <style>{`
        .not-found-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100dvh;
          background: var(--color-bg-base);
          padding: 1.5rem;
        }

        .not-found-card {
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
          max-width: 480px;
          border-color: var(--color-border-strong);
        }

        .not-found-code {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--color-brand-400);
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .not-found-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .not-found-desc {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .btn-home {
          margin-top: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: var(--color-brand-500);
          color: #ffffff;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 150ms ease;
        }

        .btn-home:hover {
          background: var(--color-brand-400);
        }
      `}</style>
    </div>
  );
}
