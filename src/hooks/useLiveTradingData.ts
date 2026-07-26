"use client";

import { useEffect, useState, useCallback } from "react";
import { useTradingStore } from "@/stores/trading-store";
import {
  getLiveWalletBalanceAction,
  getLivePositionsAction,
  getLiveOrdersAction,
} from "@/app/actions/trading";

export function useLiveTradingData() {
  const { tradingMode, setLiveState } = useTradingStore();
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);

  const fetchLiveTradingData = useCallback(async () => {
    if (tradingMode !== "live") return;

    setIsLoadingLive(true);
    setLiveError(null);

    try {
      const [walletRes, positionsRes, ordersRes] = await Promise.all([
        getLiveWalletBalanceAction(),
        getLivePositionsAction(),
        getLiveOrdersAction(),
      ]);

      if (walletRes.error) {
        setLiveError(walletRes.error);
      } else if (positionsRes.error) {
        setLiveError(positionsRes.error);
      } else if (ordersRes.error) {
        setLiveError(ordersRes.error);
      }

      setLiveState({
        wallet: walletRes.balance || undefined,
        positions: positionsRes.positions || [],
        orders: ordersRes.orders || [],
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch live Delta Exchange data.";
      setLiveError(errorMsg);
    } finally {
      setIsLoadingLive(false);
    }
  }, [tradingMode, setLiveState]);

  useEffect(() => {
    if (tradingMode !== "live") {
      setLiveError(null);
      return;
    }

    // Initial fetch on mode change
    fetchLiveTradingData();

    // 5-second polling interval for real-time live account sync
    const interval = setInterval(fetchLiveTradingData, 5000);

    return () => clearInterval(interval);
  }, [tradingMode, fetchLiveTradingData]);

  return {
    liveError,
    isLoadingLive,
    refreshLive: fetchLiveTradingData,
  };
}
