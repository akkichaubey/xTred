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
import { useLiveTradingData } from "@/hooks/useLiveTradingData";
import { useTradingStore } from "@/stores/trading-store";
import type { AnalysisOutput } from "@/lib/ai/schemas";
import { AlertCircle, RefreshCw } from "lucide-react";

interface RealtimeDashboardViewProps {
  initialAnalysis: AnalysisOutput;
}

export default function RealtimeDashboardView({ initialAnalysis }: RealtimeDashboardViewProps) {
  // Activate dynamic price stream from Delta Exchange
  useLivePriceStream();

  // Sync Live Delta Exchange account data (balance, positions, orders) when Live Trading mode is active
  const { liveError, isLoadingLive, refreshLive } = useLiveTradingData();

  const activeSymbol = useTickerStore((s) => s.activeSymbol);
  const tradingMode = useTradingStore((s) => s.tradingMode);

  return (
    <div className="dashboard-page space-y-6">
      {/* Live Header & Ticker Switcher & Mode Switcher */}
      <DashboardHeader />

      {/* Live Trading Mode Warning / Error Banner if Delta API fails */}
      {tradingMode === "live" && liveError && (
        <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-bearish-dim)] border border-[var(--color-bearish)]/40 flex items-center justify-between gap-3 text-xs text-[var(--color-bearish)] animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold block text-[var(--color-text-primary)]">
                Live Delta Exchange Connection Alert:
              </span>
              <span>{liveError}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshLive}
            disabled={isLoadingLive}
            className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-bearish)] text-white font-semibold flex items-center gap-1.5 hover:bg-red-600 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? "animate-spin" : ""}`} />
            <span>Retry Sync</span>
          </button>
        </div>
      )}

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
