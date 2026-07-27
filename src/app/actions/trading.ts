"use server";

import { OrderRequestSchema, type OrderRequest, type ExecutionResult, type Position, type Order, type WalletBalance, type TradeLog } from "@/types/trading";
import { toDeltaSymbol } from "@/lib/delta/client";
import { resolveDeltaCredentials, getDeltaBaseUrl, type DeltaCredentials } from "@/lib/delta/credentials";
import crypto from "crypto";

// ─── HMAC SHA256 Signature Helper ───────────────────────────────────────────

function sign(method: string, fullPath: string, body: string, timestamp: string, secret: string): string {
  const message = method.toUpperCase() + timestamp + fullPath + body;
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

function getAuthHeaders(
  method: string,
  endpoint: string,
  body = "",
  apiKey: string,
  apiSecret: string
): { headers: Record<string, string>; fullPath: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullPath = cleanEndpoint.startsWith("/v2") ? cleanEndpoint : `/v2${cleanEndpoint}`;

  const signature = sign(method, fullPath, body, timestamp, apiSecret);

  return {
    headers: {
      "api-key": apiKey,
      signature,
      timestamp,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    fullPath,
  };
}

async function authenticatedDeltaFetch<T>(
  method: "GET" | "POST" | "DELETE",
  endpoint: string,
  body?: unknown,
  credentialsOverride?: DeltaCredentials
): Promise<T> {
  const { apiKey, apiSecret, env } = resolveDeltaCredentials(credentialsOverride);

  if (!apiKey || !apiSecret) {
    throw new Error("Delta Exchange API Key and Secret are missing. Please configure them in Settings.");
  }

  const bodyStr = body ? JSON.stringify(body) : "";
  const { headers, fullPath } = getAuthHeaders(method, endpoint, bodyStr, apiKey, apiSecret);
  const baseUrl = getDeltaBaseUrl(env);
  const url = `${baseUrl}${fullPath}`;

  const res = await fetch(url, {
    method,
    headers,
    body: bodyStr || undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    let jsonError: any = null;
    try {
      jsonError = JSON.parse(errorText);
    } catch {
      // Non-JSON response
    }

    if (errorText.includes("ip_not_whitelisted_for_api_key") || jsonError?.error?.code === "ip_not_whitelisted_for_api_key") {
      const clientIp = jsonError?.error?.context?.client_ip || "your server IP";
      throw new Error(
        `Delta Exchange IP Whitelist Notice: Your API Key has IP restriction enabled. ` +
        `Your current client IP is [${clientIp}]. Please edit your API Key on Delta Exchange (https://www.delta.exchange/app/account/manageapikeys) ` +
        `and uncheck 'IP Restriction' or add IP ${clientIp} to the whitelist.`
      );
    }

    if (res.status === 401 || errorText.includes("invalid_api_key")) {
      throw new Error(
        `Delta Exchange API Authentication Error (401): Invalid API Key or Secret. ` +
        `Current Region/Env: [${env.toUpperCase()}]. ` +
        `If using Delta India keys, set Region to India in Settings. If using Global keys, set Region to Global Mainnet.`
      );
    }

    throw new Error(`Delta Exchange API (${res.status}): ${jsonError?.error?.code || jsonError?.error?.message || errorText}`);
  }

  return res.json() as Promise<T>;
}

// ─── Place Live Order Server Action ─────────────────────────────────────────

export async function placeLiveOrderAction(
  orderRequest: OrderRequest,
  credentials?: DeltaCredentials
): Promise<ExecutionResult> {
  const parseResult = OrderRequestSchema.safeParse(orderRequest);
  if (!parseResult.success) {
    return {
      success: false,
      error: `Invalid order request payload: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const order = parseResult.data;
  const deltaSymbol = toDeltaSymbol(order.symbol);

  const payload: Record<string, unknown> = {
    product_symbol: deltaSymbol,
    size: Math.round(order.size),
    side: order.side === "buy" ? "buy" : "sell",
    order_type: order.orderType === "market" ? "market_order" : "limit_order",
  };

  if (order.orderType === "limit") {
    if (!order.price || order.price <= 0) {
      return { success: false, error: "Limit price must be greater than 0 for limit orders." };
    }
    payload.limit_price = String(order.price);
  }

  if (order.stopLossPrice && order.stopLossPrice > 0) {
    payload.stop_loss_price = String(order.stopLossPrice);
  }

  if (order.takeProfitPrice && order.takeProfitPrice > 0) {
    payload.take_profit_price = String(order.takeProfitPrice);
  }

  try {
    const response = await authenticatedDeltaFetch<{
      success: boolean;
      result?: {
        id: string;
        product_symbol: string;
        side: string;
        order_type: string;
        limit_price?: string;
        size: number;
        unfilled_size?: number;
        state: string;
      };
      error?: { message?: string; code?: string };
    }>("POST", "/orders", payload, credentials);

    if (!response.success || !response.result) {
      return {
        success: false,
        error: response.error?.message || "Order rejected by Delta Exchange.",
      };
    }

    const res = response.result;
    const executedOrder: Order = {
      id: String(res.id),
      symbol: order.symbol,
      side: order.side,
      orderType: order.orderType,
      price: res.limit_price ? parseFloat(res.limit_price) : order.price,
      size: Math.abs(res.size),
      filledSize: res.size - (res.unfilled_size ?? 0),
      leverage: order.leverage,
      status: res.state === "open" ? "open" : res.state === "filled" ? "filled" : "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      order: executedOrder,
      message: `Live ${order.side.toUpperCase()} order placed successfully on Delta Exchange.`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Live order execution failed";
    return { success: false, error };
  }
}

// ─── Cancel Live Order Server Action ────────────────────────────────────────

export async function cancelLiveOrderAction(
  orderId: string,
  credentials?: DeltaCredentials
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await authenticatedDeltaFetch<{
      success: boolean;
      result?: { id: string };
      error?: { message?: string };
    }>("DELETE", `/orders/${orderId}`, undefined, credentials);

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

export async function getLivePositionsAction(
  credentials?: DeltaCredentials
): Promise<{ positions: Position[]; error?: string }> {
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
    }>("GET", "/positions/margined", undefined, credentials);

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

export async function getLiveWalletBalanceAction(
  credentials?: DeltaCredentials
): Promise<{ balance: WalletBalance | null; error?: string }> {
  try {
    const response = await authenticatedDeltaFetch<{
      success: boolean;
      meta?: {
        net_equity?: string;
      };
      result?: Array<{
        asset_symbol: string;
        balance: string;
        available_balance: string;
        order_margin: string;
        position_margin: string;
      }>;
    }>("GET", "/wallet/balances", undefined, credentials);

    if (!response.success || !response.result) {
      return { balance: null };
    }

    const netEquityMeta = parseFloat(response.meta?.net_equity || "0");

    let totalBalance = 0;
    let availableMargin = 0;
    let usedMargin = 0;

    response.result.forEach((w) => {
      const b = parseFloat(w.balance || "0");
      const a = parseFloat(w.available_balance || "0");
      const pm = parseFloat(w.position_margin || "0");
      const om = parseFloat(w.order_margin || "0");

      if (b > 0 || a > 0 || pm > 0 || om > 0) {
        totalBalance += b;
        availableMargin += a;
        usedMargin += pm + om;
      }
    });

    const finalEquity = netEquityMeta > 0 ? netEquityMeta : totalBalance;

    const wallet: WalletBalance = {
      startingBalance: finalEquity,
      balance: finalEquity,
      equity: finalEquity,
      availableMargin: availableMargin > 0 ? availableMargin : finalEquity - usedMargin,
      usedMargin,
      unrealizedPnL: 0,
      realizedPnL: 0,
    };

    return { balance: wallet };
  } catch (err: unknown) {
    return { balance: null, error: err instanceof Error ? err.message : "Failed to fetch live wallet balance" };
  }
}

// ─── Fetch Live Open Orders Server Action ───────────────────────────────────

export async function getLiveOrdersAction(
  credentials?: DeltaCredentials
): Promise<{ orders: Order[]; error?: string }> {
  try {
    const response = await authenticatedDeltaFetch<{
      success: boolean;
      result?: Array<{
        id: string;
        product_symbol: string;
        side: string;
        order_type: string;
        limit_price?: string;
        stop_price?: string;
        size: number;
        unfilled_size?: number;
        state: string;
      }>;
    }>("GET", "/orders?state=open", undefined, credentials);

    if (!response.success || !response.result) {
      return { orders: [] };
    }

    const orders: Order[] = response.result.map((o) => ({
      id: String(o.id),
      symbol: o.product_symbol,
      side: o.side === "buy" ? "buy" : "sell",
      orderType: o.order_type === "market_order" ? "market" : "limit",
      price: o.limit_price ? parseFloat(o.limit_price) : undefined,
      stopPrice: o.stop_price ? parseFloat(o.stop_price) : undefined,
      size: Math.abs(o.size),
      filledSize: o.size - (o.unfilled_size ?? 0),
      leverage: 10,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return { orders };
  } catch (err: unknown) {
    return { orders: [], error: err instanceof Error ? err.message : "Failed to fetch live orders" };
  }
}

// ─── Fetch Live Executed Trades (Fills) Server Action ────────────────────────

export async function getLiveFillsAction(
  credentials?: DeltaCredentials
): Promise<{ trades: TradeLog[]; error?: string }> {
  try {
    const response = await authenticatedDeltaFetch<{
      success: boolean;
      result?: Array<{
        id: string;
        order_id?: string;
        product_symbol: string;
        side: string;
        price: string;
        size: string;
        commission?: string;
        created_at: string;
      }>;
    }>("GET", "/fills", undefined, credentials);

    if (!response.success || !response.result) {
      return { trades: [] };
    }

    const trades: TradeLog[] = response.result.map((f) => ({
      id: String(f.id),
      orderId: f.order_id ? String(f.order_id) : undefined,
      symbol: f.product_symbol,
      side: f.side === "buy" ? "buy" : "sell",
      price: parseFloat(f.price || "0"),
      size: parseFloat(f.size || "0"),
      fee: parseFloat(f.commission || "0"),
      timestamp: f.created_at,
    }));

    return { trades };
  } catch (err: unknown) {
    return { trades: [], error: err instanceof Error ? err.message : "Failed to fetch live trades history" };
  }
}
