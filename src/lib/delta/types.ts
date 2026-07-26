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

// ─── Product ──────────────────────────────────────────────────────────────────

export const DeltaProductSchema = z.object({
  id: z.number(),
  symbol: z.string(),
  description: z.string(),
  contract_type: z.string(),
  quoting_asset: z.object({ symbol: z.string(), minimum_precision: z.number() }),
  settling_asset: z.object({ symbol: z.string(), minimum_precision: z.number() }),
  underlying_asset: z.object({ symbol: z.string() }),
  tick_size: z.string(),
  contract_value: z.string(),
  contract_unit_currency: z.string(),
  initial_margin: z.string(),
  maintenance_margin: z.string(),
  state: z.string(),
  funding_method: z.string().optional(),
  trading_status: z.string(),
});

export type DeltaProduct = z.infer<typeof DeltaProductSchema>;

// ─── Ticker ───────────────────────────────────────────────────────────────────

const StringOrNumber = z.union([z.string(), z.number()]).transform(String);

export const DeltaTickerSchema = z.object({
  symbol: z.string(),
  mark_price: StringOrNumber,
  last_price: StringOrNumber.optional(),
  close: StringOrNumber,
  open: StringOrNumber,
  high: StringOrNumber,
  low: StringOrNumber,
  volume: StringOrNumber,
  turnover: StringOrNumber,
  turnover_usd: StringOrNumber.optional(),
  open_interest: StringOrNumber.optional(),
  oi: StringOrNumber.optional(),
  funding_rate: StringOrNumber.optional(),
  predicted_funding_rate: StringOrNumber.optional(),
  next_funding_realization: StringOrNumber.optional(),
  price_band: z
    .object({
      upper_limit: StringOrNumber,
      lower_limit: StringOrNumber,
    })
    .optional(),
  timestamp: z.number(),
}).transform((data) => {
  const closePrice = data.close;
  return {
    symbol: data.symbol,
    mark_price: data.mark_price,
    last_price: data.last_price || closePrice,
    close: closePrice,
    open: data.open,
    high: data.high,
    low: data.low,
    volume: data.volume,
    turnover: data.turnover,
    turnover_usd: data.turnover_usd,
    open_interest: data.open_interest || data.oi || "0",
    funding_rate: data.funding_rate || "0",
    predicted_funding_rate: data.predicted_funding_rate,
    next_funding_realization: data.next_funding_realization || new Date().toISOString(),
    price_band: data.price_band,
    timestamp: data.timestamp,
  };
});

export type DeltaTicker = z.infer<typeof DeltaTickerSchema>;

// ─── Candle (OHLCV) ───────────────────────────────────────────────────────────

export const DeltaCandleSchema = z.object({
  time: z.number(),   // unix seconds
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type DeltaCandle = z.infer<typeof DeltaCandleSchema>;

// Raw candle from Delta API is an array: [time, open, high, low, close, volume]
export const DeltaRawCandleSchema = z
  .tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()])
  .transform(([time, open, high, low, close, volume]) => ({
    time,
    open,
    high,
    low,
    close,
    volume,
  }));

// ─── Order Book ───────────────────────────────────────────────────────────────

export const DeltaOrderBookLevelSchema = z.tuple([z.string(), z.string()]).transform(
  ([price, size]) => ({ price: parseFloat(price), size: parseFloat(size) })
);

export const DeltaOrderBookSchema = z.object({
  symbol: z.string(),
  buy: z.array(DeltaOrderBookLevelSchema),
  sell: z.array(DeltaOrderBookLevelSchema),
  timestamp: z.number().optional(),
});

export type DeltaOrderBook = z.infer<typeof DeltaOrderBookSchema>;

// ─── Open Interest ────────────────────────────────────────────────────────────

export const DeltaOISchema = z.object({
  symbol: z.string(),
  open_interest: z.string(),
  open_interest_usd: z.string().optional(),
  timestamp: z.number().optional(),
});

export type DeltaOI = z.infer<typeof DeltaOISchema>;

// ─── Funding Rate ─────────────────────────────────────────────────────────────

export const DeltaFundingRateSchema = z.object({
  symbol: z.string(),
  funding_rate: z.string(),
  predicted_funding_rate: z.string().optional(),
  next_funding_realization: z.string(),
});

export type DeltaFundingRate = z.infer<typeof DeltaFundingRateSchema>;

// ─── Liquidation ─────────────────────────────────────────────────────────────

export const DeltaLiquidationSchema = z.object({
  id: z.number().optional(),
  symbol: z.string(),
  side: z.enum(["buy", "sell"]),
  size: z.union([z.number(), z.string()]).transform(Number),
  price: z.union([z.number(), z.string()]).transform(Number),
  timestamp: z.number(),
});

export type DeltaLiquidation = z.infer<typeof DeltaLiquidationSchema>;

// ─── WebSocket message shapes ─────────────────────────────────────────────────

export const DeltaWSTicker = z.object({
  type: z.literal("ticker"),
  symbol: z.string(),
  data: DeltaTickerSchema,
  timestamp: z.number().optional(),
});

export const DeltaWSOrderBook = z.object({
  type: z.enum(["l2_orderbook", "l1_orderbook"]),
  symbol: z.string(),
  data: DeltaOrderBookSchema,
});

export const DeltaWSCandle = z.object({
  type: z.string(), // e.g. "candlestick_1m"
  symbol: z.string(),
  data: z.object({
    open: z.number(),
    high: z.number(),
    low: z.number(),
    close: z.number(),
    volume: z.number(),
    timestamp: z.number(),
    resolution: z.string(),
  }),
});

export const DeltaWSMessage = z.union([
  DeltaWSTicker,
  DeltaWSOrderBook,
  DeltaWSCandle,
  z.object({ type: z.string() }).passthrough(), // unknown message types
]);

export type DeltaWSMessageType = z.infer<typeof DeltaWSMessage>;
