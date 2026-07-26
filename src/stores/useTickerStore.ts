import { create } from "zustand";
import { MARKET_REGISTRY, getMarketDefinition } from "@/lib/constants/markets";

export interface TickerInfo {
  symbol: string;
  markPrice: number;
  change24hPct: number;
  volume: number;
  updatedAt: number;
}

interface TickerState {
  activeSymbol: string;
  customSymbols: string[];
  tickers: Record<string, TickerInfo>;
  setActiveSymbol: (symbol: string) => void;
  addCustomSymbol: (symbol: string) => void;
  removeCustomSymbol: (symbol: string) => void;
  setTicker: (symbol: string, info: Partial<TickerInfo>) => void;
  setMultipleTickers: (tickerList: Partial<TickerInfo>[]) => void;
}

// Populate initial ticker state from Centralized Market Registry
const initialTickers: Record<string, TickerInfo> = {};
Object.keys(MARKET_REGISTRY).forEach((sym) => {
  const def = MARKET_REGISTRY[sym];
  if (def) {
    initialTickers[sym] = {
      symbol: sym,
      markPrice: def.basePrice,
      change24hPct: def.change24hPct,
      volume: def.volume24hUsd,
      updatedAt: Date.now(),
    };
  }
});

export const useTickerStore = create<TickerState>((set) => ({
  activeSymbol: "BTCUSD",
  customSymbols: ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD"],
  tickers: initialTickers,

  setActiveSymbol: (symbol: string) => set({ activeSymbol: symbol.toUpperCase() }),

  addCustomSymbol: (symbol: string) =>
    set((state) => {
      const upper = symbol.toUpperCase();
      const def = getMarketDefinition(upper);

      const existingTicker = state.tickers[upper];
      const updatedTickers = {
        ...state.tickers,
        [upper]: existingTicker || {
          symbol: upper,
          markPrice: def.basePrice,
          change24hPct: def.change24hPct,
          volume: def.volume24hUsd,
          updatedAt: Date.now(),
        },
      };

      if (state.customSymbols.includes(upper)) {
        return {
          activeSymbol: upper,
          tickers: updatedTickers,
        };
      }

      return {
        customSymbols: [...state.customSymbols, upper],
        activeSymbol: upper,
        tickers: updatedTickers,
      };
    }),

  removeCustomSymbol: (symbol: string) =>
    set((state) => {
      const upper = symbol.toUpperCase();
      const filtered = state.customSymbols.filter((s) => s !== upper);
      const nextActive = state.activeSymbol === upper ? filtered[0] || "BTCUSD" : state.activeSymbol;
      return {
        customSymbols: filtered,
        activeSymbol: nextActive,
      };
    }),

  setTicker: (symbol: string, info: Partial<TickerInfo>) =>
    set((state) => {
      const upper = symbol.toUpperCase();
      const existing = state.tickers[upper];
      return {
        tickers: {
          ...state.tickers,
          [upper]: {
            symbol: upper,
            markPrice: info.markPrice ?? existing?.markPrice ?? 0,
            change24hPct: info.change24hPct ?? existing?.change24hPct ?? 0,
            volume: info.volume ?? existing?.volume ?? 0,
            updatedAt: Date.now(),
          },
        },
      };
    }),

  setMultipleTickers: (tickerList: Partial<TickerInfo>[]) =>
    set((state) => {
      const updated = { ...state.tickers };
      tickerList.forEach((info) => {
        if (info.symbol) {
          const upper = info.symbol.toUpperCase();
          const existing = updated[upper];
          updated[upper] = {
            symbol: upper,
            markPrice: info.markPrice ?? existing?.markPrice ?? 0,
            change24hPct: info.change24hPct ?? existing?.change24hPct ?? 0,
            volume: info.volume ?? existing?.volume ?? 0,
            updatedAt: Date.now(),
          };
        }
      });
      return { tickers: updated };
    }),
}));
