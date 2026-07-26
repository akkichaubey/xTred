"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markAlertAsRead(alertId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await (supabase
    .from("alerts") as any)
    .update({ is_read: true })
    .eq("id", alertId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[markAlertAsRead] error:", error);
    throw new Error("Failed to update alert");
  }

  revalidatePath("/alerts");
}

export async function markAllAlertsAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await (supabase
    .from("alerts") as any)
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("[markAllAlertsAsRead] error:", error);
    throw new Error("Failed to update alerts");
  }

  revalidatePath("/alerts");
}
