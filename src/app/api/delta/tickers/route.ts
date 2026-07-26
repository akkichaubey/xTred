import { NextRequest, NextResponse } from "next/server";
import { getTicker, getAllTickers } from "@/lib/delta/client";

/**
 * GET /api/delta/tickers
 * GET /api/delta/tickers?symbol=BTCUSD
 *
 * Server-side proxy for Delta ticker data.
 * API keys never reach the browser.
 */
export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get("symbol");

    if (symbol) {
      const ticker = await getTicker(symbol.toUpperCase());
      return NextResponse.json({ success: true, data: ticker });
    }

    const tickers = await getAllTickers();
    return NextResponse.json({ success: true, data: tickers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/delta/tickers]", message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
