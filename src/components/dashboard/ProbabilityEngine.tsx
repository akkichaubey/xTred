"use client";

import { cn } from "@/lib/utils";
import type { AnalysisOutput } from "@/lib/ai/schemas";

interface ProbabilityGaugeProps {
  analysis: AnalysisOutput;
  isLoading?: boolean;
}

export function ProbabilityGauge({ analysis, isLoading }: ProbabilityGaugeProps) {
  if (isLoading) {
    return (
      <div className="prob-gauge card">
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    );
  }

  const { probabilities, confidence, risk_score } = analysis;
  const isLowConfidence = confidence <= 2;

  return (
    <div className={cn("prob-gauge card", isLowConfidence && "prob-gauge--low-confidence")}>
      <div className="prob-gauge-header">
        <span className="prob-gauge-title">Probability Engine</span>
        {isLowConfidence && (
          <span className="low-confidence-badge">⚠ Low Confidence</span>
        )}
      </div>

      {/* Probability bars */}
      <div className="prob-bars">
        <div className="prob-bar-row">
          <span className="prob-label positive">Bullish</span>
          <div className="prob-bar-track-single">
            <div
              className="prob-fill prob-fill--bullish"
              style={{ width: `${probabilities.bullish}%` }}
            />
          </div>
          <span className="prob-value tabular-nums positive">{probabilities.bullish}%</span>
        </div>
        <div className="prob-bar-row">
          <span className="prob-label neutral">Sideways</span>
          <div className="prob-bar-track-single">
            <div
              className="prob-fill prob-fill--sideways"
              style={{ width: `${probabilities.sideways}%` }}
            />
          </div>
          <span className="prob-value tabular-nums neutral">{probabilities.sideways}%</span>
        </div>
        <div className="prob-bar-row">
          <span className="prob-label negative">Bearish</span>
          <div className="prob-bar-track-single">
            <div
              className="prob-fill prob-fill--bearish"
              style={{ width: `${probabilities.bearish}%` }}
            />
          </div>
          <span className="prob-value tabular-nums negative">{probabilities.bearish}%</span>
        </div>
      </div>

      {/* Confidence + Risk row */}
      <div className="prob-meta">
        <ConfidenceStars value={confidence} />
        <RiskScoreBadge score={risk_score} />
      </div>

      {/* Conclusion */}
      <p className={cn("prob-conclusion", isLowConfidence && "prob-conclusion--dim")}>
        {analysis.conclusion}
      </p>

      <style>{`
        .prob-gauge {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prob-gauge--low-confidence {
          opacity: 0.8;
          border-color: var(--color-sideways-dim);
        }

        .prob-gauge-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .prob-gauge-title {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .low-confidence-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          background: var(--color-sideways-dim);
          color: var(--color-sideways);
          border-radius: var(--radius-full);
        }

        .prob-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .prob-bar-row {
          display: grid;
          grid-template-columns: 60px 1fr 44px;
          align-items: center;
          gap: 0.625rem;
        }

        .prob-label {
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .prob-bar-track-single {
          height: 6px;
          background: var(--color-bg-overlay);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .prob-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .prob-fill--bullish { background: var(--color-bullish); }
        .prob-fill--sideways { background: var(--color-sideways); }
        .prob-fill--bearish { background: var(--color-bearish); }

        .prob-value {
          font-size: 0.8125rem;
          font-weight: 700;
          text-align: right;
        }

        .prob-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.25rem;
          border-top: 1px solid var(--color-border-subtle);
        }

        .prob-conclusion {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .prob-conclusion--dim {
          color: var(--color-text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

// ─── Confidence Stars ─────────────────────────────────────────────────────────

export function ConfidenceStars({ value }: { value: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="conf-stars" title={`Confidence ${value}/5`} aria-label={`${value} out of 5 stars confidence`}>
      <span className="conf-label">Confidence</span>
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={i <= value ? "var(--color-star-filled)" : "var(--color-star-empty)"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="conf-value tabular-nums">{value}/5</span>

      <style>{`
        .conf-stars {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .conf-label {
          font-size: 0.6875rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }
        .stars-row {
          display: flex;
          gap: 1px;
        }
        .conf-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-star-filled);
        }
      `}</style>
    </div>
  );
}

// ─── Risk Score Badge ─────────────────────────────────────────────────────────

export function RiskScoreBadge({ score }: { score: number }) {
  const level = score >= 81 ? "critical" : score >= 61 ? "high" : score >= 31 ? "medium" : "low";
  const colors: Record<string, string> = {
    low: "var(--color-bullish)",
    medium: "var(--color-sideways)",
    high: "var(--color-alert-high)",
    critical: "var(--color-bearish)",
  };
  const labels: Record<string, string> = {
    low: "Low Risk",
    medium: "Moderate Risk",
    high: "Elevated Risk",
    critical: "High Risk",
  };

  return (
    <div className="risk-badge" title={`Risk score: ${score}/100`}>
      <span className="risk-label">Risk</span>
      <span
        className="risk-score tabular-nums"
        style={{ color: colors[level] }}
      >
        {Math.round(score)}
      </span>
      <span className="risk-level" style={{ color: colors[level] }}>
        {labels[level]}
      </span>

      <style>{`
        .risk-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .risk-label {
          font-size: 0.6875rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }
        .risk-score {
          font-size: 0.875rem;
          font-weight: 700;
        }
        .risk-level {
          font-size: 0.6875rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
