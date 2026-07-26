import { create } from "zustand";
import { MARKET_REGISTRY, getMarketDefinition } from "@/lib/constants/markets";

export interface TickerInfo {
  symbol: string;
  markPrice: number;
  close?: number;
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
      close: def.basePrice,
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

  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),

  addCustomSymbol: (symbol) =>
    set((state) => {
      const clean = symbol.toUpperCase().trim();
      const def = getMarketDefinition(clean);

      const existingTicker = state.tickers[clean];
      const newTicker: TickerInfo = existingTicker ?? {
        symbol: clean,
        markPrice: def.basePrice,
        close: def.basePrice,
        change24hPct: def.change24hPct,
        volume: def.volume24hUsd,
        updatedAt: Date.now(),
      };

      const customSymbols = state.customSymbols.includes(clean)
        ? state.customSymbols
        : [...state.customSymbols, clean];

      return {
        customSymbols,
        activeSymbol: clean,
        tickers: {
          ...state.tickers,
          [clean]: newTicker,
        },
      };
    }),

  removeCustomSymbol: (symbol) =>
    set((state) => ({
      customSymbols: state.customSymbols.filter((s) => s !== symbol),
      activeSymbol:
        state.activeSymbol === symbol
          ? state.customSymbols.find((s) => s !== symbol) ?? "BTCUSD"
          : state.activeSymbol,
    })),

  setTicker: (symbol, info) =>
    set((state) => {
      const current = state.tickers[symbol] ?? {
        symbol,
        markPrice: info.markPrice ?? 0,
        close: info.close ?? info.markPrice ?? 0,
        change24hPct: info.change24hPct ?? 0,
        volume: info.volume ?? 0,
        updatedAt: Date.now(),
      };
      return {
        tickers: {
          ...state.tickers,
          [symbol]: {
            ...current,
            ...info,
            close: info.close ?? info.markPrice ?? current.close ?? current.markPrice,
            updatedAt: Date.now(),
          },
        },
      };
    }),

  setMultipleTickers: (tickerList) =>
    set((state) => {
      const nextTickers = { ...state.tickers };
      tickerList.forEach((info) => {
        if (!info.symbol) return;
        const sym = info.symbol;
        const current = nextTickers[sym] ?? {
          symbol: sym,
          markPrice: info.markPrice ?? 0,
          close: info.close ?? info.markPrice ?? 0,
          change24hPct: info.change24hPct ?? 0,
          volume: info.volume ?? 0,
          updatedAt: Date.now(),
        };
        nextTickers[sym] = {
          ...current,
          ...info,
          close: info.close ?? info.markPrice ?? current.close ?? current.markPrice,
          updatedAt: Date.now(),
        };
      });
      return { tickers: nextTickers };
    }),
}));
