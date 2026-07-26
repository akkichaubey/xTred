import type { Metadata } from "next";
import MarketDetailClient from "./MarketDetailClient";

interface Props {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} — Market Analysis`,
  };
}

export default async function MarketPage({ params }: Props) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  return <MarketDetailClient symbol={upperSymbol} />;
}
