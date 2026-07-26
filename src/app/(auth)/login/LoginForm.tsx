"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

const initialState = { error: null };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="login-form" noValidate>
      {/* Email */}
      <div className="field-group">
        <label htmlFor="login-email" className="field-label">
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          placeholder="you@example.com"
          className="field-input"
        />
      </div>

      {/* Password */}
      <div className="field-group">
        <label htmlFor="login-password" className="field-label">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          placeholder="••••••••••••"
          className="field-input"
        />
      </div>

      {/* Error message */}
      {state.error && (
        <div role="alert" className="login-error">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          {state.error}
        </div>
      )}

      {/* Submit */}
      <button
        id="login-submit"
        type="submit"
        disabled={isPending}
        className="login-btn"
      >
        {isPending ? (
          <span className="login-btn-loading">
            <span className="spinner" aria-hidden="true" />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </button>

      <style>{`
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .field-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .field-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.9375rem;
          transition: border-color 150ms ease, box-shadow 150ms ease;
          outline: none;
        }

        .field-input::placeholder {
          color: var(--color-text-disabled);
        }

        .field-input:focus {
          border-color: var(--color-brand-500);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .field-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--color-bearish);
          font-size: 0.8125rem;
        }

        .login-btn {
          width: 100%;
          padding: 0.6875rem 1rem;
          background: var(--color-brand-600);
          color: white;
          font-size: 0.9375rem;
          font-weight: 600;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease;
          margin-top: 0.25rem;
        }

        .login-btn:hover:not(:disabled) {
          background: var(--color-brand-500);
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.35);
        }

        .login-btn:active:not(:disabled) {
          transform: scale(0.99);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </form>
  );
}
