"use client";

import { useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { useUIStore } from "@/stores/ui-store";
import { useTickerStore } from "@/stores/useTickerStore";
import { placeLiveOrderAction } from "@/app/actions/trading";
import type { OrderSide, OrderType, OrderRequest } from "@/types/trading";
import { AlertCircle, ArrowDownRight, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";

export function OrderEntryPanel() {
  const { activeSymbol } = useUIStore();
  const { tickers } = useTickerStore();
  const { tradingMode, demoWallet, liveWallet, placeDemoOrder, isExecuting, setIsExecuting } = useTradingStore();

  const currentPrice = tickers[activeSymbol]?.markPrice ?? tickers[activeSymbol]?.close ?? tickers["BTCUSD"]?.markPrice ?? 64750;

  // Form State
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [size, setSize] = useState<string>("0.1");
  const [price, setPrice] = useState<string>("");
  const [stopPrice, setStopPrice] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(10);
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");

  // Feedback State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLiveOrderConfirm, setShowLiveOrderConfirm] = useState<boolean>(false);

  const numSize = parseFloat(size) || 0;
  const numPrice = orderType === "market" ? currentPrice : parseFloat(price) || currentPrice;
  const notionalValue = numSize * numPrice;
  const requiredMargin = leverage > 0 ? notionalValue / leverage : notionalValue;
  const estimatedFee = notionalValue * 0.0005;

  const currentWallet = tradingMode === "demo" ? demoWallet : liveWallet || demoWallet;
  const isInsufficientMargin = requiredMargin + estimatedFee > currentWallet.availableMargin;

  // Liquidation Price Estimate
  const liqOffset = (numPrice / leverage) * 0.9;
  const estimatedLiqPrice = Math.max(
    0.0001,
    side === "buy" ? numPrice - liqOffset : numPrice + liqOffset
  );

  const buildOrderRequest = (): OrderRequest => ({
    symbol: activeSymbol,
    side,
    orderType,
    size: numSize,
    price: orderType !== "market" && price ? parseFloat(price) : undefined,
    stopPrice: (orderType === "stop_market" || orderType === "take_profit_market") && stopPrice ? parseFloat(stopPrice) : undefined,
    leverage,
    stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
    takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (numSize <= 0) {
      setErrorMessage("Please enter a valid position size greater than 0.");
      return;
    }

    if (isInsufficientMargin) {
      setErrorMessage(`Insufficient available margin ($${currentWallet.availableMargin.toFixed(2)} available).`);
      return;
    }

    if (tradingMode === "live") {
      setShowLiveOrderConfirm(true);
      return;
    }

    // Demo Mode Execution
    executeOrderPlacement();
  };

  const executeOrderPlacement = async () => {
    setIsExecuting(true);
    const req = buildOrderRequest();

    if (tradingMode === "demo") {
      const res = placeDemoOrder(req, currentPrice);
      setIsExecuting(false);
      setShowLiveOrderConfirm(false);

      if (res.success) {
        setSuccessMessage(`Virtual ${side.toUpperCase()} order placed successfully!`);
      } else {
        setErrorMessage(res.error || "Failed to place demo order.");
      }
    } else {
      // Live Mode Execution via Server Action
      const res = await placeLiveOrderAction(req);
      setIsExecuting(false);
      setShowLiveOrderConfirm(false);

      if (res.success) {
        setSuccessMessage(res.message || "Live order submitted to Delta Exchange!");
      } else {
        setErrorMessage(res.error || "Failed to place live order.");
      }
    }
  };

  return (
    <div className="card p-4 space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
        <h3 className="font-display font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
          <span>Order Entry</span>
          <span className="text-xs font-mono font-normal text-[var(--color-text-secondary)]">
            ({activeSymbol})
          </span>
        </h3>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            tradingMode === "demo"
              ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]"
              : "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)]"
          }`}
        >
          {tradingMode === "demo" ? <ShieldCheck className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
          {tradingMode} Mode
        </span>
      </div>

      {/* Side Selector (Long / Buy vs Short / Sell) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius-md)] text-xs font-bold transition-all cursor-pointer ${
            side === "buy"
              ? "bg-[var(--color-bullish)] text-black shadow-[var(--shadow-bullish-glow)]"
              : "bg-[var(--color-bg-overlay)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>BUY / LONG</span>
        </button>

        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius-md)] text-xs font-bold transition-all cursor-pointer ${
            side === "sell"
              ? "bg-[var(--color-bearish)] text-white shadow-[var(--shadow-bearish-glow)]"
              : "bg-[var(--color-bg-overlay)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>SELL / SHORT</span>
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className="flex rounded-[var(--radius-md)] bg-[var(--color-bg-base)] p-1 border border-[var(--color-border-subtle)] text-xs">
        {(["market", "limit", "stop_market", "take_profit_market"] as OrderType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setOrderType(t)}
            className={`flex-1 py-1 text-center font-medium rounded-[var(--radius-sm)] transition-colors cursor-pointer capitalize ${
              orderType === t
                ? "bg-[var(--color-bg-overlay)] text-[var(--color-text-primary)] font-semibold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            {t.replace("_market", "").replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {/* Quantity Field */}
        <div>
          <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mb-1">
            <span>Size (Contracts / Amount)</span>
            <span>Mark: ${currentPrice.toLocaleString("en-US")}</span>
          </div>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-text-primary)] font-mono focus:border-[var(--color-brand-500)] outline-none"
            placeholder="0.1"
            required
          />
        </div>

        {/* Limit Price Field */}
        {orderType === "limit" && (
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1">Limit Price ($)</label>
            <input
              type="number"
              step="0.1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-text-primary)] font-mono focus:border-[var(--color-brand-500)] outline-none"
              placeholder={currentPrice.toString()}
              required
            />
          </div>
        )}

        {/* Stop Price Field */}
        {(orderType === "stop_market" || orderType === "take_profit_market") && (
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1">Trigger Stop Price ($)</label>
            <input
              type="number"
              step="0.1"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-text-primary)] font-mono focus:border-[var(--color-brand-500)] outline-none"
              placeholder={currentPrice.toString()}
              required
            />
          </div>
        )}

        {/* Leverage Slider */}
        <div>
          <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mb-1">
            <span>Leverage</span>
            <span className="font-mono font-bold text-[var(--color-brand-400)]">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full accent-[var(--color-brand-500)] cursor-pointer"
          />
        </div>

        {/* SL / TP Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--color-text-muted)] block mb-1">Stop Loss ($)</label>
            <input
              type="number"
              step="0.1"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] px-2 py-1.5 text-[var(--color-text-primary)] font-mono text-xs focus:border-[var(--color-bearish)] outline-none"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="text-[10px] text-[var(--color-text-muted)] block mb-1">Take Profit ($)</label>
            <input
              type="number"
              step="0.1"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] px-2 py-1.5 text-[var(--color-text-primary)] font-mono text-xs focus:border-[var(--color-bullish)] outline-none"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Pre-Trade Risk Summary */}
        <div className="bg-[var(--color-bg-base)] p-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] space-y-1.5 tabular-nums text-[11px]">
          <div className="flex justify-between text-[var(--color-text-muted)]">
            <span>Required Margin</span>
            <span className="font-mono text-[var(--color-text-primary)] font-semibold">
              ${requiredMargin.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-[var(--color-text-muted)]">
            <span>Est. Order Fee (0.05%)</span>
            <span className="font-mono text-[var(--color-text-secondary)]">
              ${estimatedFee.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-[var(--color-text-muted)]">
            <span>Est. Liquidation Price</span>
            <span className="font-mono text-[var(--color-bearish)] font-semibold">
              ${estimatedLiqPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bearish-dim)] text-[var(--color-bearish)] text-xs flex items-center gap-2 border border-[var(--color-bearish)]/30">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bullish-dim)] text-[var(--color-bullish)] text-xs flex items-center gap-2 border border-[var(--color-bullish)]/30">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Submit Order Button */}
        <button
          type="submit"
          disabled={isExecuting || isInsufficientMargin}
          className={`w-full py-3 rounded-[var(--radius-md)] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
            isInsufficientMargin
              ? "bg-[var(--color-bg-overlay)] text-[var(--color-text-disabled)] cursor-not-allowed"
              : side === "buy"
              ? "bg-[var(--color-bullish)] text-black hover:bg-emerald-400 shadow-[var(--shadow-bullish-glow)]"
              : "bg-[var(--color-bearish)] text-white hover:bg-red-600 shadow-[var(--shadow-bearish-glow)]"
          }`}
        >
          {isExecuting
            ? "Executing Order..."
            : isInsufficientMargin
            ? "Insufficient Margin"
            : `Place ${tradingMode.toUpperCase()} ${side.toUpperCase()} Order`}
        </button>
      </form>

      {/* Confirmation Modal for Live Trading Order Placement */}
      {showLiveOrderConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="card-elevated max-w-md w-full p-6 space-y-4 border border-[var(--color-bearish)]/50">
            <div className="flex items-center gap-3 text-[var(--color-bearish)]">
              <Zap className="w-6 h-6" />
              <h3 className="font-display font-bold text-base text-[var(--color-text-primary)]">
                Confirm Live Order Placement
              </h3>
            </div>

            <div className="bg-[var(--color-bg-base)] p-3.5 rounded-[var(--radius-md)] space-y-2 text-xs font-mono border border-[var(--color-border-subtle)]">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Symbol:</span>
                <span className="text-[var(--color-text-primary)]">{activeSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Side:</span>
                <span className={side === "buy" ? "text-[var(--color-bullish)] font-bold" : "text-[var(--color-bearish)] font-bold"}>
                  {side.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Order Type:</span>
                <span className="text-[var(--color-text-primary)]">{orderType.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Size:</span>
                <span className="text-[var(--color-text-primary)]">{numSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Leverage:</span>
                <span className="text-[var(--color-brand-400)]">{leverage}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Required Margin:</span>
                <span className="text-[var(--color-text-primary)]">${requiredMargin.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--color-bearish)] leading-relaxed">
              ⚠️ Warning: This will submit a real order to Delta Exchange. Real funds will be executed immediately.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowLiveOrderConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] text-[var(--color-text-primary)] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeOrderPlacement}
                disabled={isExecuting}
                className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] bg-[var(--color-bearish)] text-white hover:bg-red-600 shadow-[var(--shadow-bearish-glow)] cursor-pointer"
              >
                {isExecuting ? "Submitting..." : "Confirm Live Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
