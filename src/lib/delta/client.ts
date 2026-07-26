import crypto from "crypto";
import { z } from "zod";
import {
  DeltaResponseSchema,
  DeltaProductSchema,
  DeltaTickerSchema,
  DeltaRawCandleSchema,
  DeltaOISchema,
  DeltaFundingRateSchema,
  DeltaLiquidationSchema,
  type DeltaCandle,
  type DeltaProduct,
  type DeltaTicker,
  type DeltaOI,
  type DeltaFundingRate,
  type DeltaLiquidation,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

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

// ─── HMAC Signing ────────────────────────────────────────────────────────────

function sign(method: string, path: string, body: string, timestamp: string): string {
  const message = `${method}${timestamp}${path}${body}`;
  return crypto.createHmac("sha256", getApiSecret()).update(message).digest("hex");
}

function getAuthHeaders(
  method: string,
  path: string,
  body = ""
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = sign(method.toUpperCase(), path, body, timestamp);
  return {
    "api-key": getApiKey(),
    signature,
    timestamp,
    "Content-Type": "application/json",
  };
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function deltaFetch<T>(
  method: "GET" | "POST" | "DELETE",
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  body?: unknown,
  auth = false
): Promise<T> {
  const url = new URL(`${getBaseUrl()}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const bodyStr = body ? JSON.stringify(body) : "";
  const path = url.pathname + (url.search ? url.search : "");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(auth ? getAuthHeaders(method, path, bodyStr) : {}),
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: bodyStr || undefined,
    next: { revalidate: 0 }, // never cache market data at Next.js level
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Delta API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public REST Endpoints ────────────────────────────────────────────────────

/** List all active perpetual products */
export async function getProducts(): Promise<DeltaProduct[]> {
  const raw = await deltaFetch<unknown>("GET", "/products", {
    contract_types: "perpetual_futures",
  });

  const schema = DeltaResponseSchema(z.array(DeltaProductSchema));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error("Delta getProducts schema error");
  if (!parsed.data.success) throw new Error(`Delta error: ${parsed.data.error.code}`);
  return parsed.data.result;
}

/** Get ticker for a single symbol */
export async function getTicker(symbol: string): Promise<DeltaTicker> {
  const raw = await deltaFetch<unknown>("GET", `/tickers/${symbol}`);

  const schema = DeltaResponseSchema(DeltaTickerSchema);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error(`Delta getTicker schema error for ${symbol}`);
  if (!parsed.data.success) throw new Error(`Delta error: ${parsed.data.error.code}`);
  return parsed.data.result;
}

/** Get all tickers (used for market summary) */
export async function getAllTickers(): Promise<DeltaTicker[]> {
  const raw = await deltaFetch<unknown>("GET", "/tickers");

  const schema = DeltaResponseSchema(z.array(DeltaTickerSchema));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error("Delta getAllTickers schema error");
  if (!parsed.data.success) throw new Error(`Delta error: ${parsed.data.error.code}`);
  return parsed.data.result;
}

/** Get OHLCV candles for a symbol */
export async function getCandles(
  symbol: string,
  resolution: string,
  from: number, // unix seconds
  to: number
): Promise<DeltaCandle[]> {
  const raw = await deltaFetch<unknown>("GET", "/history/candles", {
    symbol,
    resolution,
    from,
    to,
  });

  // Delta returns { success, result: [[time, open, high, low, close, volume], ...] }
  const schema = DeltaResponseSchema(z.array(DeltaRawCandleSchema));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error("Delta getCandles parse error:", parsed.error.flatten());
    throw new Error(`Delta getCandles schema error for ${symbol}`);
  }
  if (!parsed.data.success) throw new Error(`Delta error: ${parsed.data.error.code}`);
  return parsed.data.result;
}

/** Get open interest for a symbol */
export async function getOpenInterest(symbol: string): Promise<DeltaOI> {
  const raw = await deltaFetch<unknown>("GET", `/products/${symbol}/open_interest`);

  const schema = DeltaResponseSchema(DeltaOISchema);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error(`Delta getOI schema error for ${symbol}`);
  if (!parsed.data.success) throw new Error(`Delta error: ${parsed.data.error.code}`);
  return parsed.data.result;
}

/** Get funding rate history */
export async function getFundingHistory(
  symbol: string,
  limit = 24
): Promise<DeltaFundingRate[]> {
  const raw = await deltaFetch<unknown>("GET", "/products/funding_history", {
    symbol,
    page_size: limit,
  });

  const schema = DeltaResponseSchema(z.array(DeltaFundingRateSchema));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error(`Delta getFunding schema error for ${symbol}`);
  if (!parsed.data.success) throw new Error(`Delta error: ${parsed.data.error.code}`);
  return parsed.data.result;
}

/** Get recent liquidations */
export async function getLiquidations(
  symbol: string,
  limit = 50
): Promise<DeltaLiquidation[]> {
  const raw = await deltaFetch<unknown>("GET", "/orders/leverage_brackets", {
    product_symbol: symbol,
    page_size: limit,
  });

  const schema = DeltaResponseSchema(z.array(DeltaLiquidationSchema));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.warn("Delta getLiquidations schema error — returning empty");
    return [];
  }
  if (!parsed.data.success) return [];
  return parsed.data.result;
}

// ─── Private REST Endpoints ───────────────────────────────────────────────────

/** Get user's open positions (requires auth) */
export async function getPositions() {
  const raw = await deltaFetch<unknown>("GET", "/positions/margined", {}, undefined, true);

  const schema = DeltaResponseSchema(z.array(z.record(z.string(), z.unknown())));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error("Delta getPositions schema error");
  if (!parsed.data.success) throw new Error(`Delta error: ${parsed.data.error.code}`);
  return parsed.data.result;
}
