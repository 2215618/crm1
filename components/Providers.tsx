"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import useMetaPolling from "../lib/hooks/useMetaPolling";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000, 
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <PollingWrapper>
        {children}
      </PollingWrapper>
    </QueryClientProvider>
  );
}

function PollingWrapper({ children }: { children: React.ReactNode }) {
  // Initialize the global polling mechanism
  useMetaPolling();
  return <>{children}</>;
}