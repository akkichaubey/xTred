// Auto-generated Supabase types placeholder.
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
// after running migrations to replace this file with real generated types.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string;
          display_name: string | null;
          risk_max_trade_pct: number;
          risk_max_daily_pct: number;
          risk_max_weekly_pct: number;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          risk_max_trade_pct?: number;
          risk_max_daily_pct?: number;
          risk_max_weekly_pct?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          risk_max_trade_pct?: number;
          risk_max_daily_pct?: number;
          risk_max_weekly_pct?: number;
          created_at?: string;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          created_at?: string;
        };
      };
      analysis_snapshots: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          bullish_pct: number;
          bearish_pct: number;
          sideways_pct: number;
          confidence: number;
          risk_score: number | null;
          reasoning: Json;
          raw_inputs: Json;
          model_version: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          bullish_pct: number;
          bearish_pct: number;
          sideways_pct: number;
          confidence: number;
          risk_score?: number | null;
          reasoning: Json;
          raw_inputs: Json;
          model_version: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analysis_snapshots"]["Insert"]>;
      };
      market_data_cache: {
        Row: {
          id: string;
          symbol: string;
          data_type: string;
          payload: Json;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          data_type: string;
          payload: Json;
          fetched_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["market_data_cache"]["Insert"]>;
      };
      news_items: {
        Row: {
          id: string;
          source: string;
          headline: string;
          url: string | null;
          classification: string | null;
          sentiment_score: number | null;
          published_at: string | null;
          ingested_at: string;
        };
        Insert: {
          id?: string;
          source: string;
          headline: string;
          url?: string | null;
          classification?: string | null;
          sentiment_score?: number | null;
          published_at?: string | null;
          ingested_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["news_items"]["Insert"]>;
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          symbol: string | null;
          alert_type: string;
          severity: number | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol?: string | null;
          alert_type: string;
          severity?: number | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
      };
      macro_events: {
        Row: {
          id: string;
          event_name: string;
          scheduled_at: string;
          actual_value: string | null;
          forecast_value: string | null;
          previous_value: string | null;
          impact: number | null;
        };
        Insert: {
          id?: string;
          event_name: string;
          scheduled_at: string;
          actual_value?: string | null;
          forecast_value?: string | null;
          previous_value?: string | null;
          impact?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["macro_events"]["Insert"]>;
      };
      trade_journal: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          direction: string | null;
          notes: string | null;
          linked_snapshot_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          direction?: string | null;
          notes?: string | null;
          linked_snapshot_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trade_journal"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
