import { describe, it, expect } from "vitest";
import { useTickerStore } from "../src/stores/useTickerStore";

describe("Custom Symbol Search & Management Store", () => {
  it("should add a new custom symbol and set it active", () => {
    useTickerStore.getState().addCustomSymbol("AVAXUSD");

    const symbols = useTickerStore.getState().customSymbols;
    const active = useTickerStore.getState().activeSymbol;

    expect(symbols).toContain("AVAXUSD");
    expect(active).toBe("AVAXUSD");
  });

  it("should remove a custom symbol and fallback to next active symbol", () => {
    useTickerStore.getState().removeCustomSymbol("AVAXUSD");

    const symbols = useTickerStore.getState().customSymbols;
    expect(symbols).not.toContain("AVAXUSD");
  });
});
