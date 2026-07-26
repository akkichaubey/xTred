"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface RealtimeAlert {
  id: string;
  symbol: string | null;
  alert_type: string;
  severity: number | null;
  message: string;
  created_at: string;
}

export function useRealtimeAlerts() {
  const [activeToast, setActiveToast] = useState<RealtimeAlert | null>(null);

  useEffect(() => {
    let channel: any = null;
    let supabase: any = null;

    try {
      supabase = createClient();
      
      channel = supabase
        .channel("realtime-alerts-toast")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "alerts",
          },
          (payload: any) => {
            const newAlert = payload.new as RealtimeAlert;
            setActiveToast(newAlert);
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("[useRealtimeAlerts] Realtime subscription notice:", err);
    }

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const dismissToast = () => setActiveToast(null);

  return { activeToast, dismissToast };
}
