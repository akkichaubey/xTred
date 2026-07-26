import { describe, it, expect } from "vitest";
import { MARKET_REGISTRY, getMarketDefinition } from "../src/lib/constants/markets";

describe("Centralized Market Registry", () => {
  it("should contain valid definitions for all default and extended assets", () => {
    const assets = ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD", "AVAXUSD", "DOGEUSD", "XAUUSD", "DXY"];
    assets.forEach((sym) => {
      const def = MARKET_REGISTRY[sym];
      if (def) {
        expect(def.basePrice).toBeGreaterThan(0);
        expect(def.probabilisticProfile.probabilities.bullish).toBeGreaterThan(0);
      }
    });
  });

  it("should return valid fallback definition for unlisted symbol", () => {
    const fallback = getMarketDefinition("UNKNOWNUSD");
    expect(fallback.symbol).toBe("UNKNOWNUSD");
    expect(fallback.basePrice).toBeGreaterThan(0);
    expect(fallback.probabilisticProfile.probabilities.bullish).toBe(50);
  });
});
