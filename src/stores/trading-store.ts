import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  TradingMode,
  Position,
  Order,
  TradeLog,
  WalletBalance,
  OrderRequest,
} from "@/types/trading";

interface TradingState {
  // Trading Mode
  tradingMode: TradingMode;
  setTradingMode: (mode: TradingMode) => void;
  isLiveConfirmOpen: boolean;
  setLiveConfirmOpen: (open: boolean) => void;

  // Execution Protection
  isExecuting: boolean;
  setIsExecuting: (executing: boolean) => void;

  // Demo Trading State
  demoWallet: WalletBalance;
  demoPositions: Position[];
  demoOrders: Order[];
  demoTrades: TradeLog[];

  // Live Trading State (Refreshed via Server Actions / TanStack Query)
  liveWallet: WalletBalance | null;
  livePositions: Position[];
  liveOrders: Order[];
  setLiveState: (data: { wallet?: WalletBalance; positions?: Position[]; orders?: Order[] }) => void;

  // Demo Actions
  resetDemoWallet: () => void;
  placeDemoOrder: (req: OrderRequest, currentPrice: number) => { success: boolean; error?: string };
  cancelDemoOrder: (orderId: string) => { success: boolean; error?: string };
  closeDemoPosition: (positionId: string, currentPrice: number) => { success: boolean; error?: string };
  processPriceTick: (symbol: string, currentPrice: number) => void;
}

