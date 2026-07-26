import { NextRequest, NextResponse } from "next/server";
import { getProducts, getOpenInterest, getFundingHistory } from "@/lib/delta/client";

/**
 * GET /api/delta/products              — list all perpetuals
 * GET /api/delta/products?oi=BTCUSD    — open interest for symbol
 * GET /api/delta/products?funding=BTCUSD — funding rate history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const oiSymbol = searchParams.get("oi");
    const fundingSymbol = searchParams.get("funding");

    if (oiSymbol) {
      const oi = await getOpenInterest(oiSymbol.toUpperCase());
      return NextResponse.json({ success: true, data: oi });
    }

    if (fundingSymbol) {
      const funding = await getFundingHistory(fundingSymbol.toUpperCase());
      return NextResponse.json({ success: true, data: funding });
    }

    const products = await getProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/delta/products]", message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
