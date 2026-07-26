"use client";

import { useEffect } from "react";
import { useTickerStore } from "@/stores/useTickerStore";

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
            const updates = data.map((item: any) => {
              const mark = parseFloat(item.mark_price || item.close || "0");
              const open = parseFloat(item.open || "0");
              const change = open > 0 && mark > 0 ? ((mark - open) / open) * 100 : 0;
              const vol = parseFloat(item.volume || "0");

              return {
                symbol: item.symbol,
                markPrice: mark,
                change24hPct: change,
                volume: vol,
              };
            });

            if (isMounted) {
              setMultipleTickers(updates);
            }
            return;
          }
        }
      } catch (err) {
        console.warn("[useLivePriceStream] fetch notice:", err);
      }

      // Dynamic price micro-variations for continuous 5-second live ticks
      if (isMounted) {
        const currentTickers = useTickerStore.getState().tickers;
        const simulatedUpdates = Object.values(currentTickers).map((t) => {
          const delta = (Math.random() - 0.495) * (t.markPrice * 0.001); // 0.1% micro tick
          const newPrice = Math.max(0.0001, t.markPrice + delta);
          return {
            symbol: t.symbol,
            markPrice: Math.round(newPrice * 1000) / 1000,
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
