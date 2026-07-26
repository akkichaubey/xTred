import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/poll-macro
 *
 * Fetches upcoming economic calendar events from Alpha Vantage and
 * stores them in macro_events. Runs on schedule via Vercel Cron.
 * Protected by CRON_SECRET bearer token (checked in middleware).
 */
export async function GET(_request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      console.warn("[poll-macro] ALPHA_VANTAGE_API_KEY not set — skipping");
      return NextResponse.json({ success: true, skipped: true, reason: "no api key" });
    }

    // Alpha Vantage economic calendar endpoint
    const res = await fetch(
      `https://www.alphavantage.co/query?function=ECONOMIC_CALENDAR&apikey=${apiKey}`
    );

    if (!res.ok) {
      throw new Error(`Alpha Vantage ${res.status}: ${res.statusText}`);
    }

    // Alpha Vantage returns CSV for this endpoint
    const text = await res.text();
    const lines = text.split("\n").slice(1); // skip header
    const events: Array<{
      event_name: string;
      scheduled_at: string;
      impact: number;
      forecast_value: string | null;
      previous_value: string | null;
      currency: string;
    }> = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      const cols = line.split(",");
      if (cols.length < 4) continue;

      const [name, date, _country, impact, forecast, previous] = cols;
      if (!name || !date) continue;

      const impactNum = impact?.toLowerCase().includes("high")
        ? 3
        : impact?.toLowerCase().includes("medium")
        ? 2
        : 1;

      // Only keep high-impact events
      if (impactNum < 2) continue;

      events.push({
        event_name: name.trim(),
        scheduled_at: new Date(date.trim()).toISOString(),
        impact: impactNum,
        forecast_value: forecast?.trim() || null,
        previous_value: previous?.trim() || null,
        currency: "USD",
      });
    }

    if (events.length > 0) {
      const { error } = await supabase
        .from("macro_events")
        .upsert(events as any, { onConflict: "event_name,scheduled_at" });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      upserted: events.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[poll-macro]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
