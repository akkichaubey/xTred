import { z } from "zod";

// ─── Enums & Literals ─────────────────────────────────────────────────────────

export type TradingMode = "demo" | "live";
export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop_market" | "take_profit_market";
export type OrderStatus = "open" | "filled" | "partially_filled" | "cancelled" | "rejected" | "pending";

// ─── Zod Schemas for Validation ───────────────────────────────────────────────

export const OrderRequestSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  side: z.enum(["buy", "sell"]),
  orderType: z.enum(["market", "limit", "stop_market", "take_profit_market"]),
  size: z.number().positive("Position size must be greater than 0"),
  price: z.number().positive("Price must be positive").optional(),
  stopPrice: z.number().positive("Stop price must be positive").optional(),
  leverage: z.number().int().min(1).max(100).default(10),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  stopLossPrice: z.number().positive().optional(),
  takeProfitPrice: z.number().positive().optional(),
});

export type OrderRequest = z.infer<typeof OrderRequestSchema>;

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  stopLoss?: number;
  takeProfit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  price?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  size: number;
  filledSize: number;
  leverage: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TradeLog {
  id: string;
  orderId?: string;
  symbol: string;
  side: OrderSide;
  price: number;
  size: number;
  fee: number;
  realizedPnL: number;
  executedAt: string;
}

export interface WalletBalance {
  startingBalance: number;
  balance: number;
  equity: number;
  availableMargin: number;
  usedMargin: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface ExecutionResult {
  success: boolean;
  orderId?: string;
  order?: Order;
  message?: string;
  error?: string;
}

export interface RiskCalculation {
  requiredMargin: number;
  estimatedFee: number;
  liquidationPrice: number;
  maxPositionSize: number;
  isValid: boolean;
  errorMessage?: string;
}
