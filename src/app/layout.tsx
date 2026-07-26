import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "xTred — AI Trading Intelligence",
    template: "%s | xTred",
  },
  description:
    "Personal AI-powered trading intelligence platform. Market analysis, probability-based outlook, and risk management — powered by Gemini AI and Delta Exchange data.",
  keywords: ["trading", "AI", "market analysis", "Delta Exchange", "cryptocurrency"],
  authors: [{ name: "xTred" }],
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    title: "xTred — AI Trading Intelligence",
    description: "Personal AI-powered trading intelligence terminal.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#080b12" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
