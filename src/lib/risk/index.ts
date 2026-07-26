import type { RiskLimits, RiskStatus } from "@/types";

/**
 * xTred Risk Management Calculators — Section 29
 *
 * These are pure functions: no side effects, fully testable.
 * The UI enforces these limits visually — the app never places trades.
 */

/**
 * Calculate position size based on max risk % of account.
 *
 * @param accountBalance - Total account balance in USD
 * @param maxRiskPct - Max risk per trade as % (e.g., 1.0 = 1%)
 * @param entryPrice - Intended entry price
 * @param stopLossPrice - Stop loss price (required — xTred never suggests removing stop-loss)
 * @returns Position size in contracts/units and risk amount in USD
 */
export function calculatePositionSize(
  accountBalance: number,
  maxRiskPct: number,
  entryPrice: number,
  stopLossPrice: number
): {
  riskAmountUSD: number;
  stopDistancePct: number;
  positionSizeUSD: number;
  positionSizeContracts: number;
  maxLeverageImplied: number;
} {
  const riskAmountUSD = (accountBalance * maxRiskPct) / 100;
  const stopDistancePct = Math.abs(entryPrice - stopLossPrice) / entryPrice;

  if (stopDistancePct === 0) {
    throw new Error("Stop loss price cannot equal entry price");
  }

  const positionSizeUSD = riskAmountUSD / stopDistancePct;
  const positionSizeContracts = positionSizeUSD / entryPrice;
  const maxLeverageImplied = positionSizeUSD / accountBalance;

  return {
    riskAmountUSD: Math.round(riskAmountUSD * 100) / 100,
    stopDistancePct: Math.round(stopDistancePct * 10000) / 100, // as %
    positionSizeUSD: Math.round(positionSizeUSD * 100) / 100,
    positionSizeContracts: Math.round(positionSizeContracts * 10000) / 10000,
    maxLeverageImplied: Math.round(maxLeverageImplied * 10) / 10,
  };
}

/**
 * Evaluate current risk status against daily/weekly limits.
 */
export function evaluateRiskStatus(
  limits: RiskLimits,
  dailyPnLPct: number,   // negative = loss, e.g. -2.5 means -2.5%
  weeklyPnLPct: number
): RiskStatus {
  const dailyUsed = Math.abs(Math.min(dailyPnLPct, 0)); // only losses count
  const weeklyUsed = Math.abs(Math.min(weeklyPnLPct, 0));

  const isDailyBreached = dailyUsed >= limits.risk_max_daily_pct;
  const isWeeklyBreached = weeklyUsed >= limits.risk_max_weekly_pct;

  return {
    daily_used_pct: Math.round(dailyUsed * 100) / 100,
    weekly_used_pct: Math.round(weeklyUsed * 100) / 100,
    is_daily_breached: isDailyBreached,
    is_weekly_breached: isWeeklyBreached,
    should_stop_trading: isDailyBreached || isWeeklyBreached,
  };
}

/**
 * Format a risk status message for the UI stop-trading banner.
 */
export function getRiskStatusMessage(status: RiskStatus, limits: RiskLimits): string {
  if (status.is_weekly_breached) {
    return `🛑 WEEKLY LOSS LIMIT HIT — ${status.weekly_used_pct.toFixed(2)}% of ${limits.risk_max_weekly_pct}% used. Stop trading for the rest of the week.`;
  }
  if (status.is_daily_breached) {
    return `🛑 DAILY LOSS LIMIT HIT — ${status.daily_used_pct.toFixed(2)}% of ${limits.risk_max_daily_pct}% used. Stop trading for today.`;
  }
  if (status.daily_used_pct >= limits.risk_max_daily_pct * 0.75) {
    return `⚠ Approaching daily limit — ${status.daily_used_pct.toFixed(2)}% / ${limits.risk_max_daily_pct}% used.`;
  }
  return "";
}

/**
 * Calculate R:R ratio for display.
 */
export function calculateRiskReward(
  entryPrice: number,
  targetPrice: number,
  stopLossPrice: number
): { ratio: number; riskPct: number; rewardPct: number } {
  const risk = Math.abs(entryPrice - stopLossPrice);
  const reward = Math.abs(targetPrice - entryPrice);
  const riskPct = (risk / entryPrice) * 100;
  const rewardPct = (reward / entryPrice) * 100;
  const ratio = reward / risk;

  return {
    ratio: Math.round(ratio * 100) / 100,
    riskPct: Math.round(riskPct * 100) / 100,
    rewardPct: Math.round(rewardPct * 100) / 100,
  };
}
