import { describe, it, expect } from "vitest";
import { calculateJournalAnalytics, JournalTrade } from "../src/lib/journal/analytics";

describe("Trade Journal Analytics Calculator", () => {
  it("should correctly compute win rate and profit factor", () => {
    const trades: JournalTrade[] = [
      { pnl: 500 },
      { pnl: -200 },
      { pnl: 300 },
      { pnl: -100 },
    ];

    const stats = calculateJournalAnalytics(trades);

    expect(stats.totalTrades).toBe(4);
    expect(stats.winningTrades).toBe(2);
    expect(stats.losingTrades).toBe(2);
    expect(stats.winRatePct).toBe(50);
    expect(stats.grossProfitUsd).toBe(800);
    expect(stats.grossLossUsd).toBe(300);
    expect(stats.profitFactor).toBe(2.67);
    expect(stats.expectancyUsd).toBe(125);
  });

  it("should return zeros when no closed trades exist", () => {
    const stats = calculateJournalAnalytics([]);
    expect(stats.closedTrades).toBe(0);
    expect(stats.winRatePct).toBe(0);
    expect(stats.profitFactor).toBe(0);
  });
});
