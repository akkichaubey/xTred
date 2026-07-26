export interface MarketDefinition {
  symbol: string;
  name: string;
  category: "crypto" | "commodity" | "fx";
  basePrice: number;
  change24hPct: number;
  volume24hUsd: number;
  probabilisticProfile: {
    probabilities: { bullish: number; bearish: number; sideways: number };
    confidence: 1 | 2 | 3 | 4 | 5;
    riskScore: number;
    conclusion: string;
  };
}

export const MARKET_REGISTRY: Record<string, MarketDefinition> = {
  BTCUSD: {
    symbol: "BTCUSD",
    name: "Bitcoin Perpetual",
    category: "crypto",
    basePrice: 66420,
    change24hPct: 2.15,
    volume24hUsd: 1250000000,
    probabilisticProfile: {
      probabilities: { bullish: 52, bearish: 24, sideways: 24 },
      confidence: 4,
      riskScore: 42,
      conclusion: "Bullish 52% / Bearish 24% / Sideways 24% — Confidence ★★★★☆ (4/5). Strong spot ETF accumulation and low exchange reserves support upward momentum.",
    },
  },
  ETHUSD: {
    symbol: "ETHUSD",
    name: "Ethereum Perpetual",
    category: "crypto",
    basePrice: 3450,
    change24hPct: 1.82,
    volume24hUsd: 680000000,
    probabilisticProfile: {
      probabilities: { bullish: 46, bearish: 32, sideways: 22 },
      confidence: 3,
      riskScore: 55,
      conclusion: "Bullish 46% / Bearish 32% / Sideways 22% — Confidence ★★★☆☆ (3/5). Moderate staking inflows balanced by mild funding rate expansion.",
    },
  },
  SOLUSD: {
    symbol: "SOLUSD",
    name: "Solana Perpetual",
    category: "crypto",
    basePrice: 184.5,
    change24hPct: 4.12,
    volume24hUsd: 420000000,
    probabilisticProfile: {
      probabilities: { bullish: 58, bearish: 22, sideways: 20 },
      confidence: 4,
      riskScore: 48,
      conclusion: "Bullish 58% / Bearish 22% / Sideways 20% — Confidence ★★★★☆ (4/5). High DEX transaction velocity and ecosystem momentum driving probability.",
    },
  },
  XRPUSD: {
    symbol: "XRPUSD",
    name: "Ripple Perpetual",
    category: "crypto",
    basePrice: 0.585,
    change24hPct: -0.95,
    volume24hUsd: 190000000,
    probabilisticProfile: {
      probabilities: { bullish: 40, bearish: 38, sideways: 22 },
      confidence: 3,
      riskScore: 62,
      conclusion: "Bullish 40% / Bearish 38% / Sideways 22% — Confidence ★★★☆☆ (3/5). Consolidation pattern near resistance with balanced buyer/seller pressure.",
    },
  },
  AVAXUSD: {
    symbol: "AVAXUSD",
    name: "Avalanche Perpetual",
    category: "crypto",
    basePrice: 28.4,
    change24hPct: 3.25,
    volume24hUsd: 145000000,
    probabilisticProfile: {
      probabilities: { bullish: 50, bearish: 28, sideways: 22 },
      confidence: 4,
      riskScore: 50,
      conclusion: "Bullish 50% / Bearish 28% / Sideways 22% — Confidence ★★★★☆ (4/5). Subnet expansion and institutional deployment supporting upside bias.",
    },
  },
  DOGEUSD: {
    symbol: "DOGEUSD",
    name: "Dogecoin Perpetual",
    category: "crypto",
    basePrice: 0.125,
    change24hPct: 5.10,
    volume24hUsd: 310000000,
    probabilisticProfile: {
      probabilities: { bullish: 54, bearish: 26, sideways: 20 },
      confidence: 3,
      riskScore: 68,
      conclusion: "Bullish 54% / Bearish 26% / Sideways 20% — Confidence ★★★☆☆ (3/5). High social momentum and volume expansion driving short-term probability.",
    },
  },
  LINKUSD: {
    symbol: "LINKUSD",
    name: "Chainlink Perpetual",
    category: "crypto",
    basePrice: 14.8,
    change24hPct: 1.45,
    volume24hUsd: 98000000,
    probabilisticProfile: {
      probabilities: { bullish: 48, bearish: 28, sideways: 24 },
      confidence: 4,
      riskScore: 44,
      conclusion: "Bullish 48% / Bearish 28% / Sideways 24% — Confidence ★★★★☆ (4/5). CCIP integration velocity and staking lockups providing structural floor.",
    },
  },
  ADAUSD: {
    symbol: "ADAUSD",
    name: "Cardano Perpetual",
    category: "crypto",
    basePrice: 0.38,
    change24hPct: -0.42,
    volume24hUsd: 85000000,
    probabilisticProfile: {
      probabilities: { bullish: 38, bearish: 40, sideways: 22 },
      confidence: 3,
      riskScore: 58,
      conclusion: "Bullish 38% / Bearish 40% / Sideways 22% — Confidence ★★★☆☆ (3/5). Range-bound movement near EMA 50 support line.",
    },
  },
  DOTUSD: {
    symbol: "DOTUSD",
    name: "Polkadot Perpetual",
    category: "crypto",
    basePrice: 6.2,
    change24hPct: 0.85,
    volume24hUsd: 72000000,
    probabilisticProfile: {
      probabilities: { bullish: 44, bearish: 32, sideways: 24 },
      confidence: 3,
      riskScore: 52,
      conclusion: "Bullish 44% / Bearish 32% / Sideways 24% — Confidence ★★★☆☆ (3/5). Parachain renewal cycles providing steady accumulation floor.",
    },
  },
  NEARUSD: {
    symbol: "NEARUSD",
    name: "NEAR Protocol Perpetual",
    category: "crypto",
    basePrice: 5.15,
    change24hPct: 6.20,
    volume24hUsd: 210000000,
    probabilisticProfile: {
      probabilities: { bullish: 60, bearish: 20, sideways: 20 },
      confidence: 4,
      riskScore: 54,
      conclusion: "Bullish 60% / Bearish 20% / Sideways 20% — Confidence ★★★★☆ (4/5). Strong AI ecosystem narrative driving capital inflow.",
    },
  },
  SUIUSD: {
    symbol: "SUIUSD",
    name: "Sui Network Perpetual",
    category: "crypto",
    basePrice: 1.85,
    change24hPct: 7.40,
    volume24hUsd: 380000000,
    probabilisticProfile: {
      probabilities: { bullish: 62, bearish: 18, sideways: 20 },
      confidence: 4,
      riskScore: 56,
      conclusion: "Bullish 62% / Bearish 18% / Sideways 20% — Confidence ★★★★☆ (4/5). TVL expansion and DEX volume surge supporting bullish trend.",
    },
  },
  PEPEUSD: {
    symbol: "PEPEUSD",
    name: "Pepe Perpetual",
    category: "crypto",
    basePrice: 0.0000095,
    change24hPct: 8.90,
    volume24hUsd: 450000000,
    probabilisticProfile: {
      probabilities: { bullish: 52, bearish: 30, sideways: 18 },
      confidence: 3,
      riskScore: 78,
      conclusion: "Bullish 52% / Bearish 30% / Sideways 18% — Confidence ★★★☆☆ (3/5). High volatility meme token with speculative volume expansion.",
    },
  },
  XAUUSD: {
    symbol: "XAUUSD",
    name: "Gold Spot / USD",
    category: "commodity",
    basePrice: 2420.5,
    change24hPct: 0.65,
    volume24hUsd: 890000000,
    probabilisticProfile: {
      probabilities: { bullish: 55, bearish: 20, sideways: 25 },
      confidence: 5,
      riskScore: 28,
      conclusion: "Bullish 55% / Bearish 20% / Sideways 25% — Confidence ★★★★★ (5/5). Central bank buying and macroeconomic rate-cut expectations.",
    },
  },
  DXY: {
    symbol: "DXY",
    name: "US Dollar Index",
    category: "fx",
    basePrice: 104.2,
    change24hPct: -0.35,
    volume24hUsd: 1500000000,
    probabilisticProfile: {
      probabilities: { bullish: 25, bearish: 55, sideways: 20 },
      confidence: 4,
      riskScore: 32,
      conclusion: "Bullish 25% / Bearish 55% / Sideways 20% — Confidence ★★★★☆ (4/5). Soft inflation data pushing dollar index below key trendline support.",
    },
  },
};

export function getMarketDefinition(symbol: string): MarketDefinition {
  const upper = symbol.toUpperCase();
  if (MARKET_REGISTRY[upper]) {
    return MARKET_REGISTRY[upper];
  }

  const baseName = upper.replace("USD", "").replace("_USDT", "");
  return {
    symbol: upper,
    name: `${baseName} Market`,
    category: "crypto",
    basePrice: 10.0,
    change24hPct: 1.0,
    volume24hUsd: 50000000,
    probabilisticProfile: {
      probabilities: { bullish: 50, bearish: 25, sideways: 25 },
      confidence: 3,
      riskScore: 50,
      conclusion: `Bullish 50% / Bearish 25% / Sideways 25% — Confidence ★★★☆☆ (3/5). Analysis profile generated for ${upper}.`,
    },
  };
}
