import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CandleResolution } from "@/types";

interface UIState {
  // Active market symbol
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;

  // Chart timeframe
  activeResolution: CandleResolution;
  setActiveResolution: (resolution: CandleResolution) => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Modal state
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

/**
 * xTred UI Store — Zustand
 *
 * Rule: ONLY browser-session state lives here.
 * Server data (prices, analysis) → TanStack Query.
 * Form mutations → useActionState + Server Actions.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeSymbol: "BTCUSD",
      setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),

      activeResolution: "4h",
      setActiveResolution: (resolution) => set({ activeResolution: resolution }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      activeModal: null,
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: "xtred-ui-state",
      partialize: (state) => ({
        activeSymbol: state.activeSymbol,
        activeResolution: state.activeResolution,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
