"use client";

import { useEffect, useRef, useState, memo } from "react";
import {
  createChart,
  CandlestickSeries as CandlestickSeriesDef,
  type IChartApi,
  type CandlestickData,
  type Time,
  ColorType,
} from "lightweight-charts";
import type { DeltaCandle } from "@/lib/delta/types";
import { detectFVGs, detectOrderBlocks } from "@/lib/smc/detector";

interface CandlestickChartProps {
  candles: DeltaCandle[];
  height?: number;
  symbol?: string;
  livePrice?: number;
}

function CandlestickChart({ candles, height = 480, symbol, livePrice }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const hasFittedRef = useRef<boolean>(false);

  const [showSMC, setShowSMC] = useState(false);

  // Reset fit-content flag when active symbol changes
  useEffect(() => {
    hasFittedRef.current = false;
  }, [symbol]);

  // ── Initialize chart ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8b9ab4",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1a2233", style: 1 },
        horzLines: { color: "#1a2233", style: 1 },
      },
      crosshair: {
        vertLine: { color: "#2d3d57", width: 1 },
        horzLine: { color: "#2d3d57", width: 1 },
      },
      rightPriceScale: {
        borderColor: "#1e2a3a",
        scaleMargins: { top: 0.05, bottom: 0.05 },
      },
      timeScale: {
        borderColor: "#1e2a3a",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 10,
        barSpacing: 6,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    const series = chart.addSeries(CandlestickSeriesDef, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      hasFittedRef.current = false;
    };
  }, [height]);

  // ── Render candlestick data & sync live ticks preserving user zoom position ─────
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;

    const formatted: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    // Timeframe bucket protection: append new bar if new minute/interval, update active bar smoothly if same interval
    if (livePrice && livePrice > 0 && formatted.length > 0) {
      const lastIndex = formatted.length - 1;
      const last = formatted[lastIndex];
      if (last) {
        const lastTimeNum = typeof last.time === "number" ? last.time : Number(last.time);
        const secondToLast = formatted.length > 1 ? formatted[formatted.length - 2] : null;

        const intervalSeconds = secondToLast
          ? Math.max(60, Number(last.time) - Number(secondToLast.time) || 60)
          : 60;

        const nowSec = Math.floor(Date.now() / 1000);
        const currentBucket = Math.floor(nowSec / intervalSeconds) * intervalSeconds;

        if (currentBucket > lastTimeNum) {
          // Append a clean new active candle bar opening at livePrice (no body stretching)
          formatted.push({
            time: currentBucket as Time,
            open: livePrice,
            high: livePrice,
            low: livePrice,
            close: livePrice,
          });
        } else {
          // Same timeframe bucket: update active candle close smoothly
          const updatedHigh = Math.max(last.high ?? livePrice, livePrice);
          const updatedLow = Math.min(last.low ?? livePrice, livePrice);
          formatted[lastIndex] = {
            time: last.time,
            open: last.open,
            high: updatedHigh,
            low: updatedLow,
            close: livePrice,
          };
        }
      }
    }

    seriesRef.current.setData(formatted);

    // Compute SMC overlays if enabled
    if (showSMC && candles.length >= 3) {
      const smcCandles = candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const fvgs = detectFVGs(smcCandles);
      const obs = detectOrderBlocks(smcCandles);

      // Create price lines for top FVGs and OBs
      fvgs.slice(-2).forEach((fvg) => {
        seriesRef.current.createPriceLine({
          price: fvg.top,
          color: fvg.type === "bullish" ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.6)",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `${fvg.type === "bullish" ? "Bull" : "Bear"} FVG`,
        });
      });

      obs.slice(-2).forEach((ob) => {
        seriesRef.current.createPriceLine({
          price: ob.top,
          color: ob.type === "bullish" ? "#3b82f6" : "#f59e0b",
          lineWidth: 1,
          lineStyle: 1,
          axisLabelVisible: true,
          title: `${ob.type === "bullish" ? "Bull" : "Bear"} OB`,
        });
      });
    }

    // ONLY fit content on initial chart load per symbol to PRESERVE user manual zoom & scroll position!
    if (chartRef.current && !hasFittedRef.current) {
      chartRef.current.timeScale().fitContent();
      hasFittedRef.current = true;
    }
  }, [candles, showSMC, livePrice]);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "12px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          onClick={() => setShowSMC(!showSMC)}
          style={{
            padding: "4px 8px",
            fontSize: "0.6875rem",
            fontWeight: 600,
            background: showSMC ? "rgba(59, 130, 246, 0.2)" : "var(--color-bg-surface)",
            border: `1px solid ${showSMC ? "var(--color-brand-400)" : "var(--color-border-subtle)"}`,
            color: showSMC ? "var(--color-brand-400)" : "var(--color-text-muted)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          SMC Overlay: {showSMC ? "ON (FVG / OB)" : "OFF"}
        </button>
      </div>
      <div ref={containerRef} style={{ width: "100%", height }} />
    </div>
  );
}

export default memo(CandlestickChart);
