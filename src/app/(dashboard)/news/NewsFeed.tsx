"use client";

import { useState } from "react";
import { formatTimeAgo } from "@/lib/utils";

export interface NewsItem {
  id: string;
  source: string;
  headline: string;
  url: string | null;
  classification: string | null;
  sentiment_score: number | null;
  published_at: string | null;
  ingested_at: string;
}

interface NewsFeedProps {
  initialNews: NewsItem[];
}

export default function NewsFeed({ initialNews }: NewsFeedProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredNews = initialNews.filter((item) => {
    if (filter === "positive") return (item.sentiment_score ?? 0) > 0.1 || item.classification === "Positive";
    if (filter === "negative") return (item.sentiment_score ?? 0) < -0.1 || item.classification === "Negative";
    if (filter === "neutral") return Math.abs(item.sentiment_score ?? 0) <= 0.1 || item.classification === "Neutral";
    if (filter === "breaking") return item.classification === "Breaking";
    return true;
  });

  return (
    <div className="news-feed-container">
      {/* Filters */}
      <div className="news-filters">
        {["all", "positive", "negative", "neutral", "breaking"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`filter-pill ${filter === type ? "filter-pill--active" : ""}`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid of news cards */}
      {filteredNews.length === 0 ? (
        <div className="card empty-news">
          <p>No news items match the selected sentiment filter.</p>
        </div>
      ) : (
        <div className="news-grid">
          {filteredNews.map((item) => {
            const score = item.sentiment_score ?? 0;
            const sentimentClass = score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral";

            return (
              <div key={item.id} className="news-card card">
                <div className="news-card-header">
                  <span className="news-source">{item.source}</span>
                  <span className={`sentiment-badge sentiment-badge--${sentimentClass}`}>
                    {item.classification || (score > 0.1 ? "Positive" : score < -0.1 ? "Negative" : "Neutral")} ({score > 0 ? `+${score}` : score})
                  </span>
                </div>

                <h3 className="news-headline font-display">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.headline} ↗
                    </a>
                  ) : (
                    item.headline
                  )}
                </h3>

                <div className="news-card-footer">
                  <span className="news-time tabular-nums">
                    {formatTimeAgo(item.published_at || item.ingested_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .news-feed-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .news-filters {
          display: flex;
          gap: 0.375rem;
          flex-wrap: wrap;
        }

        .filter-pill {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 120ms ease;
        }

        .filter-pill:hover {
          color: var(--color-text-primary);
          border-color: var(--color-border-strong);
        }

        .filter-pill--active {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
          color: var(--color-brand-400);
        }

        .empty-news {
          padding: 3rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .news-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          justify-content: space-between;
          transition: transform 150ms ease, border-color 150ms ease;
        }

        .news-card:hover {
          border-color: var(--color-border-strong);
        }

        .news-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .news-source {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-brand-400);
        }

        .sentiment-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .sentiment-badge--positive {
          background: var(--color-bullish-dim);
          color: var(--color-bullish);
        }

        .sentiment-badge--negative {
          background: var(--color-bearish-dim);
          color: var(--color-bearish);
        }

        .sentiment-badge--neutral {
          background: var(--color-bg-overlay);
          color: var(--color-text-muted);
        }

        .news-headline {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.45;
          margin: 0;
        }

        .news-headline a {
          color: inherit;
          text-decoration: none;
        }

        .news-headline a:hover {
          color: var(--color-brand-400);
        }

        .news-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border-subtle);
        }

        .news-time {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
