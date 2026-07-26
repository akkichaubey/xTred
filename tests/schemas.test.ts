import { describe, it, expect } from "vitest";
import { AnalysisOutputSchema } from "../src/lib/ai/schemas";

describe("AI Analysis Output Zod Schema Validation", () => {
  it("should successfully validate a valid AI output structure", () => {
    const validOutput = {
      symbol: "BTCUSD",
      market_summary: "Strong spot accumulation with moderate leverage across active perpetual exchanges.",
      probabilities: { bullish: 55, bearish: 25, sideways: 20 },
      confidence: 4,
      risk_score: 35,
      reasoning: "DXY weakness and active spot ETF inflows support upward momentum.",
      conclusion: "Bullish bias with 55% probability. Confidence 4/5.",
      macro_outlook: { signal: "bullish", summary: "DXY trend is currently downward", data_points: ["DXY 103.2"] },
      fundamental_outlook: { signal: "bullish", summary: "Adoption rates increasing steadily", data_points: ["Active users up"] },
      news_sentiment: { signal: "bullish", summary: "Positive news sentiment dominating", items: [] },
      institutional_activity: {
        etf_flow: { signal: "bullish", summary: "Net inflow exceeds $250M daily", data_points: ["Inflow $250M"] },
        whale_activity: { signal: "bullish", summary: "Transfers out to cold wallets", data_points: ["Whale outflow"] },
        dxy: { signal: "bullish", summary: "DXY declining below key support", data_points: ["DXY breakdown"] },
        treasury_yield: { signal: "neutral", summary: "Yields remain stable at 4.2%", data_points: ["US10Y 4.2%"] },
      },
      derivatives: {
        open_interest: { signal: "neutral", summary: "Open interest flat across exchanges", data_points: ["OI $35B"] },
        funding_rate: { signal: "neutral", summary: "Funding rate remains at baseline 0.01%", data_points: ["Funding +0.01%"] },
        liquidation: { signal: "neutral", summary: "No major liquidation cascades", data_points: ["Liqs $12M"] },
      },
      onchain: { signal: "bullish", summary: "Exchange reserves dropping steadily", data_points: ["Reserves down"] },
      volume: { signal: "bullish", summary: "Spot volume rising on upward moves", data_points: ["Volume $2.4B"] },
      ohlc: { signal: "bullish", summary: "Higher lows pattern forming on 4H chart", data_points: ["4H Higher Lows"] },
      market_structure: { signal: "bullish", summary: "Bullish market structure intact above 65k", data_points: ["Key Support 65k"] },
    };

    const parsed = AnalysisOutputSchema.safeParse(validOutput);
    expect(parsed.success).toBe(true);
  });

  it("should fail validation if probabilities do not sum to 100", () => {
    const invalidProbabilities = {
      symbol: "BTCUSD",
      market_summary: "Invalid probability total across categories.",
      probabilities: { bullish: 50, bearish: 30, sideways: 30 }, // Sums to 110!
      confidence: 3,
      risk_score: 50,
      reasoning: "Invalid sum",
      conclusion: "Invalid sum",
      macro_outlook: { signal: "neutral", summary: "Neutral macro background", data_points: [] },
      fundamental_outlook: { signal: "neutral", summary: "Neutral fundamental status", data_points: [] },
      news_sentiment: { signal: "neutral", summary: "Neutral news feed status", items: [] },
      institutional_activity: {
        etf_flow: { signal: "neutral", summary: "Neutral ETF flow status", data_points: [] },
        whale_activity: { signal: "neutral", summary: "Neutral whale activity", data_points: [] },
        dxy: { signal: "neutral", summary: "Neutral DXY trend line", data_points: [] },
        treasury_yield: { signal: "neutral", summary: "Neutral treasury yield", data_points: [] },
      },
      derivatives: {
        open_interest: { signal: "neutral", summary: "Neutral open interest", data_points: [] },
        funding_rate: { signal: "neutral", summary: "Neutral funding rate", data_points: [] },
        liquidation: { signal: "neutral", summary: "Neutral liquidation state", data_points: [] },
      },
      onchain: { signal: "neutral", summary: "Neutral onchain status", data_points: [] },
      volume: { signal: "neutral", summary: "Neutral volume metrics", data_points: [] },
      ohlc: { signal: "neutral", summary: "Neutral OHLC pattern", data_points: [] },
      market_structure: { signal: "neutral", summary: "Neutral market structure", data_points: [] },
    };

    const parsed = AnalysisOutputSchema.safeParse(invalidProbabilities);
    expect(parsed.success).toBe(false);
  });

  it("should fail validation if confidence score is out of 1-5 range", () => {
    const invalidConfidence = {
      symbol: "BTCUSD",
      market_summary: "Invalid confidence rating score.",
      probabilities: { bullish: 40, bearish: 30, sideways: 30 },
      confidence: 6, // Max is 5!
      risk_score: 50,
      reasoning: "Out of range",
      conclusion: "Out of range",
      macro_outlook: { signal: "neutral", summary: "Neutral macro background", data_points: [] },
      fundamental_outlook: { signal: "neutral", summary: "Neutral fundamental status", data_points: [] },
      news_sentiment: { signal: "neutral", summary: "Neutral news feed status", items: [] },
      institutional_activity: {
        etf_flow: { signal: "neutral", summary: "Neutral ETF flow status", data_points: [] },
        whale_activity: { signal: "neutral", summary: "Neutral whale activity", data_points: [] },
        dxy: { signal: "neutral", summary: "Neutral DXY trend line", data_points: [] },
        treasury_yield: { signal: "neutral", summary: "Neutral treasury yield", data_points: [] },
      },
      derivatives: {
        open_interest: { signal: "neutral", summary: "Neutral open interest", data_points: [] },
        funding_rate: { signal: "neutral", summary: "Neutral funding rate", data_points: [] },
        liquidation: { signal: "neutral", summary: "Neutral liquidation state", data_points: [] },
      },
      onchain: { signal: "neutral", summary: "Neutral onchain status", data_points: [] },
      volume: { signal: "neutral", summary: "Neutral volume metrics", data_points: [] },
      ohlc: { signal: "neutral", summary: "Neutral OHLC pattern", data_points: [] },
      market_structure: { signal: "neutral", summary: "Neutral market structure", data_points: [] },
    };

    const parsed = AnalysisOutputSchema.safeParse(invalidConfidence);
    expect(parsed.success).toBe(false);
  });
});
