import { z } from "zod";

// ─── Shared envelope ──────────────────────────────────────────────────────────

export const DeltaErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    context: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const DeltaSuccessSchema = <T extends z.ZodTypeAny>(resultSchema: T) =>
  z.object({
    success: z.literal(true),
    result: resultSchema,
    meta: z
      .object({
        after: z.string().nullable().optional(),
        before: z.string().nullable().optional(),
        limit: z.number().nullable().optional(),
        total_count: z.number().nullable().optional(),
      })
      .nullable()
      .optional(),
  });

export const DeltaResponseSchema = <T extends z.ZodTypeAny>(resultSchema: T) =>
  z.union([
    DeltaSuccessSchema(resultSchema),
    DeltaErrorSchema,
  ]);

// Helper converting string, number, null, or undefined safely to string
const StringOrNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((val) => (val != null ? String(val) : "0"));

// ─── Product ──────────────────────────────────────────────────────────────────

export const DeltaProductSchema = z.object({
  id: z.number(),
  symbol: z.string(),
  description: z.string().optional(),
  contract_type: z.string().optional(),
  quoting_asset: z.object({ symbol: z.string(), minimum_precision: z.number() }).optional(),
  settling_asset: z.object({ symbol: z.string(), minimum_precision: z.number() }).optional(),
  underlying_asset: z.object({ symbol: z.string() }).optional(),
  tick_size: z.string().optional(),
  contract_value: z.string().optional(),
  contract_unit_currency: z.string().optional(),
  initial_margin: z.string().optional(),
  maintenance_margin: z.string().optional(),
  state: z.string().optional(),
  funding_method: z.string().optional(),
  trading_status: z.string().optional(),
});

export type DeltaProduct = z.infer<typeof DeltaProductSchema>;

// ─── Ticker ───────────────────────────────────────────────────────────────────

export const DeltaTickerSchema = z.object({
  symbol: z.string().optional(),
  contract_type: z.string().optional(),
  mark_price: StringOrNumber.optional(),
  last_price: StringOrNumber.optional(),
  close: StringOrNumber.optional(),
  open: StringOrNumber.optional(),
  high: StringOrNumber.optional(),
  low: StringOrNumber.optional(),
  volume: StringOrNumber.optional(),
  turnover: StringOrNumber.optional(),
  turnover_usd: StringOrNumber.optional(),
  open_interest: StringOrNumber.optional(),
  oi: StringOrNumber.optional(),
  funding_rate: StringOrNumber.optional(),
  predicted_funding_rate: StringOrNumber.optional(),
  next_funding_realization: StringOrNumber.optional(),
  time: z.string().optional(),
  timestamp: z.union([z.number(), z.string(), z.null()]).optional(),
}).transform((data) => {
  const sym = data.symbol || "UNKNOWN";
  const closePrice = data.close || data.last_price || data.mark_price || "0";
  return {
    symbol: sym,
    mark_price: data.mark_price || closePrice,
    last_price: data.last_price || closePrice,
    close: closePrice,
    open: data.open || closePrice,
    high: data.high || closePrice,
    low: data.low || closePrice,
    volume: data.volume || "0",
    turnover: data.turnover || "0",
    turnover_usd: data.turnover_usd || "0",
    open_interest: data.open_interest || data.oi || "0",
    funding_rate: data.funding_rate || "0",
    predicted_funding_rate: data.predicted_funding_rate || "0",
    next_funding_realization: data.next_funding_realization || data.time || new Date().toISOString(),
  };
});

export type DeltaTicker = z.infer<typeof DeltaTickerSchema>;

// ─── Raw Candle ───────────────────────────────────────────────────────────────

export const DeltaRawCandleSchema = z.tuple([
  z.number(), // time
  z.number(), // open
  z.number(), // high
  z.number(), // low
  z.number(), // close
  z.number(), // volume
]);

export interface DeltaCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── Open Interest ─────────────────────────────────────────────────────────────

export const DeltaOISchema = z.object({
  symbol: z.string(),
  open_interest: StringOrNumber,
  oi_value_usd: StringOrNumber.optional(),
  timestamp: z.union([z.number(), z.string(), z.null()]).optional(),
});

export type DeltaOI = z.infer<typeof DeltaOISchema>;

// ─── Funding Rate ─────────────────────────────────────────────────────────────

export const DeltaFundingRateSchema = z.object({
  symbol: z.string(),
  funding_rate: StringOrNumber,
  predicted_funding_rate: StringOrNumber.optional(),
  next_funding_realization: z.string().optional(),
});

export type DeltaFundingRate = z.infer<typeof DeltaFundingRateSchema>;

// ─── Liquidations ─────────────────────────────────────────────────────────────

export const DeltaLiquidationSchema = z.object({
  symbol: z.string(),
  side: z.enum(["buy", "sell"]),
  size: StringOrNumber,
  price: StringOrNumber,
  timestamp: z.union([z.number(), z.string(), z.null()]).optional(),
});

export type DeltaLiquidation = z.infer<typeof DeltaLiquidationSchema>;

// ─── WebSocket Message Types ─────────────────────────────────────────────────

export const DeltaWSMessageTypeSchema = z.enum([
  "v2/ticker",
  "candlestick_1m",
  "candlestick_5m",
  "candlestick_1h",
  "l2_updates",
  "subscriptions",
  "unsubscriptions",
]);

export type DeltaWSMessageType = z.infer<typeof DeltaWSMessageTypeSchema>;

export const DeltaWSMessageSchema = z.object({
  type: z.string(),
  symbol: z.string().optional(),
  mark_price: z.string().optional(),
  close: z.string().optional(),
  open: z.string().optional(),
  high: z.string().optional(),
  low: z.string().optional(),
  volume: z.string().optional(),
  open_interest: z.string().optional(),
  funding_rate: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type DeltaWSMessage = z.infer<typeof DeltaWSMessageSchema>;
