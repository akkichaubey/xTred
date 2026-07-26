"use client";

import { useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { AlertTriangle, ShieldCheck, Zap } from "lucide-react";

export function TradingModeSwitcher() {
  const { tradingMode, setTradingMode } = useTradingStore();
  const [showLiveConfirmModal, setShowLiveConfirmModal] = useState(false);

  const handleModeClick = (targetMode: "demo" | "live") => {
    if (targetMode === tradingMode) return;

    if (targetMode === "live") {
      setShowLiveConfirmModal(true);
    } else {
      setTradingMode("demo");
    }
  };

  const confirmSwitchToLive = () => {
    setTradingMode("live");
    setShowLiveConfirmModal(false);
  };

  return (
    <>
      {/* Mode Switcher Buttons */}
      <div className="flex items-center gap-1.5 bg-[var(--color-bg-overlay)] p-1 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)]">
        <button
          type="button"
          onClick={() => handleModeClick("demo")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold transition-all duration-200 cursor-pointer ${
            tradingMode === "demo"
              ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/40 shadow-[var(--shadow-brand-glow)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Demo Trading</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeClick("live")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold transition-all duration-200 cursor-pointer ${
            tradingMode === "live"
              ? "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)] border border-[var(--color-bearish)]/40 shadow-[var(--shadow-bearish-glow)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[var(--color-bearish)]" />
          <span>Live Trading</span>
        </button>
      </div>

      {/* Confirmation Modal before switching to Live Mode */}
      {showLiveConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="card-elevated max-w-md w-full p-6 space-y-5 border border-[var(--color-bearish)]/40">
            <div className="flex items-center gap-3 text-[var(--color-bearish)]">
              <div className="p-2.5 rounded-full bg-[var(--color-bearish-dim)] border border-[var(--color-bearish)]/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--color-text-primary)]">
                  Switch to Live Trading?
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Real order execution mode
                </p>
              </div>
            </div>

            <div className="text-xs text-[var(--color-text-secondary)] space-y-2 leading-relaxed bg-[var(--color-bg-base)] p-3.5 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
              <p className="text-[var(--color-text-primary)] font-semibold">
                ⚠️ Live Mode Safety Notice:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[var(--color-text-muted)]">
                <li>Orders will be sent directly to <strong>Delta Exchange API</strong>.</li>
                <li>Real capital and funds will be used for execution.</li>
                <li>Ensure API Key & Secret are correctly configured.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLiveConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] cursor-pointer"
              >
                Keep Demo Mode
              </button>

              <button
                type="button"
                onClick={confirmSwitchToLive}
                className="px-4 py-2 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-bearish)] text-white hover:bg-red-600 transition-colors shadow-[var(--shadow-bearish-glow)] cursor-pointer"
              >
                Confirm & Switch to Live
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
