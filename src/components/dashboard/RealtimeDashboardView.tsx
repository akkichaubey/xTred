"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ProbabilityGauge } from "@/components/dashboard/ProbabilityEngine";
import SnapshotComparator from "@/components/dashboard/SnapshotComparator";
import type { AnalysisOutput } from "@/lib/ai/schemas";

interface RealtimeDashboardViewProps {
  initialAnalysis: AnalysisOutput;
}

export default function RealtimeDashboardView({ initialAnalysis }: RealtimeDashboardViewProps) {
  const [activeSymbol, setActiveSymbol] = useState("BTCUSD");

  return (
    <div className="dashboard-page">
      {/* Live Header & Ticker Switcher */}
      <DashboardHeader activeSymbol={activeSymbol} onSelectSymbol={setActiveSymbol} />

      <div className="dashboard-grid">
        {/* Live Probability Engine with Run Live AI Trigger */}
        <div className="dashboard-card-full">
          <ProbabilityGauge analysis={initialAnalysis} symbol={activeSymbol} />
        </div>

        {/* Live Retrospective Forecast Comparator */}
        <div className="dashboard-card-full">
          <SnapshotComparator />
        </div>

        {/* Phase Progress Tracker */}
        <div className="card dashboard-card">
          <div className="card-label">Phase Progress</div>
          <div className="progress-list">
            {[
              { label: "Foundations", done: true },
              { label: "Auth & Shell", done: true },
              { label: "Delta Exchange", done: true },
              { label: "Database & RLS", done: true },
              { label: "Macro / News / Flows", done: true },
              { label: "AI Engine", done: true },
              { label: "Early Warning", done: true },
              { label: "Risk & Journal", done: true },
              { label: "Realtime Dynamics", done: true },
            ].map((phase) => (
              <div key={phase.label} className="progress-item">
                <div className={`progress-dot ${phase.done ? "progress-dot--done" : ""}`} />
                <span className={phase.done ? "progress-label--done" : "progress-label"}>
                  {phase.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Stack */}
        <div className="card dashboard-card">
          <div className="card-label">Stack</div>
          <div className="stack-list">
            {[
              ["Next.js 15", "App Router"],
              ["React 19", "Server Actions"],
              ["Tailwind v4", "@theme tokens"],
              ["Supabase", "Postgres + Auth"],
              ["Gemini API", "Structured output"],
              ["Delta Exchange", "REST + WebSocket"],
              ["TanStack Query", "Server state"],
              ["Zustand", "UI state"],
            ].map(([name, detail]) => (
              <div key={name} className="stack-item">
                <span className="stack-name">{name}</span>
                <span className="stack-detail">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .dashboard-card-full {
          grid-column: span 2;
        }

        .dashboard-card {
          padding: 1.25rem;
        }

        .card-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin-bottom: 1rem;
        }

        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .progress-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-border-strong);
        }

        .progress-dot--done {
          background: var(--color-bullish);
          box-shadow: 0 0 6px var(--color-bullish);
        }

        .progress-label {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        .progress-label--done {
          font-size: 0.8125rem;
          color: var(--color-text-primary);
          font-weight: 500;
        }

        .stack-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stack-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.375rem 0;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .stack-item:last-child {
          border-bottom: none;
        }

        .stack-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .stack-detail {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-card-full {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
