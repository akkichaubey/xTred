import { z } from "zod";

export type RefreshInterval = 1 | 2 | 3 | 5 | 10 | 15 | 30 | 60;
export type ConnectionStatus = "connected" | "disconnected" | "untested";
export type DeltaEnvironment = "india" | "production" | "testnet";
export type GeminiModel = "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-1.5-pro" | "gemini-1.5-flash";

export interface PlatformSettings {
  deltaApiKey: string;
  deltaApiSecret: string;
  deltaEnv: DeltaEnvironment;
  geminiApiKey: string;
  geminiModel: GeminiModel;
  refreshInterval: RefreshInterval;
  riskMaxTradePct: number;
  riskMaxDailyPct: number;
  riskMaxWeeklyPct: number;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  error?: string;
}

export const SettingsSchema = z.object({
  deltaApiKey: z.string().optional(),
  deltaApiSecret: z.string().optional(),
  deltaEnv: z.enum(["india", "production", "testnet"]).default("india"),
  geminiApiKey: z.string().optional(),
  geminiModel: z
    .enum(["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"])
    .default("gemini-2.5-pro"),
  refreshInterval: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(5),
      z.literal(10),
      z.literal(15),
      z.literal(30),
      z.literal(60),
    ])
    .default(5),
  riskMaxTradePct: z.number().min(0.1).max(10).default(1.0),
  riskMaxDailyPct: z.number().min(0.5).max(20).default(3.0),
  riskMaxWeeklyPct: z.number().min(1.0).max(40).default(6.0),
});
