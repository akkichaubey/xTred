import { describe, it, expect } from "vitest";
import { toDeltaSymbol } from "../src/lib/delta/client";

describe("Delta Exchange Symbol Normalizer", () => {
  it("should map BTCUSD to BTCUSDT for Delta Exchange API compliance", () => {
    expect(toDeltaSymbol("BTCUSD")).toBe("BTCUSDT");
    expect(toDeltaSymbol("ETHUSD")).toBe("ETHUSDT");
    expect(toDeltaSymbol("SOLUSD")).toBe("SOLUSDT");
  });

  it("should preserve existing BTCUSDT symbols unchanged", () => {
    expect(toDeltaSymbol("BTCUSDT")).toBe("BTCUSDT");
    expect(toDeltaSymbol("DOGEUSDT")).toBe("DOGEUSDT");
  });
});
