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
    basePrice: 64700,
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
    name: "XRP Perpetual",
    category: "crypto",
    basePrice: 0.584,
    change24hPct: -0.85,
    volume24hUsd: 210000000,
    probabilisticProfile: {
      probabilities: { bullish: 38, bearish: 42, sideways: 20 },
      confidence: 2,
      riskScore: 62,
      conclusion: "Bearish 42% / Bullish 38% / Sideways 20% — Confidence ★★☆☆☆ (2/5). Regulatory headlines introducing localized volatility.",
    },
  },
  BNBUSD: {
    symbol: "BNBUSD",
    name: "BNB Perpetual",
    category: "crypto",
    basePrice: 578.2,
    change24hPct: 1.15,
    volume24hUsd: 190000000,
    probabilisticProfile: {
      probabilities: { bullish: 50, bearish: 30, sideways: 20 },
      confidence: 3,
      riskScore: 45,
      conclusion: "Bullish 50% / Bearish 30% / Sideways 20% — Confidence ★★★☆☆ (3/5). Steady ecosystem launchpool demand anchoring base price.",
    },
  },
  AVAXUSD: {
    symbol: "AVAXUSD",
    name: "Avalanche Perpetual",
    category: "crypto",
    basePrice: 27.4,
    change24hPct: 3.25,
    volume24hUsd: 140000000,
    probabilisticProfile: {
      probabilities: { bullish: 51, bearish: 28, sideways: 21 },
      confidence: 3,
      riskScore: 50,
      conclusion: "Bullish 51% / Bearish 28% / Sideways 21% — Confidence ★★★☆☆ (3/5). Subnet expansions providing steady structural demand.",
    },
  },
  DOGEUSD: {
    symbol: "DOGEUSD",
    name: "Dogecoin Perpetual",
    category: "crypto",
    basePrice: 0.124,
    change24hPct: 5.60,
    volume24hUsd: 310000000,
    probabilisticProfile: {
      probabilities: { bullish: 54, bearish: 26, sideways: 20 },
      confidence: 3,
      riskScore: 68,
      conclusion: "Bullish 54% / Bearish 26% / Sideways 20% — Confidence ★★★☆☆ (3/5). Social volume momentum elevating speculative interest.",
    },
  },
  LINKUSD: {
    symbol: "LINKUSD",
    name: "Chainlink Perpetual",
    category: "crypto",
    basePrice: 14.2,
    change24hPct: 2.45,
    volume24hUsd: 115000000,
    probabilisticProfile: {
      probabilities: { bullish: 55, bearish: 25, sideways: 20 },
      confidence: 4,
      riskScore: 44,
      conclusion: "Bullish 55% / Bearish 25% / Sideways 20% — Confidence ★★★★☆ (4/5). CCIP adoption growth expanding fundamental utility.",
    },
  },
  ADAUSD: {
    symbol: "ADAUSD",
    name: "Cardano Perpetual",
    category: "crypto",
    basePrice: 0.412,
    change24hPct: 0.95,
    volume24hUsd: 95000000,
    probabilisticProfile: {
      probabilities: { bullish: 44, bearish: 36, sideways: 20 },
      confidence: 3,
      riskScore: 52,
      conclusion: "Bullish 44% / Bearish 36% / Sideways 20% — Confidence ★★★☆☆ (3/5). Consolidating within key support band.",
    },
  },
  DOTUSD: {
    symbol: "DOTUSD",
    name: "Polkadot Perpetual",
    category: "crypto",
    basePrice: 6.35,
    change24hPct: 1.40,
    volume24hUsd: 85000000,
    probabilisticProfile: {
      probabilities: { bullish: 47, bearish: 33, sideways: 20 },
      confidence: 3,
      riskScore: 54,
      conclusion: "Bullish 47% / Bearish 33% / Sideways 20% — Confidence ★★★☆☆ (3/5). Parachain renewal activity supporting gradual recovery.",
    },
  },
  NEARUSD: {
    symbol: "NEARUSD",
    name: "Near Protocol Perpetual",
    category: "crypto",
    basePrice: 5.15,
    change24hPct: 3.80,
    volume24hUsd: 130000000,
    probabilisticProfile: {
      probabilities: { bullish: 53, bearish: 27, sideways: 20 },
      confidence: 4,
      riskScore: 49,
      conclusion: "Bullish 53% / Bearish 27% / Sideways 20% — Confidence ★★★★☆ (4/5). User growth metrics outperforming layer-1 peers.",
    },
  },
  SUIUSD: {
    symbol: "SUIUSD",
    name: "Sui Perpetual",
    category: "crypto",
    basePrice: 1.72,
    change24hPct: 6.20,
    volume24hUsd: 280000000,
    probabilisticProfile: {
      probabilities: { bullish: 60, bearish: 22, sideways: 18 },
      confidence: 4,
      riskScore: 58,
      conclusion: "Bullish 60% / Bearish 22% / Sideways 18% — Confidence ★★★★☆ (4/5). Strong TVL growth propelling price momentum.",
    },
  },
  PEPEUSD: {
    symbol: "PEPEUSD",
    name: "Pepe Perpetual",
    category: "crypto",
    basePrice: 0.0000098,
    change24hPct: 4.50,
    volume24hUsd: 350000000,
    probabilisticProfile: {
      probabilities: { bullish: 51, bearish: 31, sideways: 18 },
      confidence: 3,
      riskScore: 72,
      conclusion: "Bullish 51% / Bearish 31% / Sideways 18% — Confidence ★★★☆☆ (3/5). High liquidity memecoin trading channel.",
    },
  },
  XAUUSD: {
    symbol: "XAUUSD",
    name: "Gold Perpetual",
    category: "commodity",
    basePrice: 2420.5,
    change24hPct: 0.45,
    volume24hUsd: 450000000,
    probabilisticProfile: {
      probabilities: { bullish: 55, bearish: 25, sideways: 20 },
      confidence: 4,
      riskScore: 35,
      conclusion: "Bullish 55% / Bearish 25% / Sideways 20% — Confidence ★★★★☆ (4/5). Central bank buying and macroeconomic hedging supporting gold bid.",
    },
  },
  DXY: {
    symbol: "DXY",
    name: "US Dollar Index",
    category: "fx",
    basePrice: 104.25,
    change24hPct: -0.12,
    volume24hUsd: 950000000,
    probabilisticProfile: {
      probabilities: { bullish: 35, bearish: 45, sideways: 20 },
      confidence: 4,
      riskScore: 38,
      conclusion: "Bearish 45% / Bullish 35% / Sideways 20% — Confidence ★★★★☆ (4/5). Rate cut expectations putting downward pressure on greenback.",
    },
  },
};

export function getMarketDefinition(symbol: string): MarketDefinition {
  const clean = symbol.toUpperCase().trim();
  if (MARKET_REGISTRY[clean]) return MARKET_REGISTRY[clean];

  const baseName = clean.replace("USD", "").replace("_USDT", "").replace("USDT", "");
  return {
    symbol: clean,
    name: `${baseName} Asset`,
    category: "crypto",
    basePrice: 100,
    change24hPct: 0,
    volume24hUsd: 50000000,
    probabilisticProfile: {
      probabilities: { bullish: 50, bearish: 30, sideways: 20 },
      confidence: 3,
      riskScore: 50,
      conclusion: `Bullish 50% / Bearish 30% / Sideways 20% — Confidence ★★★☆☆ (3/5). Standard analysis for ${clean}.`,
    },
  };
}
