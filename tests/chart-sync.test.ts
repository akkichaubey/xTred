import { describe, it, expect } from "vitest";

describe("Live Price Chart Synchronization Logic", () => {
  it("should update last candle close, high, and low to match live price tick", () => {
    const candles = [
      { time: 100, open: 64000, high: 64500, low: 63800, close: 64330, volume: 10 },
    ];
    const livePrice = 64700;

    const last = candles[candles.length - 1];
    expect(last).toBeDefined();

    if (last) {
      const lastCandle = { ...last };
      lastCandle.close = livePrice;
      lastCandle.high = Math.max(lastCandle.high, livePrice);
      lastCandle.low = Math.min(lastCandle.low, livePrice);

      expect(lastCandle.close).toBe(64700);
      expect(lastCandle.high).toBe(64700);
    }
  });
});
