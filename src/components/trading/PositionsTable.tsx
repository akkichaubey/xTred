"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useTickerStore } from "@/stores/useTickerStore";
import { useEffect } from "react";
import { XCircle, TrendingUp, TrendingDown } from "lucide-react";

export function PositionsTable() {
  const { tradingMode, demoPositions, livePositions, closeDemoPosition, processPriceTick } =
    useTradingStore();
  const { tickers } = useTickerStore();

  const isDemo = tradingMode === "demo";
  const positions = isDemo ? demoPositions : livePositions;

  // Process live WS price ticks to update virtual positions PnL
  useEffect(() => {
    if (!isDemo) return;

    Object.entries(tickers).forEach(([symbol, ticker]) => {
      const price = ticker.markPrice ?? ticker.close;
      if (price) {
        processPriceTick(symbol, price);
      }
    });
  }, [tickers, isDemo, processPriceTick]);

  return (
    <div className="card p-4 space-y-3 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-sm text-[var(--color-text-primary)]">
            Open Positions
          </h3>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            ({positions.length})
          </span>
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isDemo
              ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]"
              : "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)]"
          }`}
        >
          {tradingMode} Engine
        </span>
      </div>

      {positions.length === 0 ? (
        <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-base)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
          No open {tradingMode} positions. Use the Order Entry panel to open a trade.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table text-xs">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Size</th>
                <th>Entry Price</th>
                <th>Mark Price</th>
                <th>Margin</th>
                <th>Liq. Price</th>
                <th>Unrealized P&L</th>
                <th>SL / TP</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                const liveTicker = tickers[pos.symbol];
                const markPrice = liveTicker?.markPrice ?? liveTicker?.close ?? pos.markPrice;
                const sideMultiplier = pos.side === "buy" ? 1 : -1;
                const pnl = (markPrice - pos.entryPrice) * pos.size * sideMultiplier;
                const pnlPct = pos.margin > 0 ? (pnl / pos.margin) * 100 : 0;
                const isPositive = pnl >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-[var(--color-bg-overlay)] transition-colors">
                    <td className="font-bold text-[var(--color-text-primary)] font-mono">
                      {pos.symbol}
                    </td>

                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          pos.side === "buy"
                            ? "bg-[var(--color-bullish-dim)] text-[var(--color-bullish)]"
                            : "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)]"
                        }`}
                      >
                        {pos.side === "buy" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {pos.side.toUpperCase()} {pos.leverage}x
                      </span>
                    </td>

                    <td className="font-mono text-[var(--color-text-primary)]">{pos.size}</td>

                    <td className="font-mono text-[var(--color-text-secondary)]">
                      ${pos.entryPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="font-mono text-[var(--color-text-primary)] font-semibold">
                      ${markPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="font-mono text-[var(--color-text-muted)]">
                      ${pos.margin.toFixed(2)}
                    </td>

                    <td className="font-mono text-[var(--color-bearish)]">
                      ${pos.liquidationPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="font-mono font-bold">
                      <span className={isPositive ? "text-[var(--color-bullish)]" : "text-[var(--color-bearish)]"}>
                        {isPositive ? "+" : ""}
                        ${pnl.toFixed(2)} ({isPositive ? "+" : ""}
                        {pnlPct.toFixed(2)}%)
                      </span>
                    </td>

                    <td className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      <div>SL: {pos.stopLoss ? `$${pos.stopLoss}` : "-"}</div>
                      <div>TP: {pos.takeProfit ? `$${pos.takeProfit}` : "-"}</div>
                    </td>

                    <td className="text-right">
                      {isDemo ? (
                        <button
                          type="button"
                          onClick={() => closeDemoPosition(pos.id, markPrice)}
                          className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-bearish-dim)] hover:bg-[var(--color-bearish)] text-[var(--color-bearish)] hover:text-white text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Close</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--color-text-muted)]">Live API</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
