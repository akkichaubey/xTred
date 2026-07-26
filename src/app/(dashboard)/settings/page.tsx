import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export const metadata: Metadata = {
  title: "Settings & API Configuration — xTred",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = {
    risk_max_trade_pct: 1.0,
    risk_max_daily_pct: 3.0,
    risk_max_weekly_pct: 6.0,
  };

  if (user) {
    try {
      const { data } = await (supabase
        .from("profile")
        .select("risk_max_trade_pct, risk_max_daily_pct, risk_max_weekly_pct")
        .eq("id", user.id)
        .maybeSingle() as any);

      if (data) {
        profile = {
          risk_max_trade_pct: data.risk_max_trade_pct ?? 1.0,
          risk_max_daily_pct: data.risk_max_daily_pct ?? 3.0,
          risk_max_weekly_pct: data.risk_max_weekly_pct ?? 6.0,
        };
      }
    } catch {
      // Fallback
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Settings & Platform Configuration
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Configure API credentials, dynamic refresh frequencies, AI models, and risk parameters
        </p>
      </div>

      <SettingsForm initialProfile={profile} />
    </div>
  );
}
