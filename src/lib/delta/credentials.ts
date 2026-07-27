import type { DeltaEnvironment } from "@/types/settings";

export interface DeltaCredentials {
  apiKey?: string;
  apiSecret?: string;
  env?: DeltaEnvironment;
}

export function resolveDeltaCredentials(override?: DeltaCredentials): {
  apiKey: string;
  apiSecret: string;
  env: DeltaEnvironment;
} {
  const envKey = (process.env.DELTA_API_KEY || "").trim();
  const envSecret = (process.env.DELTA_API_SECRET || "").trim();

  const overrideKey = (override?.apiKey || "").trim();
  const overrideSecret = (override?.apiSecret || "").trim();

  let apiKey = overrideKey || envKey;
  let apiSecret = overrideSecret || envSecret;

  // Local Dev Protection: If override key matches server .env key, ALWAYS use server .env secret
  // to prevent stale browser localStorage secret mismatches from causing HTTP 401 errors!
  if (envKey && (overrideKey === envKey || !overrideKey) && envSecret) {
    apiKey = envKey;
    apiSecret = envSecret;
  }

  const rawEnv = (override?.env || process.env.DELTA_ENV || "india").toLowerCase().trim();

  let env: DeltaEnvironment = "india";
  if (rawEnv === "production" || rawEnv === "mainnet") {
    env = "production";
  } else if (rawEnv === "testnet" || rawEnv === "testnet_explicit") {
    env = "testnet";
  } else if (rawEnv === "india" || rawEnv === "mainnet_india") {
    env = "india";
  }

  return { apiKey, apiSecret, env };
}

export function getDeltaBaseUrl(env: DeltaEnvironment): string {
  if (env === "india") return "https://api.india.delta.exchange";
  if (env === "testnet") return "https://cdn-ind.testnet.deltaex.org";
  return "https://api.delta.exchange";
}
