import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/poll-news
 *
 * Ingests crypto news from CryptoPanic and classifies sentiment.
 * Uses CoinGecko as a free fallback if CryptoPanic key is not set.
 */

const CryptoPanicNewsSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string().url().optional(),
      source: z.object({ title: z.string() }),
      published_at: z.string(),
      kind: z.string().optional(),
      votes: z
        .object({
          positive: z.number().optional(),
          negative: z.number().optional(),
        })
        .optional(),
    })
  ),
});

function computeSentimentScore(votes?: { positive?: number; negative?: number }): number {
  if (!votes) return 0;
  const pos = votes.positive ?? 0;
  const neg = votes.negative ?? 0;
  const total = pos + neg;
  if (total === 0) return 0;
  return parseFloat(((pos - neg) / total).toFixed(3));
}

function classifyFromSentiment(score: number): string {
  if (score > 0.5) return "Positive";
  if (score > 0.1) return "Positive";
  if (score < -0.5) return "Negative";
  if (score < -0.1) return "Negative";
  return "Neutral";
}

export async function GET(_request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const cryptoPanicKey = process.env.CRYPTOPANIC_API_KEY;

    let newsItems: Array<{
      source: string;
      headline: string;
      url: string | null;
      classification: string;
      sentiment_score: number;
      published_at: string;
    }> = [];

    if (cryptoPanicKey) {
      const res = await fetch(
        `https://cryptopanic.com/api/v1/posts/?auth_token=${cryptoPanicKey}&currencies=BTC,ETH&filter=hot&public=true&limit=20`
      );

      if (res.ok) {
        const raw = await res.json();
        const parsed = CryptoPanicNewsSchema.safeParse(raw);

        if (parsed.success) {
          newsItems = parsed.data.results.map((item) => {
            const score = computeSentimentScore(item.votes);
            return {
              source: item.source.title,
              headline: item.title,
              url: item.url ?? null,
              classification: classifyFromSentiment(score),
              sentiment_score: score,
              published_at: item.published_at,
            };
          });
        }
      }
    } else {
      // CoinGecko free news endpoint as fallback
      const res = await fetch(
        "https://api.coingecko.com/api/v3/news?per_page=20",
        { headers: { Accept: "application/json" } }
      );

      if (res.ok) {
        const raw = (await res.json()) as {
          data?: Array<{
            title: string;
            url: string;
            news_site: string;
            created_at: string;
          }>;
        };

        newsItems = (raw.data ?? []).slice(0, 20).map((item) => ({
          source: item.news_site ?? "CoinGecko",
          headline: item.title ?? "",
          url: item.url ?? null,
          classification: "Neutral",
          sentiment_score: 0,
          published_at: item.created_at ?? new Date().toISOString(),
        }));
      }
    }

    if (newsItems.length > 0) {
      const { error } = await supabase.from("news_items").insert(newsItems as any);
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      ingested: newsItems.length,
      source: cryptoPanicKey ? "cryptopanic" : "coingecko",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[poll-news]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
