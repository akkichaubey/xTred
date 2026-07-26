import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AlertList, { type AlertItem } from "./AlertList";

export const metadata: Metadata = {
  title: "Alerts Center — xTred",
};

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let alerts: AlertItem[] = [];

  if (user) {
    const { data } = await (supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50) as any);

    if (data) {
      alerts = data as AlertItem[];
    }
  }

  return (
    <div className="alerts-page">
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
            Early Warning Alerts
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
            Section 30 volatility spikes, macro surprises, and derivative liquidation cascades
          </p>
        </div>
      </div>

      <AlertList initialAlerts={alerts} />
    </div>
  );
}
