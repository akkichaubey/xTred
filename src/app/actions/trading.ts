"use server";

import { OrderRequestSchema, type OrderRequest, type ExecutionResult, type Position, type Order, type WalletBalance } from "@/types/trading";
import { toDeltaSymbol } from "@/lib/delta/client";
import crypto from "crypto";

// ─── Secret Key Access (Server Side Only) ────────────────────────────────────

function getBaseUrl(): string {
  const isTestnet = process.env.DELTA_ENV === "testnet";
  return isTestnet
    ? "https://cdn-ind.testnet.deltaex.org/v2"
    : "https://api.delta.exchange/v2";
}

function getApiKey(): string {
  return process.env.DELTA_API_KEY ?? "";
}

function getApiSecret(): string {
  return process.env.DELTA_API_SECRET ?? "";
}

function sign(method: string, path: string, body: string, timestamp: string): string {
  const message = `${method}${timestamp}${path}${body}`;
  return crypto.createHmac("sha256", getApiSecret()).update(message).digest("hex");
}

function getAuthHeaders(method: string, path: string, body = ""): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = sign(method.toUpperCase(), path, body, timestamp);
  return {
    "api-key": getApiKey(),
    signature,
    timestamp,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function authenticatedDeltaFetch<T>(
  method: "GET" | "POST" | "DELETE",
  endpoint: string,
  body?: unknown
): Promise<T> {
  const apiKey = getApiKey();
  const apiSecret = getApiSecret();

  if (!apiKey || !apiSecret) {
    throw new Error("Delta Exchange API Key and Secret are not configured in environment settings.");
  }

  const url = `${getBaseUrl()}${endpoint}`;
  const bodyStr = body ? JSON.stringify(body) : "";
  const headers = getAuthHeaders(method, endpoint, bodyStr);

  const res = await fetch(url, {
    method,
    headers,
    body: bodyStr || undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Delta Exchange API (${res.status}): ${errorText}`);
  }

  return res.json() as Promise<T>;
}

// ─── Live Order Placement Server Action ────────────────────────────────────────

export async function placeLiveOrderAction(req: OrderRequest): Promise<ExecutionResult> {
  try {
    // 1. Zod Payload Validation
    const parsed = OrderRequestSchema.safeParse(req);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: `Invalid order request: ${errorMsg}` };
    }

    const validReq = parsed.data;
    const deltaSym = toDeltaSymbol(validReq.symbol);

    // 2. Map to Delta API Order Payload
    const payload = {
      product_symbol: deltaSym,
      size: validReq.size,
      side: validReq.side === "buy" ? "buy" : "sell",
      order_type: validReq.orderType === "market" ? "market_order" : "limit_order",
      limit_price: validReq.price ? String(validReq.price) : undefined,
      stop_price: validReq.stopPrice ? String(validReq.stopPrice) : undefined,
    };

    // 3. Execute Authenticated REST Request
    const response = await authenticatedDeltaFetch<{
      success: boolean;
      result?: { id: string };
      error?: { message: string };
    }>("POST", "/orders", payload);

    if (!response.success || !response.result) {
      return {
        success: false,
        error: response.error?.message || "Failed to place order on Delta Exchange.",
      };
    }

    return {
      success: true,
      orderId: String(response.result.id),
      message: `Live order placed successfully! Order ID: ${response.result.id}`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown order execution error";
    return { success: false, error };
  }
}

// ─── Live Order Cancellation Server Action ───────────────────────────────────

export async function cancelLiveOrderAction(orderId: string): Promise<ExecutionResult> {
  try {
    const response = await authenticatedDeltaFetch<{ success: boolean; error?: { message: string } }>(
      "DELETE",
      `/orders/${orderId}`
    );

    if (!response.success) {
      return { success: false, error: response.error?.message || "Failed to cancel order." };
    }

    return { success: true, message: `Order ${orderId} cancelled successfully.` };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Cancellation failed";
    return { success: false, error };
  }
}

// ─── Fetch Live Positions Server Action ──────────────────────────────────────

export async function getLivePositionsAction(): Promise<{ positions: Position[]; error?: string }> {
  try {
    const response = await authenticatedDeltaFetch<{
      success: boolean;
      result?: Array<{
        id: string;
        product_symbol: string;
        size: number;
        entry_price: string;
        mark_price: string;
        margin: string;
        liquidation_price: string;
        realized_pnl: string;
        unrealized_pnl: string;
      }>;
    }>("GET", "/positions");

    if (!response.success || !response.result) {
      return { positions: [] };
    }

    const positions: Position[] = response.result.map((p) => {
      const entryPrice = parseFloat(p.entry_price || "0");
      const markPrice = parseFloat(p.mark_price || "0");
      const unrealizedPnL = parseFloat(p.unrealized_pnl || "0");
      const margin = parseFloat(p.margin || "1");
      const size = Math.abs(p.size);
      const side = p.size >= 0 ? "buy" : "sell";

      return {
        id: String(p.id),
        symbol: p.product_symbol,
        side,
        size,
        entryPrice,
        markPrice,
        leverage: 10,
        margin,
        liquidationPrice: parseFloat(p.liquidation_price || "0"),
        unrealizedPnL,
        unrealizedPnLPct: margin > 0 ? (unrealizedPnL / margin) * 100 : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    return { positions };
  } catch (err: unknown) {
    return { positions: [], error: err instanceof Error ? err.message : "Failed to fetch live positions" };
  }
}

// ─── Fetch Live Wallet Balance Server Action ────────────────────────────────

export async function getLiveWalletBalanceAction(): Promise<{ balance: WalletBalance | null; error?: string }> {
  try {
    const response = await authenticatedDeltaFetch<{
      success: boolean;
      result?: Array<{
        asset_symbol: string;
        balance: string;
        available_balance: string;
        order_margin: string;
        position_margin: string;
      }>;
    }>("GET", "/wallet/balances");

    if (!response.success || !response.result) {
      return { balance: null };
    }

    const usdtWallet = response.result.find((w) => w.asset_symbol === "USDT") || response.result[0];
    if (!usdtWallet) return { balance: null };

    const balance = parseFloat(usdtWallet.balance || "0");
    const availableMargin = parseFloat(usdtWallet.available_balance || "0");
    const usedMargin = parseFloat(usdtWallet.position_margin || "0") + parseFloat(usdtWallet.order_margin || "0");

    const wallet: WalletBalance = {
      startingBalance: balance,
      balance,
      equity: balance,
      availableMargin,
      usedMargin,
      unrealizedPnL: 0,
      realizedPnL: 0,
    };

    return { balance: wallet };
  } catch (err: unknown) {
    return { balance: null, error: err instanceof Error ? err.message : "Failed to fetch live wallet balance" };
  }
}
