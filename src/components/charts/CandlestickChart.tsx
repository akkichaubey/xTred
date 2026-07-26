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

  const [showSMC, setShowSMC] = useState(false);

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
    };
  }, [height]);

  // ── Update candle data & SMC lines ───────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;

    const formatted: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    // If livePrice is available, sync the last candle's close price in real time
    if (livePrice && livePrice > 0 && formatted.length > 0) {
      const lastIndex = formatted.length - 1;
      const lastItem = formatted[lastIndex];
      if (lastItem) {
        const highVal = lastItem.high ?? livePrice;
        const lowVal = lastItem.low ?? livePrice;
        const updatedLast: CandlestickData<Time> = {
          time: lastItem.time,
          open: lastItem.open,
          high: Math.max(highVal, livePrice),
          low: Math.min(lowVal, livePrice),
          close: livePrice,
        };
        formatted[lastIndex] = updatedLast;
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

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles, showSMC, livePrice]);

  // ── Synchronize live price ticks onto active candle bar in real time ──────
  useEffect(() => {
    if (!seriesRef.current || !candles.length || !livePrice || livePrice <= 0) return;

    const lastCandle = candles[candles.length - 1];
    if (!lastCandle) return;

    const updatedLast: CandlestickData<Time> = {
      time: lastCandle.time as Time,
      open: lastCandle.open,
      high: Math.max(lastCandle.high, livePrice),
      low: Math.min(lastCandle.low, livePrice),
      close: livePrice,
    };

    try {
      seriesRef.current.update(updatedLast);
    } catch {
      // Fallback
    }
  }, [livePrice, candles]);

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
