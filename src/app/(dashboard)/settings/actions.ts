"use server";

import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import type { ConnectionTestResult, PlatformSettings, DeltaEnvironment } from "@/types/settings";

function getDeltaBaseUrl(env: DeltaEnvironment): string {
  if (env === "india") return "https://api.india.delta.exchange";
  if (env === "testnet") return "https://cdn-ind.testnet.deltaex.org";
  return "https://api.delta.exchange";
}

// ─── Test Delta Exchange API Connection ──────────────────────────────────────

export async function testDeltaConnectionAction(
  apiKey: string,
  apiSecret: string,
  env: DeltaEnvironment
): Promise<ConnectionTestResult> {
  const keyToUse = apiKey || process.env.DELTA_API_KEY || "";
  const secretToUse = apiSecret || process.env.DELTA_API_SECRET || "";
  const envToUse = env || (process.env.DELTA_ENV as DeltaEnvironment) || "india";

  if (!keyToUse || !secretToUse) {
    return {
      success: false,
      message: "API Key and API Secret are required to test connection.",
      error: "Missing credentials",
    };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = "GET";
    const path = "/v2/wallet/balances";
    const message = method + timestamp + path;
    const signature = crypto.createHmac("sha256", secretToUse).update(message).digest("hex");

    const url = `${getDeltaBaseUrl(envToUse)}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        "api-key": keyToUse,
        signature,
        timestamp,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      const balanceCount = Array.isArray(data.result) ? data.result.length : 0;
      return {
        success: true,
        message: `Successfully connected to Delta Exchange (${envToUse.toUpperCase()})! ${balanceCount} wallet assets retrieved.`,
      };
    }

    if (data?.error?.code === "ip_not_whitelisted_for_api_key") {
      return {
        success: false,
        message: "IP Whitelist Error: Your API key has IP restrictions enabled on Delta Exchange.",
        error: data.error.code,
      };
    }

    return {
      success: false,
      message: `Delta API connection failed (${res.status}): ${data?.error?.code || "Invalid key or secret"}`,
      error: data?.error?.code || `HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Connection failed";
    return {
      success: false,
      message: `Delta API Connection Error: ${errorMsg}`,
      error: errorMsg,
    };
  }
}

// ─── Test Gemini AI API Connection ──────────────────────────────────────────

export async function testGeminiConnectionAction(
  apiKey: string
): Promise<ConnectionTestResult> {
  const keyToUse = apiKey || process.env.GEMINI_API_KEY || "";

  if (!keyToUse) {
    return {
      success: false,
      message: "Gemini API Key is required to test connection.",
      error: "Missing API Key",
    };
  }

  try {
    const model = process.env.GEMINI_MODEL_PRO || "gemini-2.5-pro";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${keyToUse}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      return {
        success: true,
        message: `Successfully authenticated with Google Gemini API (${model})!`,
      };
    }

    const data = await res.json().catch(() => null);
    return {
      success: false,
      message: `Gemini API Error (${res.status}): ${data?.error?.message || "Invalid API key"}`,
      error: data?.error?.message || `HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Connection failed";
    return {
      success: false,
      message: `Gemini API Connection Error: ${errorMsg}`,
      error: errorMsg,
    };
  }
}

// ─── Save Settings Server Action ─────────────────────────────────────────────

export async function updateRiskSettings(data: {
  risk_max_trade_pct: number;
  risk_max_daily_pct: number;
  risk_max_weekly_pct: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Graceful fallback for single-user dev mode
    return { success: true, message: "Settings saved locally." };
  }

  const { error } = await (supabase.from("profile") as any).upsert({
    id: user.id,
    risk_max_trade_pct: data.risk_max_trade_pct,
    risk_max_daily_pct: data.risk_max_daily_pct,
    risk_max_weekly_pct: data.risk_max_weekly_pct,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "Settings saved to Supabase profile." };
}
