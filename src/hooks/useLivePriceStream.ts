"use client";

import { useEffect } from "react";
import { useTickerStore } from "@/stores/useTickerStore";
import { toDeltaSymbol } from "@/lib/delta/client";

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
    }

    fetchTickers();
    const interval = setInterval(fetchTickers, 5000); // 5-second real market ticker stream interval

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setMultipleTickers]);
}