const INITIAL_DEMO_BALANCE: WalletBalance = {
  startingBalance: 100000,
  balance: 100000,
  equity: 100000,
  availableMargin: 100000,
  usedMargin: 0,
  unrealizedPnL: 0,
  realizedPnL: 0,
};

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      tradingMode: "demo",
      setTradingMode: (mode) => set({ tradingMode: mode }),
      isLiveConfirmOpen: false,
      setLiveConfirmOpen: (open) => set({ isLiveConfirmOpen: open }),

      isExecuting: false,
      setIsExecuting: (executing) => set({ isExecuting: executing }),

      demoWallet: INITIAL_DEMO_BALANCE,
      demoPositions: [],
      demoOrders: [],
      demoTrades: [],

      liveWallet: null,
      livePositions: [],
      liveOrders: [],
      setLiveState: (data) =>
        set((state) => ({
          liveWallet: data.wallet !== undefined ? data.wallet : state.liveWallet,
          livePositions: data.positions !== undefined ? data.positions : state.livePositions,
          liveOrders: data.orders !== undefined ? data.orders : state.liveOrders,
        })),

      resetDemoWallet: () =>
        set({
          demoWallet: INITIAL_DEMO_BALANCE,
          demoPositions: [],
          demoOrders: [],
          demoTrades: [],
        }),

      placeDemoOrder: (req, currentPrice) => {
        const { demoWallet, demoPositions, demoOrders } = get();

        // 1. Calculate required margin
        const executionPrice = req.orderType === "market" ? currentPrice : req.price ?? currentPrice;
        const positionNotional = req.size * executionPrice;
        const requiredMargin = positionNotional / req.leverage;
        const estimatedFee = positionNotional * 0.0005; // 0.05% taker fee

        if (requiredMargin + estimatedFee > demoWallet.availableMargin) {
          return {
            success: false,
            error: `Insufficient margin! Required: $${(requiredMargin + estimatedFee).toFixed(2)}, Available: $${demoWallet.availableMargin.toFixed(2)}`,
          };
        }

        const now = new Date().toISOString();

        // If Market Order -> Fill immediately & create position
        if (req.orderType === "market") {
          // Liquidation Price calculation
          const sideMultiplier = req.side === "buy" ? 1 : -1;
          const liqOffset = (executionPrice / req.leverage) * 0.9; // ~90% margin threshold
          const liquidationPrice = Math.max(
            0.0001,
            req.side === "buy" ? executionPrice - liqOffset : executionPrice + liqOffset
          );

          const newPosition: Position = {
            id: `demo-pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            symbol: req.symbol,
            side: req.side,
            size: req.size,
            entryPrice: executionPrice,
            markPrice: currentPrice,
            leverage: req.leverage,
            margin: requiredMargin,
            liquidationPrice,
            unrealizedPnL: 0,
            unrealizedPnLPct: 0,
            stopLoss: req.stopLoss,
            takeProfit: req.takeProfit,
            createdAt: now,
            updatedAt: now,
          };

          const newTrade: TradeLog = {
            id: `demo-trd-${Date.now()}`,
            symbol: req.symbol,
            side: req.side,
            price: executionPrice,
            size: req.size,
            fee: estimatedFee,
            realizedPnL: 0,
            executedAt: now,
          };

          const updatedBalance = demoWallet.balance - estimatedFee;
          const updatedUsedMargin = demoWallet.usedMargin + requiredMargin;
          const updatedAvailableMargin = updatedBalance - updatedUsedMargin;

          set({
            demoPositions: [newPosition, ...demoPositions],
            demoTrades: [newTrade, ...get().demoTrades],
            demoWallet: {
              ...demoWallet,
              balance: updatedBalance,
              usedMargin: updatedUsedMargin,
              availableMargin: updatedAvailableMargin,
              equity: updatedBalance + demoWallet.unrealizedPnL,
            },
          });

          return { success: true };
        }

        // Limit / Stop Orders -> Place in open orders
        const newOrder: Order = {
          id: `demo-ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          symbol: req.symbol,
          side: req.side,
          orderType: req.orderType,
          price: req.price,
          stopPrice: req.stopPrice,
          size: req.size,
          filledSize: 0,
          leverage: req.leverage,
          status: "open",
          createdAt: now,
          updatedAt: now,
        };

        const updatedUsedMargin = demoWallet.usedMargin + requiredMargin;
        const updatedAvailableMargin = demoWallet.balance - updatedUsedMargin;

        set({
          demoOrders: [newOrder, ...demoOrders],
          demoWallet: {
            ...demoWallet,
            usedMargin: updatedUsedMargin,
            availableMargin: updatedAvailableMargin,
          },
        });

        return { success: true };
      },

      cancelDemoOrder: (orderId) => {
        const { demoOrders, demoWallet } = get();
        const order = demoOrders.find((o) => o.id === orderId);
        if (!order) return { success: false, error: "Order not found" };

        const price = order.price ?? 1;
        const freedMargin = (order.size * price) / order.leverage;

        const updatedOrders = demoOrders.filter((o) => o.id !== orderId);
        const updatedUsedMargin = Math.max(0, demoWallet.usedMargin - freedMargin);
        const updatedAvailableMargin = demoWallet.balance - updatedUsedMargin;

        set({
          demoOrders: updatedOrders,
          demoWallet: {
            ...demoWallet,
            usedMargin: updatedUsedMargin,
            availableMargin: updatedAvailableMargin,
          },
        });

        return { success: true };
      },

      closeDemoPosition: (positionId, currentPrice) => {
        const { demoPositions, demoWallet, demoTrades } = get();
        const position = demoPositions.find((p) => p.id === positionId);
        if (!position) return { success: false, error: "Position not found" };

        const sideMultiplier = position.side === "buy" ? 1 : -1;
        const pnl = (currentPrice - position.entryPrice) * position.size * sideMultiplier;
        const fee = position.size * currentPrice * 0.0005;
        const netPnL = pnl - fee;

        const newTrade: TradeLog = {
          id: `demo-trd-${Date.now()}`,
          symbol: position.symbol,
          side: position.side === "buy" ? "sell" : "buy",
          price: currentPrice,
          size: position.size,
          fee,
          realizedPnL: netPnL,
          executedAt: new Date().toISOString(),
        };

        const updatedBalance = demoWallet.balance + netPnL;
        const updatedUsedMargin = Math.max(0, demoWallet.usedMargin - position.margin);
        const updatedRealizedPnL = demoWallet.realizedPnL + netPnL;
        const updatedPositions = demoPositions.filter((p) => p.id !== positionId);

        // Recalculate total unrealized PnL of remaining positions
        const remainingUnrealizedPnL = updatedPositions.reduce((acc, pos) => {
          const mult = pos.side === "buy" ? 1 : -1;
          return acc + (pos.markPrice - pos.entryPrice) * pos.size * mult;
        }, 0);

        set({
          demoPositions: updatedPositions,
          demoTrades: [newTrade, ...demoTrades],
          demoWallet: {
            ...demoWallet,
            balance: updatedBalance,
            realizedPnL: updatedRealizedPnL,
            usedMargin: updatedUsedMargin,
            unrealizedPnL: remainingUnrealizedPnL,
            equity: updatedBalance + remainingUnrealizedPnL,
            availableMargin: updatedBalance + remainingUnrealizedPnL - updatedUsedMargin,
          },
        });

        return { success: true };
      },

      processPriceTick: (symbol, currentPrice) => {
        const { demoPositions, demoOrders } = get();
        if (demoPositions.length === 0 && demoOrders.length === 0) return;

        let positionsChanged = false;
        let ordersChanged = false;

        // 1. Update positions mark price & check SL / TP / Liquidation
        const updatedPositions: Position[] = [];
        const closedPositions: { pos: Position; reason: string; price: number }[] = [];

        demoPositions.forEach((pos) => {
          if (pos.symbol !== symbol) {
            updatedPositions.push(pos);
            return;
          }

          positionsChanged = true;
          const sideMultiplier = pos.side === "buy" ? 1 : -1;
          const pnl = (currentPrice - pos.entryPrice) * pos.size * sideMultiplier;
          const pnlPct = (pnl / pos.margin) * 100;

          // Check Liquidation
          const isLiquidated =
            pos.side === "buy"
              ? currentPrice <= pos.liquidationPrice
              : currentPrice >= pos.liquidationPrice;

          // Check Stop Loss
          const isSLTriggered =
            pos.stopLoss &&
            (pos.side === "buy"
              ? currentPrice <= pos.stopLoss
              : currentPrice >= pos.stopLoss);

          // Check Take Profit
          const isTPTriggered =
            pos.takeProfit &&
            (pos.side === "buy"
              ? currentPrice >= pos.takeProfit
              : currentPrice <= pos.takeProfit);

          if (isLiquidated || isSLTriggered || isTPTriggered) {
            closedPositions.push({
              pos,
              reason: isLiquidated ? "Liquidation" : isSLTriggered ? "Stop Loss" : "Take Profit",
              price: isLiquidated ? pos.liquidationPrice : currentPrice,
            });
          } else {
            updatedPositions.push({
              ...pos,
              markPrice: currentPrice,
              unrealizedPnL: pnl,
              unrealizedPnLPct: pnlPct,
              updatedAt: new Date().toISOString(),
            });
          }
        });

        // Close any auto-triggered positions
        closedPositions.forEach(({ pos, price }) => {
          get().closeDemoPosition(pos.id, price);
        });

        // 2. Process open limit orders against price tick
        const remainingOrders: Order[] = [];
        demoOrders.forEach((ord) => {
          if (ord.symbol !== symbol || ord.status !== "open") {
            remainingOrders.push(ord);
            return;
          }

          let shouldFill = false;
          if (ord.orderType === "limit" && ord.price) {
            shouldFill = ord.side === "buy" ? currentPrice <= ord.price : currentPrice >= ord.price;
          } else if (ord.orderType === "stop_market" && ord.stopPrice) {
            shouldFill = ord.side === "buy" ? currentPrice >= ord.stopPrice : currentPrice <= ord.stopPrice;
          }

          if (shouldFill) {
            ordersChanged = true;
            // Execute as filled market order
            get().placeDemoOrder(
              {
                symbol: ord.symbol,
                side: ord.side,
                orderType: "market",
                size: ord.size,
                leverage: ord.leverage,
              },
              currentPrice
            );
          } else {
            remainingOrders.push(ord);
          }
        });

        if (positionsChanged || ordersChanged) {
          const totalUnrealizedPnL = updatedPositions.reduce((acc, pos) => acc + pos.unrealizedPnL, 0);
          const currentWallet = get().demoWallet;

          set({
            demoPositions: updatedPositions,
            demoOrders: remainingOrders,
            demoWallet: {
              ...currentWallet,
              unrealizedPnL: totalUnrealizedPnL,
              equity: currentWallet.balance + totalUnrealizedPnL,
              availableMargin: currentWallet.balance + totalUnrealizedPnL - currentWallet.usedMargin,
            },
          });
        }
      },
    }),
    {
      name: "xtred-trading-store",
      partialize: (state) => ({
        tradingMode: state.tradingMode,
        demoWallet: state.demoWallet,
        demoPositions: state.demoPositions,
        demoOrders: state.demoOrders,
        demoTrades: state.demoTrades,
      }),
    }
  )
);
