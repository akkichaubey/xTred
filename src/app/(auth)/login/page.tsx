import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your xTred trading intelligence terminal.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="login-root">
      <div className="login-bg-grid" aria-hidden="true" />
      <div className="login-bg-glow" aria-hidden="true" />

      <div className="login-container">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(59,130,246,0.15)" />
              <path
                d="M8 22L14 10L20 16L26 8"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="14" cy="10" r="2" fill="#10b981" />
              <circle cx="20" cy="16" r="2" fill="#f59e0b" />
              <circle cx="26" cy="8" r="2" fill="#ef4444" />
            </svg>
          </div>
          <h1 className="login-title">xTred</h1>
          <p className="login-subtitle">AI Trading Intelligence</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Welcome back</h2>
            <p className="login-card-description">
              Sign in to your private trading terminal
            </p>
          </div>
          <LoginForm />
        </div>

        <p className="login-footer">
          Personal trading terminal — not for public access.
        </p>
      </div>

      <style>{`
        .login-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          background: var(--color-bg-base);
        }

        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(36, 48, 68, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(36, 48, 68, 0.4) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .login-bg-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .login-logo {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 0 24px rgba(59, 130, 246, 0.15);
        }

        .login-title {
          font-family: var(--font-display);
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .login-subtitle {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          margin: 0;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .login-card {
          width: 100%;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow:
            0 4px 32px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(59, 130, 246, 0.06);
        }

        .login-card-header {
          margin-bottom: 1.75rem;
        }

        .login-card-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 0.375rem;
        }

        .login-card-description {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .login-footer {
          font-size: 0.75rem;
          color: var(--color-text-disabled);
          text-align: center;
          margin: 0;
        }
      `}</style>
    </main>
  );
}
