import { create } from "zustand";

export interface TelemetryState {
  wsConnected: boolean;
  restStatus: "ok" | "error" | "syncing" | "paused";
  restLatencyMs: number;
  lastSyncedAt: string | null;
  isTabVisible: boolean;

  // Actions
  setWsConnected: (connected: boolean) => void;
  setRestSync: (status: "ok" | "error" | "syncing" | "paused", latencyMs?: number) => void;
  setTabVisible: (visible: boolean) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  wsConnected: false,
  restStatus: "syncing",
  restLatencyMs: 0,
  lastSyncedAt: null,
  isTabVisible: true,

  setWsConnected: (connected) => set({ wsConnected: connected }),

  setRestSync: (status, latencyMs) =>
    set((state) => ({
      restStatus: status,
      restLatencyMs: latencyMs !== undefined ? latencyMs : state.restLatencyMs,
      lastSyncedAt: status === "ok" ? new Date().toLocaleTimeString() : state.lastSyncedAt,
    })),

  setTabVisible: (visible) => set({ isTabVisible: visible }),
}));
