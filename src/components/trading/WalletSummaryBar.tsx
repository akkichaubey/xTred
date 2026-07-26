"use client";

import { useTradingStore } from "@/stores/trading-store";
import { RefreshCw, ShieldCheck, Wallet, Zap } from "lucide-react";

export function WalletSummaryBar() {
  const { tradingMode, demoWallet, liveWallet, resetDemoWallet } = useTradingStore();

  const wallet = tradingMode === "demo" ? demoWallet : liveWallet || demoWallet;
  const isDemo = tradingMode === "demo";

  const pnlColorClass =
    wallet.unrealizedPnL > 0
      ? "text-[var(--color-bullish)]"
      : wallet.unrealizedPnL < 0
      ? "text-[var(--color-bearish)]"
      : "text-[var(--color-text-secondary)]";

  return (
    <div className="card p-3 flex flex-wrap items-center justify-between gap-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
      {/* Mode Badge & Wallet Indicator */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-[var(--radius-md)] ${
            isDemo
              ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30"
              : "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)] border border-[var(--color-bearish)]/30"
          }`}
        >
          <Wallet className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {isDemo ? "Virtual Demo Wallet" : "Live Delta Exchange Wallet"}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isDemo
                  ? "bg-[var(--color-brand-500)]/20 text-[var(--color-brand-400)]"
                  : "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)]"
              }`}
            >
              {isDemo ? <ShieldCheck className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
              {tradingMode}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {isDemo ? "Simulated Execution (Delta WS Prices)" : "Authenticated REST API Execution"}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-6 text-xs tabular-nums">
        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] block uppercase tracking-wider">
            Total Equity
          </span>
          <span className="font-mono font-bold text-sm text-[var(--color-text-primary)]">
            ${wallet.equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-7 w-px bg-[var(--color-border-subtle)]" />

        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] block uppercase tracking-wider">
            Available Margin
          </span>
          <span className="font-mono font-semibold text-[var(--color-text-primary)]">
            ${wallet.availableMargin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-7 w-px bg-[var(--color-border-subtle)]" />

        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] block uppercase tracking-wider">
            Used Margin
          </span>
          <span className="font-mono font-semibold text-[var(--color-text-secondary)]">
            ${wallet.usedMargin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-7 w-px bg-[var(--color-border-subtle)]" />

        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] block uppercase tracking-wider">
            Unrealized P&L
          </span>
          <span className={`font-mono font-bold ${pnlColorClass}`}>
            {wallet.unrealizedPnL >= 0 ? "+" : ""}
            ${wallet.unrealizedPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-7 w-px bg-[var(--color-border-subtle)]" />

        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] block uppercase tracking-wider">
            Realized P&L
          </span>
          <span
            className={`font-mono font-semibold ${
              wallet.realizedPnL >= 0 ? "text-[var(--color-bullish)]" : "text-[var(--color-bearish)]"
            }`}
          >
            {wallet.realizedPnL >= 0 ? "+" : ""}
            ${wallet.realizedPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Reset Demo Wallet Action */}
      {isDemo && (
        <button
          type="button"
          onClick={resetDemoWallet}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-[11px] font-medium bg-[var(--color-bg-overlay)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] transition-colors cursor-pointer"
          title="Reset virtual equity to $100,000"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Wallet</span>
        </button>
      )}
    </div>
  );
}
