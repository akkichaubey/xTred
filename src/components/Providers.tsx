"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * Client-side Providers wrapper.
 * Provides TanStack Query context to all dashboard components.
 * Zustand stores are self-initializing (no provider needed).
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 1000,          // 10s — market data refreshes frequently
            gcTime: 5 * 60 * 1000,          // 5min garbage collection
            retry: 2,
            refetchOnWindowFocus: false,    // we have WebSocket; polling is redundant
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
