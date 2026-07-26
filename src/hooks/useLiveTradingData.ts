"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useTelemetryStore } from "@/stores/telemetry-store";
import {
  getLiveWalletBalanceAction,
  getLivePositionsAction,
  getLiveOrdersAction,
  getLiveFillsAction,
} from "@/app/actions/trading";

export function useLiveTradingData() {
  const { tradingMode, setLiveState } = useTradingStore();
  const { refreshInterval, deltaApiKey, deltaApiSecret, deltaEnv } = useSettingsStore();
  const { setRestSync, setTabVisible } = useTelemetryStore();

  const [liveError, setLiveError] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);

  const activeCredentials = useRef({
    apiKey: deltaApiKey,
    apiSecret: deltaApiSecret,
    env: deltaEnv,
  });

  useEffect(() => {
    activeCredentials.current = {
      apiKey: deltaApiKey,
      apiSecret: deltaApiSecret,
      env: deltaEnv,
    };
  }, [deltaApiKey, deltaApiSecret, deltaEnv]);

  // ─── Tier 1: Positions & Open Orders (Critical Risk & Orders - Every 2s) ──────
  const syncTier1 = useCallback(async () => {
    if (tradingMode !== "live" || document.hidden) return;

    try {
      const startTime = performance.now();
      const [positionsRes, ordersRes] = await Promise.all([
        getLivePositionsAction(activeCredentials.current),
        getLiveOrdersAction(activeCredentials.current),
      ]);

      const latency = Math.round(performance.now() - startTime);

      if (positionsRes.error) {
        setLiveError(positionsRes.error);
        setRestSync("error", latency);
      } else if (ordersRes.error) {
        setLiveError(ordersRes.error);
        setRestSync("error", latency);
      } else {
        setLiveState({
          positions: positionsRes.positions || [],
          orders: ordersRes.orders || [],
        });
        setRestSync("ok", latency);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sync Tier 1 live data.";
      setLiveError(errorMsg);
      setRestSync("error");
    }
  }, [tradingMode, setLiveState, setRestSync]);

  // ─── Tier 2: Wallet & Available Margin (User Configured Interval - Default 5s) ──
  const syncTier2 = useCallback(async () => {
    if (tradingMode !== "live" || document.hidden) return;

    try {
      const startTime = performance.now();
      const walletRes = await getLiveWalletBalanceAction(activeCredentials.current);
      const latency = Math.round(performance.now() - startTime);

      if (walletRes.error) {
        setLiveError(walletRes.error);
        setRestSync("error", latency);
      } else {
        setLiveState({
          wallet: walletRes.balance || undefined,
        });
        setRestSync("ok", latency);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sync Tier 2 wallet balance.";
      setLiveError(errorMsg);
      setRestSync("error");
    }
  }, [tradingMode, setLiveState, setRestSync]);

  // ─── Tier 3: Executed Trade Fills History (Low Frequency - Every 15s) ──────────
  const syncTier3 = useCallback(async () => {
    if (tradingMode !== "live" || document.hidden) return;

    try {
      const fillsRes = await getLiveFillsAction(activeCredentials.current);
      if (fillsRes.error) {
        setLiveError(fillsRes.error);
      } else {
        setLiveState({
          trades: fillsRes.trades || [],
        });
      }
    } catch (err: unknown) {
      // Non-blocking history sync
      console.warn("[useLiveTradingData] Tier 3 history sync notice:", err);
    }
  }, [tradingMode, setLiveState]);

  // ─── Instant Full Refetch (Post-Trade Execution) ───────────────────────────
  const refreshLive = useCallback(async () => {
    if (tradingMode !== "live") return;

    setIsLoadingLive(true);
    setLiveError(null);
    setRestSync("syncing");

    try {
      const startTime = performance.now();
      const [walletRes, positionsRes, ordersRes, fillsRes] = await Promise.all([
        getLiveWalletBalanceAction(activeCredentials.current),
        getLivePositionsAction(activeCredentials.current),
        getLiveOrdersAction(activeCredentials.current),
        getLiveFillsAction(activeCredentials.current),
      ]);
      const latency = Math.round(performance.now() - startTime);

      if (walletRes.error) {
        setLiveError(walletRes.error);
        setRestSync("error", latency);
      } else if (positionsRes.error) {
        setLiveError(positionsRes.error);
        setRestSync("error", latency);
      } else if (ordersRes.error) {
        setLiveError(ordersRes.error);
        setRestSync("error", latency);
      } else if (fillsRes.error) {
        setLiveError(fillsRes.error);
      } else {
        setRestSync("ok", latency);
      }

      setLiveState({
        wallet: walletRes.balance || undefined,
        positions: positionsRes.positions || [],
        orders: ordersRes.orders || [],
        trades: fillsRes.trades || [],
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch live Delta Exchange data.";
      setLiveError(errorMsg);
      setRestSync("error");
    } finally {
      setIsLoadingLive(false);
    }
  }, [tradingMode, setLiveState, setRestSync]);

  // ─── 3-Tier Polling & Smart Tab-Visibility Manager ─────────────────────────
  useEffect(() => {
    if (tradingMode !== "live") {
      setLiveError(null);
      setRestSync("paused");
      return;
    }

    // Initial full sync on mode change
    refreshLive();

    // Setup 3 Independent Tiers
    const tier1Interval = setInterval(syncTier1, 2000); // Tier 1: 2s
    const tier2IntervalMs = (refreshInterval || 5) * 1000;
    const tier2Interval = setInterval(syncTier2, tier2IntervalMs); // Tier 2: User interval (5s)
    const tier3Interval = setInterval(syncTier3, 15000); // Tier 3: 15s

    // Smart Visibility Listener (Pause on hidden, Resume + Instant Sync on focus)
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setTabVisible(isVisible);

      if (isVisible) {
        setRestSync("syncing");
        refreshLive(); // Instant sync when user switches back to tab
      } else {
        setRestSync("paused");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(tier1Interval);
      clearInterval(tier2Interval);
      clearInterval(tier3Interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tradingMode, refreshLive, syncTier1, syncTier2, syncTier3, refreshInterval, setRestSync, setTabVisible]);

  return {
    liveError,
    isLoadingLive,
    refreshLive,
  };
}
