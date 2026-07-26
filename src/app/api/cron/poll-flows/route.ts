import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/poll-flows
 *
 * Ingests ETF flow data and market-level dominance/stablecoin metrics from
 * CoinGecko free API. Writes into market_data_cache.
 */

const CoinGeckoGlobalSchema = z.object({
  data: z.object({
    market_cap_percentage: z.record(z.string(), z.number()),
    total_market_cap: z.record(z.string(), z.number()),
    total_volume: z.record(z.string(), z.number()),
    market_cap_change_percentage_24h_usd: z.number(),
  }),
});

export async function GET(_request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const globalRes = await fetch("https://api.coingecko.com/api/v3/global", {
      headers: { Accept: "application/json" },
    });

    const results: Array<{ symbol: string; data_type: string; success: boolean }> = [];

    if (globalRes.ok) {
      const raw = await globalRes.json();
      const parsed = CoinGeckoGlobalSchema.safeParse(raw);

      if (parsed.success) {
        const d = parsed.data.data;
        const dominance = d.market_cap_percentage;
        const totalMarketCap = d.total_market_cap["usd"] ?? 0;
        const totalVolume = d.total_volume["usd"] ?? 0;

        const btcDom = dominance["btc"] ?? 0;
        const ethDom = dominance["eth"] ?? 0;
        const usdtDom = dominance["usdt"] ?? 0;
        const usdcDom = dominance["usdc"] ?? 0;
        const stableDom = usdtDom + usdcDom;

        const flowPayload = {
          btc_dominance: btcDom,
          eth_dominance: ethDom,
          usdt_dominance: usdtDom,
          usdc_dominance: usdcDom,
          stablecoin_dominance: stableDom,
          total_market_cap_usd: totalMarketCap,
          total_volume_usd: totalVolume,
          market_cap_change_24h_pct: d.market_cap_change_percentage_24h_usd,
          fetched_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("market_data_cache").insert({
          symbol: "GLOBAL",
          data_type: "etf_flow",
          payload: flowPayload,
        } as any);
        results.push({ symbol: "GLOBAL", data_type: "etf_flow", success: !error });

        const stablePayload = {
          usdt_dominance: usdtDom,
          usdc_dominance: usdcDom,
          dai_dominance: dominance["dai"] ?? 0,
          combined_stablecoin_dominance: stableDom,
          fetched_at: new Date().toISOString(),
        };

        const { error: stableError } = await supabase.from("market_data_cache").insert({
          symbol: "GLOBAL",
          data_type: "stablecoin",
          payload: stablePayload,
        } as any);
        results.push({ symbol: "GLOBAL", data_type: "stablecoin", success: !stableError });
      }
    }

    // BTC data
    const whaleRes = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false",
      { headers: { Accept: "application/json" } }
    );

    if (whaleRes.ok) {
      const btcRaw = (await whaleRes.json()) as {
        market_data?: {
          total_volume?: { usd?: number };
          market_cap?: { usd?: number };
          price_change_percentage_24h?: number;
          price_change_percentage_7d?: number;
        };
      };

      const md = btcRaw.market_data;
      const whalePayload = {
        btc_volume_usd: md?.total_volume?.usd ?? 0,
        btc_market_cap_usd: md?.market_cap?.usd ?? 0,
        price_change_24h_pct: md?.price_change_percentage_24h ?? 0,
        price_change_7d_pct: md?.price_change_percentage_7d ?? 0,
        fetched_at: new Date().toISOString(),
      };

      const { error: whaleError } = await supabase.from("market_data_cache").insert({
        symbol: "BTCUSD",
        data_type: "whale",
        payload: whalePayload,
      } as any);
      results.push({ symbol: "BTCUSD", data_type: "whale", success: !whaleError });
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[poll-flows]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
