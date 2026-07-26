"use client";

import { useEffect, useState, useCallback } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  getLiveWalletBalanceAction,
  getLivePositionsAction,
  getLiveOrdersAction,
} from "@/app/actions/trading";

export function useLiveTradingData() {
  const { tradingMode, setLiveState } = useTradingStore();
  const { refreshInterval, deltaApiKey, deltaApiSecret, deltaEnv } = useSettingsStore();

  const [liveError, setLiveError] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);

  const fetchLiveTradingData = useCallback(async () => {
    if (tradingMode !== "live") return;

    setIsLoadingLive(true);
    setLiveError(null);

    const credentials = {
      apiKey: deltaApiKey,
      apiSecret: deltaApiSecret,
      env: deltaEnv,
    };

    try {
      const [walletRes, positionsRes, ordersRes] = await Promise.all([
        getLiveWalletBalanceAction(credentials),
        getLivePositionsAction(credentials),
        getLiveOrdersAction(credentials),
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
  }, [tradingMode, setLiveState, deltaApiKey, deltaApiSecret, deltaEnv]);

  useEffect(() => {
    if (tradingMode !== "live") {
      setLiveError(null);
      return;
    }

    // Initial fetch on mode change
    fetchLiveTradingData();

    // Dynamic polling interval for real-time live account sync
    const intervalMs = (refreshInterval || 5) * 1000;
    const interval = setInterval(fetchLiveTradingData, intervalMs);

    return () => clearInterval(interval);
  }, [tradingMode, fetchLiveTradingData, refreshInterval]);

  return {
    liveError,
    isLoadingLive,
    refreshLive: fetchLiveTradingData,
  };
}
