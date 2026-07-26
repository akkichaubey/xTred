export interface CandleData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface FVGLevel {
  type: "bullish" | "bearish";
  top: number;
  bottom: number;
  candleIndex: number;
  time: number | string;
}

export interface OrderBlockLevel {
  type: "bullish" | "bearish";
  top: number;
  bottom: number;
  candleIndex: number;
  time: number | string;
}

/**
 * Detect Fair Value Gaps (FVG) from candle history.
 */
export function detectFVGs(candles: CandleData[]): FVGLevel[] {
  const fvgs: FVGLevel[] = [];
  if (candles.length < 3) return fvgs;

  for (let i = 2; i < candles.length; i++) {
    const c1 = candles[i - 2];
    const c2 = candles[i - 1];
    const c3 = candles[i];

    if (!c1 || !c2 || !c3) continue;

    // Bullish FVG (Gap up)
    if (c3.low > c1.high) {
      fvgs.push({
        type: "bullish",
        top: c3.low,
        bottom: c1.high,
        candleIndex: i - 1,
        time: c2.time,
      });
    }
    // Bearish FVG (Gap down)
    else if (c3.high < c1.low) {
      fvgs.push({
        type: "bearish",
        top: c1.low,
        bottom: c3.high,
        candleIndex: i - 1,
        time: c2.time,
      });
    }
  }

  return fvgs;
}

/**
 * Detect Order Blocks (OB) from candle history.
 */
export function detectOrderBlocks(candles: CandleData[]): OrderBlockLevel[] {
  const obs: OrderBlockLevel[] = [];
  if (candles.length < 3) return obs;

  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];

    if (!prev || !curr || !next) continue;

    const bodySize = Math.abs(curr.close - curr.open);
    const avgBody = (Math.abs(prev.close - prev.open) + bodySize) / 2;

    // Strong Bullish expansion candle
    if (next.close > next.open && Math.abs(next.close - next.open) > avgBody * 1.5) {
      if (curr.close < curr.open) {
        obs.push({
          type: "bullish",
          top: Math.max(curr.open, curr.close),
          bottom: curr.low,
          candleIndex: i,
          time: curr.time,
        });
      }
    }

    // Strong Bearish expansion candle
    if (next.close < next.open && Math.abs(next.close - next.open) > avgBody * 1.5) {
      if (curr.close > curr.open) {
        obs.push({
          type: "bearish",
          top: curr.high,
          bottom: Math.min(curr.open, curr.close),
          candleIndex: i,
          time: curr.time,
        });
      }
    }
  }

  return obs;
}
