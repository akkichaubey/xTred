import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely, resolving conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as currency with compact notation */
export function formatCurrency(
  value: number,
  currency = "USD",
  compact = false
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a large number with K/M/B suffixes */
export function formatCompact(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  return value.toFixed(decimals);
}

/** Format a percentage change with sign and color class */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/** Get color class based on positive/negative value */
export function getPnLClass(value: number): string {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

/** Format a price with appropriate decimal places based on magnitude */
export function formatPrice(price: number): string {
  if (price >= 10000) return price.toFixed(0);
  if (price >= 1000) return price.toFixed(1);
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

/** Format a Unix timestamp (seconds) to a readable date string */
export function formatTimestamp(unixSeconds: number, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(unixSeconds * 1000).toLocaleString("en-US", {
    hour12: false,
    ...opts,
  });
}

/** Format a date string or timestamp into a human-readable relative time (e.g. 5m ago, 2h ago) */
export function formatTimeAgo(dateInput: string | number | Date): string {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/** Format a relative time (e.g. "2 minutes ago") */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Truncate a string with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/** Convert Delta symbol to display format (BTCUSD → BTC/USD) */
export function formatSymbol(symbol: string): string {
  // Handle perpetual futures like BTCUSDT, ETHUSD
  const match = symbol.match(/^([A-Z]{2,5})(USDT?|USD|BTC|ETH)$/);
  if (match && match[1] && match[2]) return `${match[1]}/${match[2]}`;
  return symbol;
}

/** Get base asset from symbol (BTCUSD → BTC) */
export function getBaseAsset(symbol: string): string {
  return symbol.replace(/(USDT?|USD|BTC|ETH)$/, "");
}

/** Sleep for N milliseconds (for exponential backoff) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Compute exponential backoff delay */
export function backoffDelay(attempt: number, baseMs = 1000, maxMs = 30000): number {
  return Math.min(baseMs * Math.pow(2, attempt), maxMs);
}
