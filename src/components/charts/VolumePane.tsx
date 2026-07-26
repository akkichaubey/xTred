"use client";

import { useEffect, useRef, memo } from "react";
import {
  createChart,
  HistogramSeries as HistogramSeriesDef,
  type IChartApi,
  type HistogramData,
  type Time,
  ColorType,
} from "lightweight-charts";
import type { DeltaCandle } from "@/lib/delta/types";

interface VolumePaneProps {
  candles: DeltaCandle[];
  height?: number;
}

function VolumePane({ candles, height = 120 }: VolumePaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8b9ab4",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "#1a2233", style: 1 },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderColor: "#1e2a3a",
        scaleMargins: { top: 0.1, bottom: 0 },
      },
      timeScale: {
        borderColor: "#1e2a3a",
        visible: false,
      },
      crosshair: {
        vertLine: { color: "#2d3d57", width: 1 },
        horzLine: { visible: false },
      },
    });

    // LW Charts v5: addSeries(definition, options)
    const series = chart.addSeries(HistogramSeriesDef, {
      priceFormat: { type: "volume" },
      priceScaleId: "right",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) chart.applyOptions({ width: entry.contentRect.width });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const data: HistogramData[] = candles
      .map((c) => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open
          ? "rgba(16, 185, 129, 0.45)"
          : "rgba(239, 68, 68, 0.45)",
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    seriesRef.current.setData(data);
  }, [candles]);

  return (
    <div style={{ width: "100%" }}>
      {candles.length === 0 ? (
        <div className="skeleton" style={{ height }} />
      ) : (
        <div ref={containerRef} style={{ height, width: "100%" }} />
      )}
    </div>
  );
}

export default memo(VolumePane);
