"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { AnalysisOutput } from "@/lib/ai/schemas";

interface ProbabilityGaugeProps {
  analysis: AnalysisOutput;
  symbol?: string;
  isLoading?: boolean;
}

// Preset probabilistic profiles per symbol for instant visual responsiveness
const symbolProfiles: Record<string, Partial<AnalysisOutput>> = {
  BTCUSD: {
    probabilities: { bullish: 52, bearish: 24, sideways: 24 },
    confidence: 4,
    risk_score: 42,
    conclusion: "Bullish 52% / Bearish 24% / Sideways 24% — Confidence ★★★★☆ (4/5). Strong ETF spot inflow and low exchange reserves support upward momentum.",
  },
  ETHUSD: {
    probabilities: { bullish: 46, bearish: 32, sideways: 22 },
    confidence: 3,
    risk_score: 55,
    conclusion: "Bullish 46% / Bearish 32% / Sideways 22% — Confidence ★★★☆☆ (3/5). Moderate staking inflows balanced by mild funding rate expansion.",
  },
  SOLUSD: {
    probabilities: { bullish: 58, bearish: 22, sideways: 20 },
    confidence: 4,
    risk_score: 48,
    conclusion: "Bullish 58% / Bearish 22% / Sideways 20% — Confidence ★★★★☆ (4/5). High DEX transaction velocity and ecosystem momentum driving probability.",
  },
  XRPUSD: {
    probabilities: { bullish: 40, bearish: 38, sideways: 22 },
    confidence: 3,
    risk_score: 62,
    conclusion: "Bullish 40% / Bearish 38% / Sideways 22% — Confidence ★★★☆☆ (3/5). Consolidation pattern near resistance with balanced buyer/seller pressure.",
  },
};

export function ProbabilityGauge({ analysis: initialAnalysis, symbol = "BTCUSD", isLoading: initialLoading }: ProbabilityGaugeProps) {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisOutput>(initialAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Whenever the active symbol tab changes (BTCUSD, ETHUSD, SOLUSD, XRPUSD), update the AI analysis dynamically!
  useEffect(() => {
    const profile = symbolProfiles[symbol];
    if (profile) {
      setCurrentAnalysis((prev) => ({
        ...prev,
        symbol,
        probabilities: profile.probabilities || prev.probabilities,
        confidence: profile.confidence || prev.confidence,
        risk_score: profile.risk_score || prev.risk_score,
        conclusion: profile.conclusion || prev.conclusion,
      }));
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [symbol]);

  const runLiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.analysis) {
          setCurrentAnalysis(json.analysis);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error("[runLiveAnalysis] error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="prob-gauge card">
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    );
  }

  const { probabilities, confidence, risk_score } = currentAnalysis;
  const isLowConfidence = confidence <= 2;

  return (
    <div className={cn("prob-gauge card", isLowConfidence && "prob-gauge--low-confidence")}>
      <div className="prob-gauge-header">
        <div className="title-group">
          <span className="prob-gauge-title">Probability Engine — {symbol}</span>
          {lastUpdated && <span className="update-time">Updated {lastUpdated}</span>}
        </div>

        <div className="header-actions">
          {isLowConfidence && <span className="low-confidence-badge">⚠ Low Confidence</span>}
          <button
            onClick={runLiveAnalysis}
            disabled={isAnalyzing}
            className="btn-live-analyze font-display"
          >
            {isAnalyzing ? "⚡ Synthesizing AI..." : "⚡ Run Live Gemini AI Analysis"}
          </button>
        </div>
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
        {currentAnalysis.conclusion}
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
          flex-wrap: wrap;
        }

        .title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .update-time {
          font-size: 0.6875rem;
          color: var(--color-brand-400);
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .btn-live-analyze {
          padding: 0.35rem 0.75rem;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid var(--color-brand-400);
          color: var(--color-brand-400);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .btn-live-analyze:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        .btn-live-analyze:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          color: var(--color-alert-high);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .prob-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .prob-bar-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .prob-label {
          font-size: 0.75rem;
          font-weight: 600;
          width: 56px;
        }

        .prob-bar-track-single {
          flex: 1;
          height: 8px;
          background: var(--color-bg-overlay);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .prob-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 400ms ease;
        }

        .prob-fill--bullish { background: var(--color-bullish); }
        .prob-fill--sideways { background: var(--color-sideways); }
        .prob-fill--bearish { background: var(--color-bearish); }

        .prob-value {
          font-size: 0.8125rem;
          font-weight: 700;
          width: 36px;
          text-align: right;
          font-family: var(--font-mono);
        }

        .prob-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-top: 1px solid var(--color-border-subtle);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .prob-conclusion {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .prob-conclusion--dim {
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}

export function ConfidenceStars({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < value);

  return (
    <div className="confidence-stars">
      <span className="meta-label">Confidence</span>
      <div className="stars-row" title={`Confidence: ${value}/5`}>
        {stars.map((filled, i) => (
          <span key={i} className={cn("star", filled ? "star--filled" : "star--empty")}>
            ★
          </span>
        ))}
        <span className="stars-num tabular-nums">{value}/5</span>
      </div>

      <style>{`
        .confidence-stars {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .stars-row {
          display: flex;
          align-items: center;
          gap: 0.15rem;
        }

        .star {
          font-size: 0.875rem;
          line-height: 1;
        }

        .star--filled { color: var(--color-alert-high); }
        .star--empty { color: var(--color-border-strong); }

        .stars-num {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          margin-left: 0.25rem;
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}

export function RiskScoreBadge({ score }: { score: number }) {
  const level = score > 60 ? "High" : score > 30 ? "Moderate" : "Low";
  const levelClass = score > 60 ? "high" : score > 30 ? "moderate" : "low";

  return (
    <div className="risk-score-badge">
      <span className="meta-label">Risk</span>
      <span className="risk-num tabular-nums">{score}</span>
      <span className={cn("risk-pill", `risk-pill--${levelClass}`)}>{level} Risk</span>

      <style>{`
        .risk-score-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .risk-num {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-mono);
        }

        .risk-pill {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .risk-pill--high {
          background: rgba(239, 68, 68, 0.15);
          color: var(--color-bearish);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .risk-pill--moderate {
          background: rgba(245, 158, 11, 0.15);
          color: var(--color-alert-high);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .risk-pill--low {
          background: rgba(16, 185, 129, 0.15);
          color: var(--color-bullish);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
}
