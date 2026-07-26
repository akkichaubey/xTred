"use client";

import { useEffect, useRef, memo } from "react";
import {
  createChart,
  CandlestickSeries as CandlestickSeriesDef,
  type IChartApi,
  type CandlestickData,
  type Time,
  ColorType,
} from "lightweight-charts";
import type { DeltaCandle } from "@/lib/delta/types";

interface CandlestickChartProps {
  candles: DeltaCandle[];
  height?: number;
  symbol?: string;
}

function CandlestickChart({ candles, height = 400, symbol }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);

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
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "#1e2a3a",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    // LW Charts v5: addSeries(definition, options)
    const series = chart.addSeries(CandlestickSeriesDef, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "rgba(16, 185, 129, 0.6)",
      wickDownColor: "rgba(239, 68, 68, 0.6)",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Responsive resize
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  // ── Set full data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const data: CandlestickData[] = candles
      .map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <div className="chart-wrapper">
      {candles.length === 0 && (
        <div className="chart-empty">
          <div className="skeleton" style={{ height: height - 2 }} />
        </div>
      )}
      <div
        ref={containerRef}
        className="chart-container"
        style={{ height, display: candles.length === 0 ? "none" : "block" }}
        aria-label={symbol ? `${symbol} candlestick chart` : "Candlestick chart"}
        role="img"
      />
      <style>{`
        .chart-wrapper {
          position: relative;
          width: 100%;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          overflow: hidden;
        }
        .chart-container {
          width: 100%;
        }
        .chart-empty {
          padding: 4px;
        }
      `}</style>
    </div>
  );
}

export default memo(CandlestickChart);
