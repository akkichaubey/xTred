"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const JournalEntrySchema = z.object({
  symbol: z.string().min(3).toUpperCase(),
  direction: z.enum(["long", "short"]),
  entry_price: z.number().positive(),
  exit_price: z.number().positive().optional(),
  size: z.number().positive().optional(),
  pnl: z.number().optional(),
  notes: z.string().optional(),
});

export async function addJournalEntry(formData: {
  symbol: string;
  direction: "long" | "short";
  entry_price: number;
  exit_price?: number;
  size?: number;
  pnl?: number;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const parsed = JournalEntrySchema.safeParse(formData);
  if (!parsed.success) {
    throw new Error("Invalid journal entry values");
  }

  const { error } = await (supabase.from("trade_journal").insert({
    user_id: user.id,
    symbol: parsed.data.symbol,
    direction: parsed.data.direction,
    entry_price: parsed.data.entry_price,
    exit_price: parsed.data.exit_price ?? null,
    size: parsed.data.size ?? null,
    pnl: parsed.data.pnl ?? null,
    notes: parsed.data.notes ?? null,
  } as any) as any);

  if (error) {
    console.error("[addJournalEntry] DB error:", error);
    throw new Error("Failed to save journal entry");
  }

  revalidatePath("/journal");
  return { success: true };
}
