import { z } from "zod";

// ─── Engine Outlook Schema ────────────────────────────────────────────────────

const EngineOutlookSchema = z.object({
  signal: z.enum(["bullish", "bearish", "sideways", "mixed", "neutral"]),
  summary: z.string().min(10),
  data_points: z.array(z.string()),
});

// ─── News Item Schema ─────────────────────────────────────────────────────────

const NewsItemAnalysisSchema = z.object({
  headline: z.string(),
  classification: z.enum([
    "Positive", "Negative", "Neutral", "Rumor", "Confirmed", "Breaking", "Fake",
  ]),
  impact: z.string(),
});

// ─── Full Analysis Output Schema (Section 3 format) ──────────────────────────

export const AnalysisOutputSchema = z.object({
  symbol: z.string(),

  // Executive summary
  market_summary: z.string().min(20),

  // Per-engine analysis
  macro_outlook: EngineOutlookSchema,
  fundamental_outlook: EngineOutlookSchema,
  news_sentiment: z.object({
    signal: z.enum(["bullish", "bearish", "sideways", "mixed", "neutral"]),
    summary: z.string().min(10),
    items: z.array(NewsItemAnalysisSchema),
  }),
  institutional_activity: z.object({
    etf_flow: EngineOutlookSchema,
    whale_activity: EngineOutlookSchema,
    dxy: EngineOutlookSchema,
    treasury_yield: EngineOutlookSchema,
  }),
  derivatives: z.object({
    open_interest: EngineOutlookSchema,
    funding_rate: EngineOutlookSchema,
    liquidation: EngineOutlookSchema,
  }),
  onchain: EngineOutlookSchema,
  volume: EngineOutlookSchema,
  ohlc: EngineOutlookSchema,
  market_structure: EngineOutlookSchema,

  // Synthesis
  probabilities: z.object({
    bullish: z.number().min(0).max(100),
    bearish: z.number().min(0).max(100),
    sideways: z.number().min(0).max(100),
  }).refine(
    (p) => Math.abs(p.bullish + p.bearish + p.sideways - 100) <= 1,
    { message: "Probabilities must sum to 100" }
  ),
  confidence: z.union([
    z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
  ]),
  risk_score: z.number().min(0).max(100),
  reasoning: z.string().min(50),
  conclusion: z.string().min(30),
});

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

/**
 * The JSON Schema representation for Gemini's native structured output mode.
 * This is passed directly to the API — not a Zod schema.
 */
export const ANALYSIS_GEMINI_SCHEMA = {
  type: "object",
  properties: {
    symbol: { type: "string" },
    market_summary: { type: "string" },
    macro_outlook: engineOutlookGeminiSchema(),
    fundamental_outlook: engineOutlookGeminiSchema(),
    news_sentiment: {
      type: "object",
      properties: {
        signal: { type: "string", enum: ["bullish", "bearish", "sideways", "mixed", "neutral"] },
        summary: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              headline: { type: "string" },
              classification: {
                type: "string",
                enum: ["Positive", "Negative", "Neutral", "Rumor", "Confirmed", "Breaking", "Fake"],
              },
              impact: { type: "string" },
            },
            required: ["headline", "classification", "impact"],
          },
        },
      },
      required: ["signal", "summary", "items"],
    },
    institutional_activity: {
      type: "object",
      properties: {
        etf_flow: engineOutlookGeminiSchema(),
        whale_activity: engineOutlookGeminiSchema(),
        dxy: engineOutlookGeminiSchema(),
        treasury_yield: engineOutlookGeminiSchema(),
      },
      required: ["etf_flow", "whale_activity", "dxy", "treasury_yield"],
    },
    derivatives: {
      type: "object",
      properties: {
        open_interest: engineOutlookGeminiSchema(),
        funding_rate: engineOutlookGeminiSchema(),
        liquidation: engineOutlookGeminiSchema(),
      },
      required: ["open_interest", "funding_rate", "liquidation"],
    },
    onchain: engineOutlookGeminiSchema(),
    volume: engineOutlookGeminiSchema(),
    ohlc: engineOutlookGeminiSchema(),
    market_structure: engineOutlookGeminiSchema(),
    probabilities: {
      type: "object",
      properties: {
        bullish: { type: "number" },
        bearish: { type: "number" },
        sideways: { type: "number" },
      },
      required: ["bullish", "bearish", "sideways"],
    },
    confidence: { type: "integer", minimum: 1, maximum: 5 },
    risk_score: { type: "number", minimum: 0, maximum: 100 },
    reasoning: { type: "string" },
    conclusion: { type: "string" },
  },
  required: [
    "symbol", "market_summary",
    "macro_outlook", "fundamental_outlook", "news_sentiment",
    "institutional_activity", "derivatives",
    "onchain", "volume", "ohlc", "market_structure",
    "probabilities", "confidence", "risk_score", "reasoning", "conclusion",
  ],
} as const;

function engineOutlookGeminiSchema() {
  return {
    type: "object",
    properties: {
      signal: { type: "string", enum: ["bullish", "bearish", "sideways", "mixed", "neutral"] },
      summary: { type: "string" },
      data_points: { type: "array", items: { type: "string" } },
    },
    required: ["signal", "summary", "data_points"],
  };
}
