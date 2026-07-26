import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env variables manually for CLI script execution
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key!] = value.trim();
      }
    });
  }
}

async function seedDatabase() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Error: Supabase URL or Service Role Key missing in .env");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  console.log("Seeding Supabase Database...");

  try {
    // 1. Seed Macro Events
    console.log("Seeding macro_events...");
    const macroEvents = [
      {
        event_name: "FOMC Rate Decision",
        scheduled_at: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
        impact: 3,
        forecast_value: "5.25%",
        previous_value: "5.25%",
        currency: "USD",
      },
      {
        event_name: "US CPI (YoY)",
        scheduled_at: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
        impact: 3,
        forecast_value: "3.1%",
        previous_value: "3.3%",
        currency: "USD",
      },
      {
        event_name: "Non-Farm Payrolls (NFP)",
        scheduled_at: new Date(Date.now() + 12 * 86400 * 1000).toISOString(),
        impact: 3,
        forecast_value: "180K",
        previous_value: "206K",
        currency: "USD",
      },
    ];

    const { error: macroError } = await supabase
      .from("macro_events")
      .upsert(macroEvents as any, { onConflict: "event_name,scheduled_at" });

    if (macroError) console.warn("macro_events seed notice:", macroError.message);
    else console.log("✔ macro_events seeded successfully");

    // 2. Seed News Items
    console.log("Seeding news_items...");
    const newsItems = [
      {
        source: "CoinDesk",
        headline: "Institutional Bitcoin ETF Inflows Reach Highest Single-Day Volume in 3 Months",
        url: "https://coindesk.com",
        classification: "Positive",
        sentiment_score: 0.85,
        published_at: new Date(Date.now() - 3600 * 1000).toISOString(),
        ingested_at: new Date().toISOString(),
      },
      {
        source: "Bloomberg Crypto",
        headline: "Federal Reserve Signals Potential Interest Rate Pivot Following Soft Inflation Data",
        url: "https://bloomberg.com",
        classification: "Positive",
        sentiment_score: 0.72,
        published_at: new Date(Date.now() - 7200 * 1000).toISOString(),
        ingested_at: new Date().toISOString(),
      },
      {
        source: "CoinTelegraph",
        headline: "Derivatives Open Interest Surges to $35B as BTC Holds Above $66,000 Support",
        url: "https://cointelegraph.com",
        classification: "Neutral",
        sentiment_score: 0.15,
        published_at: new Date(Date.now() - 14400 * 1000).toISOString(),
        ingested_at: new Date().toISOString(),
      },
    ];

    const { error: newsError } = await supabase
      .from("news_items")
      .insert(newsItems as any);

    if (newsError) console.warn("news_items seed notice:", newsError.message);
    else console.log("✔ news_items seeded successfully");

    // 3. Seed Market Data Cache (Flows & On-chain)
    console.log("Seeding market_data_cache...");
    const cacheItems = [
      {
        symbol: "GLOBAL",
        data_type: "etf_flow",
        payload: {
          btc_dominance: 54.8,
          eth_dominance: 16.5,
          usdt_dominance: 5.9,
          usdc_dominance: 2.2,
          total_market_cap_usd: 2480000000000,
          total_volume_usd: 68000000000,
          market_cap_change_24h_pct: 1.82,
          fetched_at: new Date().toISOString(),
        },
      },
      {
        symbol: "GLOBAL",
        data_type: "stablecoin",
        payload: {
          usdt_dominance: 5.9,
          usdc_dominance: 2.2,
          combined_stablecoin_dominance: 8.1,
          fetched_at: new Date().toISOString(),
        },
      },
      {
        symbol: "BTCUSD",
        data_type: "onchain",
        payload: {
          exchange_reserve_btc: 2145000,
          exchange_netflow_24h_btc: -1850,
          active_addresses_24h: 935000,
          miner_outflow_btc: 320,
          hashrate_ehs: 645.2,
          fetched_at: new Date().toISOString(),
        },
      },
    ];

    const { error: cacheError } = await supabase
      .from("market_data_cache")
      .insert(cacheItems as any);

    if (cacheError) console.warn("market_data_cache seed notice:", cacheError.message);
    else console.log("✔ market_data_cache seeded successfully");

    console.log("\nDatabase Seeding Complete! All dashboard views ready.");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seedDatabase();
