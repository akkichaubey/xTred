import { describe, it, expect } from "vitest";
import { useTickerStore } from "../src/stores/useTickerStore";

describe("Zustand Live Ticker Store", () => {
  it("should correctly update active symbol", () => {
    useTickerStore.getState().setActiveSymbol("ETHUSD");
    expect(useTickerStore.getState().activeSymbol).toBe("ETHUSD");
  });

  it("should correctly update ticker price data dynamically", () => {
    useTickerStore.getState().setTicker("SOLUSD", { markPrice: 192.8, change24hPct: 5.4 });
    const sol = useTickerStore.getState().tickers["SOLUSD"];
    expect(sol?.markPrice).toBe(192.8);
    expect(sol?.change24hPct).toBe(5.4);
  });
});
