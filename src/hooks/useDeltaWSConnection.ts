"use client";

import { useEffect } from "react";
import { getDeltaWS, DeltaChannels } from "@/lib/delta/websocket";
import { useTickerStore } from "@/stores/useTickerStore";
import { useTelemetryStore } from "@/stores/telemetry-store";
import { useSettingsStore } from "@/stores/settings-store";
import { toDeltaSymbol } from "@/lib/delta/client";
import type { DeltaWSMessage } from "@/lib/delta/types";

/**
 * useDeltaWSConnection
 *
 * Single hook that:
 * 1. Manages the shared DeltaWebSocketManager singleton lifecycle.
 * 2. Subscribes to ticker channels for all user-tracked symbols.
 * 3. Bridges WS connection state (connected/disconnected) into the Telemetry store.
 * 4. Pushes real-time ticker prices directly into useTickerStore (zero polling lag).
 * 5. Handles cleanup on unmount (no duplicate connections or memory leaks).
 */
export function useDeltaWSConnection() {
  const { customSymbols } = useTickerStore();
  const setMultipleTickers = useTickerStore((s) => s.setMultipleTickers);
  const setWsConnected = useTelemetryStore((s) => s.setWsConnected);
  const refreshInterval = useSettingsStore((s) => s.refreshInterval);

  useEffect(() => {
    const ws = getDeltaWS();

    // Connect once — duplicate connection guard is inside the manager
    ws.connect();

    // Bridge WS connection events → telemetry store
    const unsubConnection = ws.onConnectionChange((connected) => {
      setWsConnected(connected);
    });

    // Register message handler for real-time ticker updates
    const unsubMessages = ws.onMessage((msg: DeltaWSMessage) => {
      if (msg.type !== "v2/ticker" || !msg.symbol) return;

      const mark = parseFloat(msg.mark_price || msg.close || "0");
      if (!mark || mark <= 0) return;

      // Map delta symbol back to our store symbol
      const storeState = useTickerStore.getState();
      const matchedSymbol = storeState.customSymbols.find((sym) => {
        const deltaSym = toDeltaSymbol(sym);
        return msg.symbol === deltaSym || msg.symbol === sym;
      });

      if (!matchedSymbol) return;

      const open = parseFloat(msg.open || "0");
      const change24hPct = open > 0 ? ((mark - open) / open) * 100 : 0;

      setMultipleTickers([{
        symbol: matchedSymbol,
        markPrice: mark,
        change24hPct,
        volume: parseFloat(msg.volume || "0"),
      }]);
    });

    // Subscribe to ticker channels for all tracked symbols
    const subscribeToSymbols = () => {
      const symbols = useTickerStore.getState().customSymbols;
      symbols.forEach((sym) => {
        const deltaSym = toDeltaSymbol(sym);
        ws.subscribe(DeltaChannels.ticker(deltaSym));
      });
    };

    subscribeToSymbols();

    return () => {
      unsubConnection();
      unsubMessages();
      // Unsubscribe from all channels we registered
      const symbols = useTickerStore.getState().customSymbols;
      symbols.forEach((sym) => {
        const deltaSym = toDeltaSymbol(sym);
        ws.unsubscribe(DeltaChannels.ticker(deltaSym));
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]); // Re-init if refresh interval changes

  // Re-subscribe when tracked symbols change
  useEffect(() => {
    const ws = getDeltaWS();
    if (!ws.isOpen()) return;

    customSymbols.forEach((sym) => {
      const deltaSym = toDeltaSymbol(sym);
      ws.subscribe(DeltaChannels.ticker(deltaSym));
    });
  }, [customSymbols]);
}
