import type { Metadata } from "next";
import MarketsOverviewClient from "./MarketsOverviewClient";

export const metadata: Metadata = {
  title: "Markets Overview — xTred",
};

export default function MarketsPage() {
  return <MarketsOverviewClient />;
}
