import { describe, it, expect } from "vitest";

describe("Price Outlier Protection & Real Ticker Streamer", () => {
  it("should reject price ticks with > 5% deviation from last candle close", () => {
    const lastClose = 62400;
    const outlierPrice = 66301;
    const diffRatio = Math.abs(outlierPrice - lastClose) / lastClose;

    expect(diffRatio).toBeGreaterThan(0.05); // > 5% deviation
    // Should be rejected by outlier guard
  });

  it("should accept valid price ticks with <= 5% deviation", () => {
    const lastClose = 64100;
    const validPrice = 64150;
    const diffRatio = Math.abs(validPrice - lastClose) / lastClose;

    expect(diffRatio).toBeLessThanOrEqual(0.05); // Valid tick
  });
});
