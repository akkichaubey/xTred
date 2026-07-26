"use client";

import { useEffect, useRef, useState, memo } from "react";
import {
  createChart,
  CandlestickSeries as CandlestickSeriesDef,
  BarSeries as BarSeriesDef,
  LineSeries as LineSeriesDef,
  AreaSeries as AreaSeriesDef,
  BaselineSeries as BaselineSeriesDef,
  type IChartApi,
  type Time,
  ColorType,
} from "lightweight-charts";
import type { DeltaCandle } from "@/lib/delta/types";
import { detectFVGs, detectOrderBlocks } from "@/lib/smc/detector";

export type ChartType = "candles" | "bars" | "line" | "area" | "baseline";

interface CandlestickChartProps {
  candles: DeltaCandle[];
  height?: number;
  symbol?: string;
  livePrice?: number;
}

const CHART_TYPE_OPTIONS: { id: ChartType; label: string; icon: string }[] = [
  { id: "candles", label: "Candles", icon: "🕯️" },
  { id: "bars", label: "Bars", icon: "📊" },
  { id: "line", label: "Line", icon: "📈" },
  { id: "area", label: "Area", icon: "🏔️" },
  { id: "baseline", label: "Baseline", icon: "⚖️" },
];

function CandlestickChart({ candles, height = 480, symbol, livePrice }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const priceLinesRef = useRef<any[]>([]);
  const hasFittedRef = useRef<boolean>(false);

  const [chartType, setChartType] = useState<ChartType>("candles");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSMC, setShowSMC] = useState(false);

  // Reset fit-content flag when active symbol changes
  useEffect(() => {
    hasFittedRef.current = false;
  }, [symbol]);

  // ── Initialize chart & series according to chartType ─────────────────────────
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
      localization: {
        timeFormatter: (timestamp: number) => {
          const d = new Date(timestamp * 1000);
          const hours = String(d.getHours()).padStart(2, "0");
          const minutes = String(d.getMinutes()).padStart(2, "0");
          return `${hours}:${minutes}`;
        },
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

    let series: unknown = null;
    if (chartType === "bars") {
      series = chart.addSeries(BarSeriesDef, {
        upColor: "#10b981",
        downColor: "#ef4444",
      });
    } else if (chartType === "line") {
      series = chart.addSeries(LineSeriesDef, {
        color: "#3b82f6",
        lineWidth: 2,
      });
    } else if (chartType === "area") {
      series = chart.addSeries(AreaSeriesDef, {
        topColor: "rgba(59, 130, 246, 0.4)",
        bottomColor: "rgba(59, 130, 246, 0.0)",
        lineColor: "#3b82f6",
        lineWidth: 2,
      });
    } else if (chartType === "baseline") {
      series = chart.addSeries(BaselineSeriesDef, {
        topLineColor: "#10b981",
        bottomLineColor: "#ef4444",
        topFillColor1: "rgba(16, 185, 129, 0.28)",
        topFillColor2: "rgba(16, 185, 129, 0.05)",
        bottomFillColor1: "rgba(239, 68, 68, 0.05)",
        bottomFillColor2: "rgba(239, 68, 68, 0.28)",
      });
    } else {
      series = chart.addSeries(CandlestickSeriesDef, {
        upColor: "#10b981",
        downColor: "#ef4444",
        borderUpColor: "#10b981",
        borderDownColor: "#ef4444",
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
      });
    }

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
      priceLinesRef.current = [];
      hasFittedRef.current = false;
    };
  }, [height, chartType]);

  // ── Render chart data & sync live ticks ──────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;

    const isSingleValueType = chartType === "line" || chartType === "area" || chartType === "baseline";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted: any[] = candles.map((c) => {
      if (isSingleValueType) {
        return { time: c.time as Time, value: c.close };
      }
      return {
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      };
    });

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
          if (isSingleValueType) {
            formatted.push({ time: currentBucket as Time, value: livePrice });
          } else {
            formatted.push({
              time: currentBucket as Time,
              open: livePrice,
              high: livePrice,
              low: livePrice,
              close: livePrice,
            });
          }
        } else {
          if (isSingleValueType) {
            formatted[lastIndex] = { time: last.time, value: livePrice };
          } else {
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
    }

    seriesRef.current.setData(formatted);

    // ── ALWAYS CLEAR EXISTING SMC PRICE LINES BEFORE REDRAWING ────────────────────
    if (priceLinesRef.current.length > 0 && seriesRef.current) {
      priceLinesRef.current.forEach((line) => {
        try {
          seriesRef.current.removePriceLine(line);
        } catch {
          // Ignore if series destroyed
        }
      });
      priceLinesRef.current = [];
    }

    // Compute SMC overlays if enabled (for candle & bar charts)
    if (showSMC && candles.length >= 3 && !isSingleValueType) {
      const smcCandles = candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const fvgs = detectFVGs(smcCandles);
      const obs = detectOrderBlocks(smcCandles);

      // Create price lines for top FVGs and OBs without duplication
      fvgs.slice(-2).forEach((fvg) => {
        const line = seriesRef.current.createPriceLine({
          price: fvg.top,
          color: fvg.type === "bullish" ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.6)",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `${fvg.type === "bullish" ? "Bull" : "Bear"} FVG`,
        });
        priceLinesRef.current.push(line);
      });

      obs.slice(-2).forEach((ob) => {
        const line = seriesRef.current.createPriceLine({
          price: ob.top,
          color: ob.type === "bullish" ? "#3b82f6" : "#f59e0b",
          lineWidth: 1,
          lineStyle: 1,
          axisLabelVisible: true,
          title: `${ob.type === "bullish" ? "Bull" : "Bear"} OB`,
        });
        priceLinesRef.current.push(line);
      });
    }

    // ONLY fit content on initial chart load per symbol to PRESERVE user manual zoom & scroll position!
    if (chartRef.current && !hasFittedRef.current) {
      chartRef.current.timeScale().fitContent();
      hasFittedRef.current = true;
    }
  }, [candles, showSMC, livePrice, chartType]);

  const activeTypeObj = CHART_TYPE_OPTIONS.find((t) => t.id === chartType) ?? CHART_TYPE_OPTIONS[0];

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Top Header Control Toolbar (Positioned Above Chart Canvas) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
          position: "relative",
          zIndex: 30,
        }}
      >
        {/* Chart Style Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            style={{
              padding: "5px 12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              color: "var(--color-text-primary)",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <span>{activeTypeObj?.icon}</span>
            <span>{activeTypeObj?.label}</span>
            <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>▼</span>
          </button>

          {showTypeMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "4px",
                background: "#0e1726",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "6px",
                padding: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minWidth: "135px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
                zIndex: 40,
              }}
            >
              {CHART_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setChartType(opt.id);
                    setShowTypeMenu(false);
                  }}
                  style={{
                    padding: "6px 10px",
                    fontSize: "0.75rem",
                    fontWeight: opt.id === chartType ? 600 : 400,
                    textAlign: "left",
                    background: opt.id === chartType ? "rgba(59, 130, 246, 0.2)" : "transparent",
                    color: opt.id === chartType ? "var(--color-brand-400)" : "var(--color-text-secondary)",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SMC Overlay Switcher */}
        <button
          onClick={() => setShowSMC(!showSMC)}
          style={{
            padding: "5px 12px",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: showSMC ? "rgba(59, 130, 246, 0.2)" : "var(--color-bg-surface)",
            border: `1px solid ${showSMC ? "var(--color-brand-400)" : "var(--color-border-subtle)"}`,
            color: showSMC ? "var(--color-brand-400)" : "var(--color-text-muted)",
            borderRadius: "6px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          SMC Overlay: {showSMC ? "ON (FVG / OB)" : "OFF"}
        </button>
      </div>

      {/* Unobscured Clean Chart Canvas */}
      <div ref={containerRef} style={{ width: "100%", height }} />
    </div>
  );
}

export default memo(CandlestickChart);
