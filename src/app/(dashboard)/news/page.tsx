import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NewsFeed, { type NewsItem } from "./NewsFeed";

export const metadata: Metadata = {
  title: "News Engine — xTred",
};

export default async function NewsPage() {
  const supabase = await createClient();

  let news: NewsItem[] = [];

  try {
    const { data } = await (supabase
      .from("news_items")
      .select("*")
      .order("ingested_at", { ascending: false })
      .limit(60) as any);

    if (data) {
      news = data as NewsItem[];
    }
  } catch {
    // Fallback empty if table not yet seeded
  }

  return (
    <div className="news-page">
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
            News & Sentiment Feed
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
            Real-time ingestion and Gemini-classified news sentiment analysis
          </p>
        </div>
      </div>

      <NewsFeed initialNews={news} />
    </div>
  );
}
