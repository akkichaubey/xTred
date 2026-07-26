import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured, MODEL_PRO } from "@/lib/ai/gemini-client";
import {
  XTRED_SYSTEM_PROMPT,
  buildMarketContextPrompt,
  RULEBOOK_VERSION,
  type MarketAnalysisContext,
} from "@/lib/ai/prompts/xtred-rulebook";
import { AnalysisOutputSchema, ANALYSIS_GEMINI_SCHEMA, type AnalysisOutput } from "@/lib/ai/schemas";
import { getTicker, getCandles, getOpenInterest, getFundingHistory } from "@/lib/delta/client";
import { createClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  symbol: z.string().min(3).max(20).toUpperCase(),
});

/**
 * POST /api/ai/analyze
 *
 * Full Rulebook-driven analysis for a symbol.
 * 1. Gather real market data from Delta Exchange + Supabase cache
 * 2. Assemble structured market context
 * 3. Send to Gemini Pro with Rulebook system prompt + JSON schema mode
 * 4. Zod-validate response
 * 5. Persist to analysis_snapshots
 * 6. Return to client
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse + validate request
  let symbol: string;
  try {
    const body = await request.json() as unknown;
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }
    symbol = parsed.data.symbol;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    // ── 1. Gather market data ────────────────────────────────────────────────
    const [ticker, candles4h, oi, funding] = await Promise.allSettled([
      getTicker(symbol),
      getCandles(symbol, "4h", Math.floor(Date.now() / 1000) - 7 * 24 * 3600, Math.floor(Date.now() / 1000)),
      getOpenInterest(symbol),
      getFundingHistory(symbol, 24),
    ]);

    const tickerData = ticker.status === "fulfilled" ? ticker.value : null;
    const candleData = candles4h.status === "fulfilled" ? candles4h.value.slice(-48) : [];
    const oiData = oi.status === "fulfilled" ? oi.value : null;
    const fundingData = funding.status === "fulfilled" ? funding.value : [];

    // ── 2. Fetch cached context data from Supabase ───────────────────────────
    type NewsRow = { source: string; headline: string; classification: string | null; sentiment_score: number | null; published_at: string | null };
    type FlowRow = { data_type: string; payload: Record<string, unknown>; fetched_at: string };

    const [newsResult, macroResult, flowResult] = await Promise.all([
      supabase
        .from("news_items")
        .select("source, headline, classification, sentiment_score, published_at")
        .order("published_at", { ascending: false })
        .limit(10) as unknown as Promise<{ data: NewsRow[] | null; error: unknown }>,
      supabase
        .from("macro_events")
        .select("*")
        .gte("scheduled_at", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
        .lte("scheduled_at", new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString())
        .order("scheduled_at"),
      supabase
        .from("market_data_cache")
        .select("data_type, payload, fetched_at")
        .eq("symbol", "GLOBAL")
        .order("fetched_at", { ascending: false })
        .limit(5) as unknown as Promise<{ data: FlowRow[] | null; error: unknown }>,
    ]);

    // ── 3. Build market context ──────────────────────────────────────────────
    const flowPayload = (flowResult.data?.find((r) => r.data_type === "etf_flow")?.payload ?? {}) as Record<string, number>;

    const context: MarketAnalysisContext = {
      symbol,
      timestamp: new Date().toISOString(),
      ohlc: {
        current_price: tickerData ? parseFloat(tickerData.last_price) : undefined,
        high_24h: tickerData ? parseFloat(tickerData.high) : undefined,
        low_24h: tickerData ? parseFloat(tickerData.low) : undefined,
        change_24h_pct: tickerData
          ? ((parseFloat(tickerData.last_price) - parseFloat(tickerData.open)) / parseFloat(tickerData.open)) * 100
          : undefined,
        candles_4h: candleData.slice(-12),
      },
      ticker: {
        mark_price: tickerData?.mark_price,
        last_price: tickerData?.last_price,
        funding_rate: tickerData?.funding_rate,
        predicted_funding_rate: tickerData?.predicted_funding_rate,
        next_funding_realization: tickerData?.next_funding_realization,
        open_interest: oiData?.open_interest ?? tickerData?.open_interest,
        volume_24h: tickerData?.volume,
      },
      macro: {
        upcoming_events: macroResult.data ?? [],
        dxy_level: "unavailable — DXY data source not configured",
        us10y_yield: "unavailable — Treasury yield data source not configured",
        btc_dominance: flowPayload["btc_dominance"],
        market_cap_change_24h: flowPayload["market_cap_change_24h_pct"],
        notes: macroResult.data && macroResult.data.length > 0
          ? `${macroResult.data.length} macro events in next 14 days`
          : "No major macro events in next 14 days",
      },
      news: (newsResult.data ?? []).map((n) => ({
        source: n.source,
        headline: n.headline,
        classification: n.classification ?? undefined,
        sentiment_score: n.sentiment_score ?? undefined,
        published_at: n.published_at ?? undefined,
      })),
      flows: {
        btc_dominance: flowPayload["btc_dominance"],
        stablecoin_dominance: flowPayload["stablecoin_dominance"],
        market_cap_change_24h: flowPayload["market_cap_change_24h_pct"],
        notes: Object.keys(flowPayload).length > 0 ? "Market dominance data available" : "Flow data unavailable",
      },
      derivatives: {
        funding_rate: tickerData?.funding_rate,
        funding_history: fundingData.slice(0, 12),
        open_interest: oiData?.open_interest,
        recent_liquidations: [],
      },
      onchain: {
        notes: "On-chain data not yet configured. Glassnode integration pending.",
        metrics: {},
      },
    };

    // ── 4. Call Gemini Pro with Rulebook + structured output ─────────────────
    const rawAnalysis = await generateStructured<AnalysisOutput>(
      MODEL_PRO,
      XTRED_SYSTEM_PROMPT,
      buildMarketContextPrompt(context),
      ANALYSIS_GEMINI_SCHEMA
    );

    // ── 5. Zod validate ──────────────────────────────────────────────────────
    const validated = AnalysisOutputSchema.safeParse({ ...rawAnalysis, symbol });
    if (!validated.success) {
      console.error("[/api/ai/analyze] Gemini output failed Zod validation:", validated.error.flatten());
      // Retry once with stricter instruction
      return NextResponse.json(
        { error: "Analysis output validation failed. Please retry." },
        { status: 502 }
      );
    }

    const analysis = validated.data;

    // ── 6. Persist to analysis_snapshots ─────────────────────────────────────
    const insertResult = await (supabase
      .from("analysis_snapshots")
      .insert({
        user_id: user.id,
        symbol,
        bullish_pct: analysis.probabilities.bullish,
        bearish_pct: analysis.probabilities.bearish,
        sideways_pct: analysis.probabilities.sideways,
        confidence: analysis.confidence,
        risk_score: analysis.risk_score,
        reasoning: analysis as unknown as Record<string, unknown>,
        raw_inputs: context as unknown as Record<string, unknown>,
        model_version: `${MODEL_PRO}@rulebook-v${RULEBOOK_VERSION}`,
      } as any)
      .select("id")
      .single() as unknown as Promise<{ data: { id: string } | null; error: { message: string } | null }>);

    const snapshot = insertResult.data;
    const dbError = insertResult.error;

    if (dbError) {
      console.error("[/api/ai/analyze] DB insert error:", dbError.message);
    }

    return NextResponse.json({
      success: true,
      analysis,
      snapshot_id: snapshot?.id ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[/api/ai/analyze]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
