import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export const metadata: Metadata = {
  title: "Settings & Risk Profile — xTred",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = {
    risk_max_trade_pct: 1.0,
    risk_max_daily_pct: 3.0,
    risk_max_weekly_pct: 6.0,
  };

  if (user) {
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
  }

  return (
    <div className="settings-page">
      <div className="page-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <h1
            className="font-display"
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: "0 0 0.25rem",
              letterSpacing: "-0.02em",
            }}
          >
            Settings & Risk Management
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
            Configure your personal risk limits and platform parameters
          </p>
        </div>
      </div>

      <SettingsForm initialProfile={profile} />
    </div>
  );
}
