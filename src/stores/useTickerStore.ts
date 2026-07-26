import { create } from "zustand";

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

export const useTickerStore = create<TickerState>((set) => ({
  activeSymbol: "BTCUSD",
  customSymbols: ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD"],
  tickers: {
    BTCUSD: { symbol: "BTCUSD", markPrice: 66420, change24hPct: 2.15, volume: 1250000000, updatedAt: Date.now() },
    ETHUSD: { symbol: "ETHUSD", markPrice: 3450, change24hPct: 1.82, volume: 680000000, updatedAt: Date.now() },
    SOLUSD: { symbol: "SOLUSD", markPrice: 184.5, change24hPct: 4.12, volume: 420000000, updatedAt: Date.now() },
    XRPUSD: { symbol: "XRPUSD", markPrice: 0.585, change24hPct: -0.95, volume: 190000000, updatedAt: Date.now() },
  },

  setActiveSymbol: (symbol: string) => set({ activeSymbol: symbol }),

  addCustomSymbol: (symbol: string) =>
    set((state) => {
      const upper = symbol.toUpperCase();
      if (state.customSymbols.includes(upper)) {
        return { activeSymbol: upper };
      }
      return {
        customSymbols: [...state.customSymbols, upper],
        activeSymbol: upper,
      };
    }),

  removeCustomSymbol: (symbol: string) =>
    set((state) => {
      const filtered = state.customSymbols.filter((s) => s !== symbol);
      const nextActive = state.activeSymbol === symbol ? filtered[0] || "BTCUSD" : state.activeSymbol;
      return {
        customSymbols: filtered,
        activeSymbol: nextActive,
      };
    }),

  setTicker: (symbol: string, info: Partial<TickerInfo>) =>
    set((state) => ({
      tickers: {
        ...state.tickers,
        [symbol]: {
          symbol,
          markPrice: info.markPrice ?? state.tickers[symbol]?.markPrice ?? 0,
          change24hPct: info.change24hPct ?? state.tickers[symbol]?.change24hPct ?? 0,
          volume: info.volume ?? state.tickers[symbol]?.volume ?? 0,
          updatedAt: Date.now(),
        },
      },
    })),

  setMultipleTickers: (tickerList: Partial<TickerInfo>[]) =>
    set((state) => {
      const updated = { ...state.tickers };
      tickerList.forEach((info) => {
        if (info.symbol) {
          const existing = updated[info.symbol];
          updated[info.symbol] = {
            symbol: info.symbol,
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
