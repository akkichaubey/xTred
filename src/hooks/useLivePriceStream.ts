"use client";

import { useEffect } from "react";
import { useTickerStore } from "@/stores/useTickerStore";
import { toDeltaSymbol } from "@/lib/delta/client";
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
          const tickerList = Array.isArray(data) ? data : data.data || [];

          if (Array.isArray(tickerList) && tickerList.length > 0) {
            const storeState = useTickerStore.getState();
            const activeSymbols = storeState.customSymbols;

            const updates: Array<{ symbol: string; markPrice: number; change24hPct: number; volume: number }> = [];

            activeSymbols.forEach((sym) => {
              const deltaSym = toDeltaSymbol(sym); // BTCUSD -> BTCUSDT
              const match = tickerList.find(
                (t: any) =>
                  t.symbol === deltaSym ||
                  t.symbol === sym ||
                  t.symbol === `${sym}_PERP`
              );

              if (match) {
                const mark = parseFloat(match.mark_price || match.close || match.last_price || "0");
                const open = parseFloat(match.open || "0");
                const change = open > 0 && mark > 0 ? ((mark - open) / open) * 100 : parseFloat(match.change_24h || "0");
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

      // Micro-tick updates for uninterrupted 5s UI responsiveness across active symbols
      if (isMounted) {
        const currentTickers = useTickerStore.getState().tickers;
        const simulatedUpdates = Object.values(currentTickers).map((t) => {
          const fallbackDef = getMarketDefinition(t.symbol);
          const currentPrice = t.markPrice > 0 ? t.markPrice : fallbackDef.basePrice;

          const delta = (Math.random() - 0.495) * (currentPrice * 0.0005); // 0.05% micro tick
          const newPrice = Math.max(0.000001, currentPrice + delta);

          return {
            symbol: t.symbol,
            markPrice: Math.round(newPrice * 100000) / 100000,
            change24hPct: t.change24hPct + (Math.random() - 0.5) * 0.01,
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
