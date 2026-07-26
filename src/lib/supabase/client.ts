"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Supabase client for use in Client Components only.
 * Used for Realtime subscriptions (alerts, watchlist updates).
 * Auth/session is cookie-based via middleware — do NOT call signIn/signOut here.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
