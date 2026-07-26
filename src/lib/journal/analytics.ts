export interface JournalTrade {
  pnl?: number | null;
  entry_price?: number | null;
  exit_price?: number | null;
}

export interface PerformanceAnalytics {
  totalTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  grossProfitUsd: number;
  grossLossUsd: number;
  netPnlUsd: number;
  profitFactor: number;
  maxDrawdownPct: number;
  expectancyUsd: number;
}

export function calculateJournalAnalytics(trades: JournalTrade[]): PerformanceAnalytics {
  const closed = trades.filter((t) => t.pnl !== undefined && t.pnl !== null);
  const totalTrades = trades.length;
  const closedTrades = closed.length;

  if (closedTrades === 0) {
    return {
      totalTrades,
      closedTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRatePct: 0,
      grossProfitUsd: 0,
      grossLossUsd: 0,
      netPnlUsd: 0,
      profitFactor: 0,
      maxDrawdownPct: 0,
      expectancyUsd: 0,
    };
  }

  let winningTrades = 0;
  let losingTrades = 0;
  let grossProfitUsd = 0;
  let grossLossUsd = 0;

  let peakPnl = 0;
  let currentCumulativePnl = 0;
  let maxDrawdownUsd = 0;

  closed.forEach((t) => {
    const pnl = t.pnl || 0;
    currentCumulativePnl += pnl;

    if (currentCumulativePnl > peakPnl) {
      peakPnl = currentCumulativePnl;
    }

    const drawdown = peakPnl - currentCumulativePnl;
    if (drawdown > maxDrawdownUsd) {
      maxDrawdownUsd = drawdown;
    }

    if (pnl > 0) {
      winningTrades++;
      grossProfitUsd += pnl;
    } else if (pnl < 0) {
      losingTrades++;
      grossLossUsd += Math.abs(pnl);
    }
  });

  const netPnlUsd = grossProfitUsd - grossLossUsd;
  const winRatePct = Math.round((winningTrades / closedTrades) * 1000) / 10;
  const profitFactor =
    grossLossUsd > 0
      ? Math.round((grossProfitUsd / grossLossUsd) * 100) / 100
      : grossProfitUsd > 0
      ? 99.99
      : 0;

  const expectancyUsd = Math.round((netPnlUsd / closedTrades) * 100) / 100;
  const maxDrawdownPct =
    peakPnl > 0 ? Math.round((maxDrawdownUsd / peakPnl) * 1000) / 10 : 0;

  return {
    totalTrades,
    closedTrades,
    winningTrades,
    losingTrades,
    winRatePct,
    grossProfitUsd: Math.round(grossProfitUsd * 100) / 100,
    grossLossUsd: Math.round(grossLossUsd * 100) / 100,
    netPnlUsd: Math.round(netPnlUsd * 100) / 100,
    profitFactor,
    maxDrawdownPct,
    expectancyUsd,
  };
}
