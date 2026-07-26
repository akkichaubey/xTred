"use client";

import { useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useLiveTradingData } from "@/hooks/useLiveTradingData";
import { cancelLiveOrderAction } from "@/app/actions/trading";
import { Trash2, History, Clock } from "lucide-react";

export function OrdersTable() {
  const { tradingMode, demoOrders, demoTrades, liveOrders, liveTrades, cancelDemoOrder } = useTradingStore();
  const { deltaApiKey, deltaApiSecret, deltaEnv } = useSettingsStore();
  const { refreshLive } = useLiveTradingData();
  const [activeTab, setActiveTab] = useState<"orders" | "history">("orders");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const isDemo = tradingMode === "demo";
  const activeOrders = isDemo ? demoOrders : liveOrders;
  const activeTrades = isDemo ? demoTrades : liveTrades;

  const handleCancelOrder = async (orderId: string) => {
    if (isDemo) {
      cancelDemoOrder(orderId);
      return;
    }

    setCancellingId(orderId);
    try {
      await cancelLiveOrderAction(orderId, {
        apiKey: deltaApiKey,
        apiSecret: deltaApiSecret,
        env: deltaEnv,
      });
      refreshLive(); // Instant account refetch after cancel
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="card p-4 space-y-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 text-xs font-bold pb-1.5 cursor-pointer border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-[var(--color-brand-500)] text-[var(--color-text-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Orders ({activeOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 text-xs font-bold pb-1.5 cursor-pointer border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-[var(--color-brand-500)] text-[var(--color-text-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Trade History ({activeTrades.length})</span>
          </button>
        </div>

        <span className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase">
          {tradingMode} Log
        </span>
      </div>

      {/* Active Orders View */}
      {activeTab === "orders" && (
        activeOrders.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-base)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
            No active open limit or stop orders.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table text-xs">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Type</th>
                  <th>Limit Price</th>
                  <th>Stop Price</th>
                  <th>Size</th>
                  <th>Leverage</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[var(--color-bg-overlay)] transition-colors">
                    <td className="font-bold text-[var(--color-text-primary)] font-mono">{ord.symbol}</td>
                    <td>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ord.side === "buy"
                            ? "bg-[var(--color-bullish-dim)] text-[var(--color-bullish)]"
                            : "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)]"
                        }`}
                      >
                        {ord.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="font-mono text-[var(--color-text-secondary)] capitalize">
                      {ord.orderType.replace("_", " ")}
                    </td>
                    <td className="font-mono text-[var(--color-text-primary)]">
                      {ord.price ? `$${ord.price}` : "-"}
                    </td>
                    <td className="font-mono text-[var(--color-text-secondary)]">
                      {ord.stopPrice ? `$${ord.stopPrice}` : "-"}
                    </td>
                    <td className="font-mono text-[var(--color-text-primary)]">{ord.size}</td>
                    <td className="font-mono text-[var(--color-brand-400)]">{ord.leverage}x</td>
                    <td>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-bg-overlay)] text-[var(--color-text-secondary)] capitalize">
                        {ord.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(ord.id)}
                        disabled={cancellingId === ord.id}
                        className="px-2 py-1 rounded text-[11px] font-semibold bg-[var(--color-bg-overlay)] hover:bg-[var(--color-bearish-dim)] text-[var(--color-text-muted)] hover:text-[var(--color-bearish)] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{cancellingId === ord.id ? "Cancelling..." : "Cancel"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Trade History View */}
      {activeTab === "history" && (
        activeTrades.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-base)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
            No completed trade executions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table text-xs">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Filled Price</th>
                  <th>Size</th>
                  <th>Fee</th>
                  <th>Realized P&L</th>
                </tr>
              </thead>
              <tbody>
                {activeTrades.map((trd) => {
                  const timestampStr = trd.executedAt || trd.timestamp;
                  const dateObj = timestampStr ? new Date(timestampStr) : new Date();
                  const pnl = trd.realizedPnL ?? 0;

                  return (
                    <tr key={trd.id} className="hover:bg-[var(--color-bg-overlay)] transition-colors">
                      <td className="font-mono text-[10px] text-[var(--color-text-muted)]">
                        {dateObj.toLocaleTimeString()}
                      </td>
                      <td className="font-bold text-[var(--color-text-primary)] font-mono">{trd.symbol}</td>
                      <td>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            trd.side === "buy"
                              ? "bg-[var(--color-bullish-dim)] text-[var(--color-bullish)]"
                              : "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)]"
                          }`}
                        >
                          {trd.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="font-mono text-[var(--color-text-primary)]">
                        ${trd.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-mono text-[var(--color-text-secondary)]">{trd.size}</td>
                      <td className="font-mono text-[var(--color-text-muted)]">${trd.fee.toFixed(4)}</td>
                      <td className="font-mono font-bold">
                        <span
                          className={
                            pnl >= 0
                              ? "text-[var(--color-bullish)]"
                              : "text-[var(--color-bearish)]"
                          }
                        >
                          {pnl >= 0 ? "+" : ""}
                          ${pnl.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
