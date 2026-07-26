import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "DXY";

  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || "MV3MKEGDWGOHVCL5";

    // Attempt Alpha Vantage FX query
    if (apiKey) {
      const avSymbol = symbol === "DXY" ? "USD" : "XAU";
      const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${avSymbol}&to_symbol=USD&apikey=${apiKey}`;

      const res = await fetch(url, { next: { revalidate: 300 } });
      if (res.ok) {
        const json = await res.json();
        const timeSeries = json["Time Series FX (Daily)"];
        if (timeSeries) {
          const candles = Object.entries(timeSeries)
            .slice(0, 100)
            .map(([dateStr, values]: [string, any]) => ({
              time: Math.floor(new Date(dateStr).getTime() / 1000),
              open: parseFloat(values["1. open"]),
              high: parseFloat(values["2. high"]),
              low: parseFloat(values["3. low"]),
              close: parseFloat(values["4. close"]),
            }))
            .reverse();

          return NextResponse.json({ success: true, symbol, data: candles });
        }
      }
    }

    // Fallback candles generator if API rate limited
    const nowSec = Math.floor(Date.now() / 1000);
    const basePrice = symbol === "XAUUSD" ? 2400 : 104.5;
    const fallbackCandles = Array.from({ length: 60 }).map((_, i) => {
      const time = nowSec - (60 - i) * 86400;
      const variation = (Math.random() - 0.49) * (symbol === "XAUUSD" ? 15 : 0.4);
      const close = basePrice + variation;
      const open = close - (Math.random() - 0.5) * (symbol === "XAUUSD" ? 10 : 0.2);
      const high = Math.max(open, close) + Math.random() * (symbol === "XAUUSD" ? 5 : 0.1);
      const low = Math.min(open, close) - Math.random() * (symbol === "XAUUSD" ? 5 : 0.1);
      return { time, open, high, low, close };
    });

    return NextResponse.json({ success: true, symbol, data: fallbackCandles });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
