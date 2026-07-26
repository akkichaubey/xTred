"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getDeltaWS, DeltaChannels } from "@/lib/delta/websocket";
import type { DeltaTicker, DeltaCandle, DeltaFundingRate, DeltaOI } from "@/lib/delta/types";
import type { CandleResolution } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const deltaKeys = {
  ticker: (symbol: string) => ["delta", "ticker", symbol] as const,
  allTickers: () => ["delta", "tickers"] as const,
  candles: (symbol: string, resolution: CandleResolution) =>
    ["delta", "candles", symbol, resolution] as const,
  oi: (symbol: string) => ["delta", "oi", symbol] as const,
  funding: (symbol: string) => ["delta", "funding", symbol] as const,
};

// ─── useDeltaTicker ───────────────────────────────────────────────────────────

/**
 * Live ticker for a symbol — REST initial fetch + WebSocket updates.
 * WS updates flow directly into the TanStack Query cache.
 */
export function useDeltaTicker(symbol: string) {
  const queryClient = useQueryClient();

  // Initial REST fetch
  const query = useQuery<DeltaTicker>({
    queryKey: deltaKeys.ticker(symbol),
    queryFn: async () => {
      const res = await fetch(`/api/delta/tickers?symbol=${symbol}`);
      const json = (await res.json()) as { success: boolean; data: DeltaTicker; error?: string };
      if (!json.success) throw new Error(json.error ?? "Ticker fetch failed");
      return json.data;
    },
    staleTime: 5000,
    refetchInterval: 15000, // fallback poll if WS dies
  });

  // WebSocket subscription
  useEffect(() => {
    const ws = getDeltaWS();
    ws.connect();
    ws.subscribe(DeltaChannels.ticker(symbol));

    const unsubscribe = ws.onMessage((msg) => {
      if (msg.type === "ticker" && msg.symbol === symbol) {
        queryClient.setQueryData(deltaKeys.ticker(symbol), msg.data);
      }
    });

    return () => {
      unsubscribe();
      ws.unsubscribe(DeltaChannels.ticker(symbol));
    };
  }, [symbol, queryClient]);

  return query;
}

// ─── useDeltaCandles ─────────────────────────────────────────────────────────

export function useDeltaCandles(symbol: string, resolution: CandleResolution) {
  const queryClient = useQueryClient();

  const query = useQuery<DeltaCandle[]>({
    queryKey: deltaKeys.candles(symbol, resolution),
    queryFn: async () => {
      const res = await fetch(
        `/api/delta/candles?symbol=${symbol}&resolution=${resolution}`
      );
      const json = (await res.json()) as { success: boolean; data: DeltaCandle[]; error?: string };
      if (!json.success) throw new Error(json.error ?? "Candle fetch failed");
      return json.data;
    },
    staleTime: 60_000, // candles don't need to re-fetch as often
  });

  // Subscribe to live candle updates
  useEffect(() => {
    const ws = getDeltaWS();
    ws.connect();
    ws.subscribe(DeltaChannels.candles(symbol, resolution));

    const unsubscribe = ws.onMessage((msg) => {
      if (
        msg.type === `candlestick_${resolution}` &&
        "data" in msg &&
        msg.symbol === symbol
      ) {
        // Update the last candle in the series with live data
        queryClient.setQueryData<DeltaCandle[]>(
          deltaKeys.candles(symbol, resolution),
          (prev) => {
            if (!prev || prev.length === 0) return prev;
            const d = msg.data as { timestamp: number; open: number; high: number; low: number; close: number; volume: number };
            const last = prev[prev.length - 1];
            const newCandle: DeltaCandle = {
              time: d.timestamp,
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
              volume: d.volume,
            };
            // Replace last if same timestamp, else append
            if (last && last.time === newCandle.time) {
              return [...prev.slice(0, -1), newCandle];
            }
            return [...prev, newCandle];
          }
        );
      }
    });

    return () => {
      unsubscribe();
      ws.unsubscribe(DeltaChannels.candles(symbol, resolution));
    };
  }, [symbol, resolution, queryClient]);

  return query;
}

// ─── useAllTickers ────────────────────────────────────────────────────────────

export function useAllTickers() {
  return useQuery<DeltaTicker[]>({
    queryKey: deltaKeys.allTickers(),
    queryFn: async () => {
      const res = await fetch("/api/delta/tickers");
      const json = (await res.json()) as { success: boolean; data: DeltaTicker[]; error?: string };
      if (!json.success) throw new Error(json.error ?? "Tickers fetch failed");
      return json.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ─── useDeltaOI ──────────────────────────────────────────────────────────────

export function useDeltaOI(symbol: string) {
  return useQuery<DeltaOI>({
    queryKey: deltaKeys.oi(symbol),
    queryFn: async () => {
      const res = await fetch(`/api/delta/products?oi=${symbol}`);
      const json = (await res.json()) as { success: boolean; data: DeltaOI; error?: string };
      if (!json.success) throw new Error(json.error ?? "OI fetch failed");
      return json.data;
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}

// ─── useDeltaFunding ─────────────────────────────────────────────────────────

export function useDeltaFunding(symbol: string) {
  return useQuery<DeltaFundingRate[]>({
    queryKey: deltaKeys.funding(symbol),
    queryFn: async () => {
      const res = await fetch(`/api/delta/products?funding=${symbol}`);
      const json = (await res.json()) as { success: boolean; data: DeltaFundingRate[]; error?: string };
      if (!json.success) throw new Error(json.error ?? "Funding fetch failed");
      return json.data;
    },
    staleTime: 60_000,
  });
}

// ─── useWebSocketStatus ──────────────────────────────────────────────────────

export function useWebSocketStatus() {
  const statusRef = useRef(false);

  useEffect(() => {
    const ws = getDeltaWS();
    const unsub = ws.onConnection((connected) => {
      statusRef.current = connected;
    });
    return unsub;
  }, []);

  return { isConnected: statusRef.current };
}
