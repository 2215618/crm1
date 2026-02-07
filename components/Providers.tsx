"use client";

import React, { useState, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useMetaPolling from "../lib/hooks/useMetaPolling";

export default function Providers({ children }: PropsWithChildren) {
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

function PollingWrapper({ children }: PropsWithChildren) {
  // Initialize the global polling mechanism
  useMetaPolling();
  return <>{children}</>;
}