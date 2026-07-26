import { describe, it, expect } from "vitest";
import { calculatePositionSize, evaluateRiskStatus } from "../src/lib/risk";

describe("Section 29 Risk Management Calculators", () => {
  it("should correctly calculate maximum position size based on account balance and risk %", () => {
    // Balance: $10,000, Max Risk: 1%, Entry: $66,000, Stop Loss: $64,680 (2% stop distance)
    // Max Risk Amount = $100. Position size = $100 / 0.02 = $5,000
    const result = calculatePositionSize(10000, 1.0, 66000, 64680);

    expect(result.riskAmountUSD).toBe(100);
    expect(result.positionSizeUSD).toBeCloseTo(5000, 0);
  });

  it("should trigger daily loss limit breach warning when threshold exceeded", () => {
    const limits = {
      risk_max_trade_pct: 1.0,
      risk_max_daily_pct: 3.0,
      risk_max_weekly_pct: 6.0,
    };

    // Daily loss is -3.5% (exceeds 3.0% limit)
    const status = evaluateRiskStatus(limits, -3.5, -1.0);

    expect(status.is_daily_breached).toBe(true);
    expect(status.should_stop_trading).toBe(true);
  });

  it("should not breach daily loss limit when loss is within limit", () => {
    const limits = {
      risk_max_trade_pct: 1.0,
      risk_max_daily_pct: 3.0,
      risk_max_weekly_pct: 6.0,
    };

    // Daily loss is -1.5% (within 3.0% limit)
    const status = evaluateRiskStatus(limits, -1.5, -1.0);

    expect(status.is_daily_breached).toBe(false);
    expect(status.should_stop_trading).toBe(false);
  });

  it("should trigger weekly loss limit breach warning when threshold exceeded", () => {
    const limits = {
      risk_max_trade_pct: 1.0,
      risk_max_daily_pct: 3.0,
      risk_max_weekly_pct: 6.0,
    };

    // Weekly loss is -6.5% (exceeds 6.0% limit)
    const status = evaluateRiskStatus(limits, -1.0, -6.5);

    expect(status.is_weekly_breached).toBe(true);
    expect(status.should_stop_trading).toBe(true);
  });
});
