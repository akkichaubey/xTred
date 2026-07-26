import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/lib/delta/client";

/**
 * GET /api/delta/candles?symbol=BTCUSD&resolution=1h
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const symbol = searchParams.get("symbol");
    const resolution = searchParams.get("resolution") ?? "1h";
    const to = Math.floor(Date.now() / 1000);

    // Compute resolution-aware historical range in seconds
    const rangeSeconds =
      resolution === "1m"
        ? 24 * 3600 // 1 day
        : resolution === "5m"
        ? 3 * 24 * 3600 // 3 days
        : resolution === "15m"
        ? 7 * 24 * 3600 // 7 days
        : resolution === "1h"
        ? 30 * 24 * 3600 // 30 days
        : resolution === "4h"
        ? 90 * 24 * 3600 // 90 days
        : resolution === "1d"
        ? 365 * 24 * 3600 // 1 year
        : 730 * 24 * 3600; // 2 years (1w)

    const defaultFrom = to - rangeSeconds;
    const from = parseInt(searchParams.get("from") ?? String(defaultFrom));

    if (!symbol) {
      return NextResponse.json({ success: false, error: "symbol is required" }, { status: 400 });
    }

    const candles = await getCandles(symbol.toUpperCase(), resolution, from, to);
    return NextResponse.json({ success: true, data: candles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/delta/candles]", message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
