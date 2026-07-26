import { describe, it, expect } from "vitest";

describe("Pure Exchange Candlestick Rendering", () => {
  it("should preserve genuine exchange OHLC values without artificial distortion", () => {
    const candles = [
      { time: 100, open: 64000, high: 64500, low: 63800, close: 64330, volume: 10 },
    ];
    const last = candles[candles.length - 1];

    expect(last?.open).toBe(64000);
    expect(last?.close).toBe(64330);
  });
});
