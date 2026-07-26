import { describe, it, expect } from "vitest";
import { MARKET_REGISTRY } from "../src/lib/constants/markets";

describe("Markets Overview Engine", () => {
  it("should contain registry items for all category filters", () => {
    const markets = Object.values(MARKET_REGISTRY);
    const crypto = markets.filter((m) => m.category === "crypto");
    const commodity = markets.filter((m) => m.category === "commodity");
    const fx = markets.filter((m) => m.category === "fx");

    expect(crypto.length).toBeGreaterThan(0);
    expect(commodity.length).toBeGreaterThan(0);
    expect(fx.length).toBeGreaterThan(0);
  });
});
