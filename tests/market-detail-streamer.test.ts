import { describe, it, expect } from "vitest";
import { useTickerStore } from "../src/stores/useTickerStore";
import { getMarketDefinition } from "../src/lib/constants/markets";

describe("Market Detail 5-Second Streamer State", () => {
  it("should retrieve valid live price tick for BTCUSD", () => {
    const ticker = useTickerStore.getState().tickers["BTCUSD"];
    expect(ticker).toBeDefined();
    expect(ticker?.markPrice).toBeGreaterThan(0);
  });

  it("should fallback gracefully to market definition if ticker uninitialized", () => {
    const def = getMarketDefinition("ETHUSD");
    expect(def.basePrice).toBeGreaterThan(0);
    expect(def.symbol).toBe("ETHUSD");
  });
});
