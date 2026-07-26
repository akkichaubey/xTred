import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RefreshInterval,
  ConnectionStatus,
  DeltaEnvironment,
  GeminiModel,
  PlatformSettings,
} from "@/types/settings";

interface SettingsState extends PlatformSettings {
  deltaStatus: ConnectionStatus;
  geminiStatus: ConnectionStatus;

  // Actions
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  setDeltaStatus: (status: ConnectionStatus) => void;
  setGeminiStatus: (status: ConnectionStatus) => void;
  resetToDefaults: () => void;
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  deltaApiKey: "",
  deltaApiSecret: "",
  deltaEnv: "india",
  geminiApiKey: "",
  geminiModel: "gemini-2.5-pro",
  refreshInterval: 5,
  riskMaxTradePct: 1.0,
  riskMaxDailyPct: 3.0,
  riskMaxWeeklyPct: 6.0,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      deltaStatus: "untested",
      geminiStatus: "untested",

      updateSettings: (newSettings) =>
        set((state) => ({
          ...state,
          ...newSettings,
        })),

      setDeltaStatus: (status) => set({ deltaStatus: status }),
      setGeminiStatus: (status) => set({ geminiStatus: status }),

      resetToDefaults: () =>
        set({
          ...DEFAULT_SETTINGS,
          deltaStatus: "untested",
          geminiStatus: "untested",
        }),
    }),
    {
      name: "xtred-platform-settings",
      partialize: (state) => ({
        deltaApiKey: state.deltaApiKey,
        deltaApiSecret: state.deltaApiSecret,
        deltaEnv: state.deltaEnv,
        geminiApiKey: state.geminiApiKey,
        geminiModel: state.geminiModel,
        refreshInterval: state.refreshInterval,
        riskMaxTradePct: state.riskMaxTradePct,
        riskMaxDailyPct: state.riskMaxDailyPct,
        riskMaxWeeklyPct: state.riskMaxWeeklyPct,
        deltaStatus: state.deltaStatus,
        geminiStatus: state.geminiStatus,
      }),
    }
  )
);
