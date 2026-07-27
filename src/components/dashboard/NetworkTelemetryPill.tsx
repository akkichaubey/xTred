"use client";

import { useTelemetryStore } from "@/stores/telemetry-store";
import { useTradingStore } from "@/stores/trading-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useLiveTradingData } from "@/hooks/useLiveTradingData";
import { Wifi, WifiOff, Activity, Clock, RefreshCw, Circle } from "lucide-react";

export function NetworkTelemetryPill() {
  const { wsConnected, restStatus, restLatencyMs, lastSyncedAt, isTabVisible } = useTelemetryStore();
  const { tradingMode } = useTradingStore();
  const { refreshInterval } = useSettingsStore();

  // Only show telemetry in Live Trading mode
  if (tradingMode !== "live") return null;

  const wsColor = wsConnected
    ? "var(--color-bullish)"
    : "var(--color-bearish)";

  const restColor =
    restStatus === "ok"
      ? "var(--color-bullish)"
      : restStatus === "syncing"
      ? "var(--color-warning, #f59e0b)"
      : restStatus === "paused"
      ? "var(--color-text-muted)"
      : "var(--color-bearish)";

  const restLabel =
    restStatus === "ok"
      ? `${restLatencyMs}ms`
      : restStatus === "syncing"
      ? "Syncing…"
      : restStatus === "paused"
      ? "Paused"
      : "Error";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "0.375rem 0.75rem",
        fontSize: "0.6875rem",
        fontFamily: "var(--font-mono, monospace)",
        flexWrap: "wrap",
      }}
    >
      {/* WebSocket Status */}
      <div
        title={wsConnected ? "WebSocket Connected" : "WebSocket Disconnected"}
        style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: wsColor }}
      >
        {wsConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
        <span style={{ fontWeight: 700 }}>WS</span>
        <Circle
          size={6}
          fill={wsColor}
          stroke="none"
          style={{
            filter: wsConnected ? `drop-shadow(0 0 3px ${wsColor})` : "none",
          }}
        />
      </div>

      <span style={{ color: "var(--color-border-subtle)" }}>|</span>

      {/* REST Latency */}
      <div
        title={`REST API Status: ${restStatus}`}
        style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: restColor }}
      >
        <Activity size={11} />
        <span style={{ fontWeight: 700 }}>REST</span>
        <span>{restLabel}</span>
      </div>

      <span style={{ color: "var(--color-border-subtle)" }}>|</span>

      {/* Last Synced */}
      <div
        title="Last data sync time"
        style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-text-muted)" }}
      >
        <Clock size={11} />
        <span>{lastSyncedAt ?? "—"}</span>
      </div>

      <span style={{ color: "var(--color-border-subtle)" }}>|</span>

      {/* Refresh Rate */}
      <div
        title={`Wallet refresh every ${refreshInterval}s`}
        style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-text-muted)" }}
      >
        <span>⏱</span>
        <span>{refreshInterval ?? 5}s</span>
      </div>

      {/* Tab Visibility Warning */}
      {!isTabVisible && (
        <>
          <span style={{ color: "var(--color-border-subtle)" }}>|</span>
          <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Paused</span>
        </>
      )}

      {/* REST Status Indicator */}
      <RefreshCw
        size={11}
        style={{
          color: "var(--color-brand-400)",
          animation: restStatus === "syncing" ? "spin 0.8s linear infinite" : "none",
          opacity: restStatus === "syncing" ? 0.7 : 0.4,
        }}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
