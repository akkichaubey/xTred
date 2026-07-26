"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ProbabilityGauge } from "@/components/dashboard/ProbabilityEngine";
import SnapshotComparator from "@/components/dashboard/SnapshotComparator";
import { WalletSummaryBar } from "@/components/trading/WalletSummaryBar";
import { OrderEntryPanel } from "@/components/trading/OrderEntryPanel";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { OrdersTable } from "@/components/trading/OrdersTable";
import { useTickerStore } from "@/stores/useTickerStore";
import { useLivePriceStream } from "@/hooks/useLivePriceStream";
import type { AnalysisOutput } from "@/lib/ai/schemas";

interface RealtimeDashboardViewProps {
  initialAnalysis: AnalysisOutput;
}

export default function RealtimeDashboardView({ initialAnalysis }: RealtimeDashboardViewProps) {
  // Activate dynamic price stream from Delta Exchange
  useLivePriceStream();

  const activeSymbol = useTickerStore((s) => s.activeSymbol);

  return (
    <div className="dashboard-page space-y-6">
      {/* Live Header & Ticker Switcher & Mode Switcher */}
      <DashboardHeader />

      {/* Wallet Summary Bar (Equity, Available Margin, PnL, Reset) */}
      <WalletSummaryBar />

      {/* Main Trading Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Probability Engine, Snapshots, Positions & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Probability Engine */}
          <ProbabilityGauge analysis={initialAnalysis} symbol={activeSymbol} />

          {/* Active Positions Table */}
          <PositionsTable />

          {/* Active Orders & History Table */}
          <OrdersTable />

          {/* Retrospective Forecast Snapshot Comparator */}
          <SnapshotComparator />
        </div>

        {/* Right Column: Order Entry Execution Panel & System Info */}
        <div className="space-y-6">
          {/* Unified Order Entry Panel (Demo vs Live) */}
          <OrderEntryPanel />

          {/* Phase Progress Tracker */}
          <div className="card p-4 space-y-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Platform Features & Architecture
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: "Delta Exchange WebSocket Stream", done: true },
                { label: "Dual-Mode Execution (Demo vs Live)", done: true },
                { label: "Virtual Order Engine & Margin Matching", done: true },
                { label: "Signed Server Action Order Proxy", done: true },
                { label: "Supabase Demo RLS Schema", done: true },
                { label: "Gemini AI Probability Engine", done: true },
                { label: "Order & Safety Confirmation Lock", done: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-bullish)] shadow-[0_0_6px_var(--color-bullish)]" />
                  <span className="text-[var(--color-text-primary)] font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
