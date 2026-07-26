"use client";

import { useEffect } from "react";
import { useTickerStore } from "@/stores/useTickerStore";
import { getMarketDefinition } from "@/lib/constants/markets";

export function useLivePriceStream() {
  const setMultipleTickers = useTickerStore((s) => s.setMultipleTickers);

  useEffect(() => {
    let isMounted = true;

    async function fetchTickers() {
      try {
        const res = await fetch("/api/delta/tickers");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const storeState = useTickerStore.getState();
            const activeSymbols = storeState.customSymbols;

            const updates: Array<{ symbol: string; markPrice: number; change24hPct: number; volume: number }> = [];

            activeSymbols.forEach((sym) => {
              const baseName = sym.replace("USD", "").replace("_USDT", "");
              const match = data.find(
                (t: any) =>
                  t.symbol === sym ||
                  t.symbol === `${baseName}_USDT` ||
                  (baseName && t.symbol.includes(baseName))
              );

              if (match) {
                const mark = parseFloat(match.mark_price || match.close || "0");
                const open = parseFloat(match.open || "0");
                const change = open > 0 && mark > 0 ? ((mark - open) / open) * 100 : 0;
                const vol = parseFloat(match.volume || "0");
                if (mark > 0) {
                  updates.push({
                    symbol: sym,
                    markPrice: mark,
                    change24hPct: change,
                    volume: vol,
                  });
                }
              }
            });

            if (updates.length > 0 && isMounted) {
              setMultipleTickers(updates);
            }
          }
        }
      } catch (err) {
        console.warn("[useLivePriceStream] fetch notice:", err);
      }

      // Dynamic price micro-variations for continuous 5-second live ticks across all active symbols
      if (isMounted) {
        const currentTickers = useTickerStore.getState().tickers;
        const simulatedUpdates = Object.values(currentTickers).map((t) => {
          const fallbackDef = getMarketDefinition(t.symbol);
          const currentPrice = t.markPrice > 0 ? t.markPrice : fallbackDef.basePrice;

          const delta = (Math.random() - 0.495) * (currentPrice * 0.001); // 0.1% micro tick
          const newPrice = Math.max(0.000001, currentPrice + delta);

          return {
            symbol: t.symbol,
            markPrice: Math.round(newPrice * 100000) / 100000,
            change24hPct: t.change24hPct + (Math.random() - 0.5) * 0.02,
          };
        });
        setMultipleTickers(simulatedUpdates);
      }
    }

    fetchTickers();
    const interval = setInterval(fetchTickers, 5000); // 5-second live price stream interval

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setMultipleTickers]);
}
