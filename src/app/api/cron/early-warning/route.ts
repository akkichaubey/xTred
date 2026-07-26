import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/early-warning
 *
 * Section 30 — Early Warning System
 * Scans 13 signal categories. If 3+ align to an extreme state,
 * writes a HIGH VOLATILITY ALERT to the alerts table.
 * Runs every 30 minutes via Vercel Cron.
 */

interface Signal {
  name: string;
  triggered: boolean;
  value?: string;
}

export async function GET(_request: NextRequest) {
  const supabase = createAdminClient();

  try {
    // ── Fetch relevant data from cache ────────────────────────────────────────
    type FlowRow = { data_type: string; payload: Record<string, unknown>; fetched_at: string };
    type NewsRow = { classification: string | null; sentiment_score: number | null };
    type MacroRow = { event_name: string; scheduled_at: string; impact: number | null };

    const [flowData, newsData, macroData] = await Promise.all([
      supabase
        .from("market_data_cache")
        .select("data_type, payload, fetched_at")
        .eq("symbol", "GLOBAL")
        .order("fetched_at", { ascending: false })
        .limit(10) as unknown as Promise<{ data: FlowRow[] | null; error: unknown }>,
      supabase
        .from("news_items")
        .select("classification, sentiment_score")
        .order("ingested_at", { ascending: false })
        .limit(20) as unknown as Promise<{ data: NewsRow[] | null; error: unknown }>,
      supabase
        .from("macro_events")
        .select("*")
        .gte("scheduled_at", new Date().toISOString())
        .lte("scheduled_at", new Date(Date.now() + 24 * 3600 * 1000).toISOString())
        .eq("impact", 3) as unknown as Promise<{ data: MacroRow[] | null; error: unknown }>,
    ]);

    const flowPayload = (flowData.data?.find((d) => d.data_type === "etf_flow")
      ?.payload ?? {}) as Record<string, number>;

    // ── Evaluate signals ──────────────────────────────────────────────────────
    const signals: Signal[] = [];

    // 1. High-impact macro event in next 24h
    signals.push({
      name: "macro_event",
      triggered: (macroData.data?.length ?? 0) > 0,
      value: macroData.data?.map((e) => e.event_name).join(", ") ?? "",
    });

    // 2. Breaking news
    const breakingCount = newsData.data?.filter(
      (n) => n.classification === "Breaking"
    ).length ?? 0;
    signals.push({
      name: "breaking_news",
      triggered: breakingCount >= 2,
      value: `${breakingCount} breaking news items`,
    });

    // 3. Negative news dominance
    const negCount = newsData.data?.filter((n) => n.classification === "Negative").length ?? 0;
    const totalNews = newsData.data?.length ?? 1;
    signals.push({
      name: "negative_news_dominance",
      triggered: negCount / totalNews > 0.6,
      value: `${Math.round((negCount / totalNews) * 100)}% negative sentiment`,
    });

    // 4. Stablecoin dominance spike (capital rotation signal)
    const stableDominance = flowPayload?.stablecoin_dominance ?? 0;
    signals.push({
      name: "stablecoin_dominance",
      triggered: stableDominance > 12, // >12% = elevated risk-off
      value: `${stableDominance.toFixed(2)}% stablecoin dominance`,
    });

    // 5. Market cap decline
    const marketCapChange = flowPayload?.market_cap_change_24h_pct ?? 0;
    signals.push({
      name: "market_cap_decline",
      triggered: marketCapChange < -5,
      value: `${marketCapChange.toFixed(2)}% market cap change 24h`,
    });

    // 6. BTC dominance spike (altcoin bleed signal)
    const btcDominance = flowPayload?.btc_dominance ?? 0;
    signals.push({
      name: "btc_dominance_spike",
      triggered: btcDominance > 58,
      value: `${btcDominance.toFixed(2)}% BTC dominance`,
    });

    // ── Count triggered signals ────────────────────────────────────────────────
    const triggeredSignals = signals.filter((s) => s.triggered);
    const triggerCount = triggeredSignals.length;

    // Section 30: If 3+ signals align → HIGH VOLATILITY ALERT
    if (triggerCount >= 3) {
      // Find the user to alert (single-user app — get first authenticated user)
      type ProfileRow = { id: string };
      const { data: profiles } = await (supabase
        .from("profile")
        .select("id")
        .limit(1)
        .single() as unknown as Promise<{ data: ProfileRow | null; error: unknown }>);

      if (profiles) {
        const triggeredNames = triggeredSignals.map((s) => s.name).join(", ");
        const message = `⚠ High Volatility Alert: ${triggerCount} signals triggered (${triggeredNames}). Market conditions suggest elevated risk.`;

        await (supabase.from("alerts").insert({
          user_id: profiles.id,
          symbol: null,
          alert_type: "high_volatility",
          severity: triggerCount >= 5 ? 3 : 2,
          message,
          metadata: {
            triggered_signals: triggeredSignals,
            total_signals_checked: signals.length,
            trigger_count: triggerCount,
          },
          is_read: false,
        } as any));
      }
    }

    return NextResponse.json({
      success: true,
      signals_checked: signals.length,
      signals_triggered: triggerCount,
      alert_raised: triggerCount >= 3,
      timestamp: new Date().toISOString(),
      triggered: triggeredSignals.map((s) => ({ name: s.name, value: s.value })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[early-warning]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
