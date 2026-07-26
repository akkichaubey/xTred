import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/lib/delta/client";

/**
 * GET /api/delta/candles?symbol=BTCUSD&resolution=1h&from=1700000000&to=1700086400
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const symbol = searchParams.get("symbol");
    const resolution = searchParams.get("resolution") ?? "1h";
    const to = Math.floor(Date.now() / 1000);
    const from = parseInt(searchParams.get("from") ?? String(to - 7 * 24 * 3600));

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
