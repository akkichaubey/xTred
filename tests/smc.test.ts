import { describe, it, expect } from "vitest";
import { detectFVGs, detectOrderBlocks, CandleData } from "../src/lib/smc/detector";

describe("Smart Money Concepts (SMC) Detector", () => {
  it("should correctly detect a Bullish Fair Value Gap (FVG)", () => {
    const candles: CandleData[] = [
      { time: 1000, open: 100, high: 105, low: 98, close: 102 },
      { time: 2000, open: 103, high: 115, low: 103, close: 114 },
      { time: 3000, open: 114, high: 120, low: 108, close: 118 }, // Low 108 > C1 High 105
    ];

    const fvgs = detectFVGs(candles);
    expect(fvgs.length).toBe(1);
    expect(fvgs[0]?.type).toBe("bullish");
    expect(fvgs[0]?.bottom).toBe(105);
    expect(fvgs[0]?.top).toBe(108);
  });

  it("should correctly detect a Bearish Fair Value Gap (FVG)", () => {
    const candles: CandleData[] = [
      { time: 1000, open: 120, high: 122, low: 115, close: 116 },
      { time: 2000, open: 115, high: 115, low: 100, close: 101 },
      { time: 3000, open: 101, high: 110, low: 95, close: 96 }, // High 110 < C1 Low 115
    ];

    const fvgs = detectFVGs(candles);
    expect(fvgs.length).toBe(1);
    expect(fvgs[0]?.type).toBe("bearish");
    expect(fvgs[0]?.top).toBe(115);
    expect(fvgs[0]?.bottom).toBe(110);
  });

  it("should detect Order Blocks prior to expansion moves", () => {
    const candles: CandleData[] = [
      { time: 1000, open: 100, high: 102, low: 99, close: 101 },
      { time: 2000, open: 101, high: 101, low: 95, close: 96 }, // Down candle (OB candidate)
      { time: 3000, open: 96, high: 120, low: 96, close: 119 }, // Strong bullish expansion
    ];

    const obs = detectOrderBlocks(candles);
    expect(obs.length).toBeGreaterThan(0);
    expect(obs[0]?.type).toBe("bullish");
  });
});
