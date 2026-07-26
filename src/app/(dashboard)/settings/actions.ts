"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SettingsSchema = z.object({
  risk_max_trade_pct: z.number().min(0.1).max(10),
  risk_max_daily_pct: z.number().min(0.5).max(20),
  risk_max_weekly_pct: z.number().min(1.0).max(40),
});

export async function updateRiskSettings(formData: {
  risk_max_trade_pct: number;
  risk_max_daily_pct: number;
  risk_max_weekly_pct: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const parsed = SettingsSchema.safeParse(formData);
  if (!parsed.success) {
    throw new Error("Invalid risk limit values");
  }

  const { error } = await (supabase
    .from("profile") as any)
    .update({
      risk_max_trade_pct: parsed.data.risk_max_trade_pct,
      risk_max_daily_pct: parsed.data.risk_max_daily_pct,
      risk_max_weekly_pct: parsed.data.risk_max_weekly_pct,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[updateRiskSettings] DB error:", error);
    throw new Error("Failed to update risk settings");
  }

  revalidatePath("/settings");
  return { success: true };
}
