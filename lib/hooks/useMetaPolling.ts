"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const FETCH_INTERVAL = 4000; // 4 seconds

export default function useMetaPolling() {
  const queryClient = useQueryClient();
  const lastTsRef = useRef<string | null>(null);

  const { data } = useQuery({
    queryKey: ["meta-check"],
    queryFn: async () => {
      const res = await fetch("/api/meta");
      if (!res.ok) throw new Error("Failed to fetch meta");
      return res.json() as Promise<{ last_change_ts: string }>;
    },
    refetchInterval: FETCH_INTERVAL,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (data?.last_change_ts) {
      if (lastTsRef.current && lastTsRef.current !== data.last_change_ts) {
        console.log("⚡ Cloud change detected, refreshing data...");
        // Invalidate all main data queries
        queryClient.invalidateQueries({ queryKey: ["properties"] });
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["reports"] });
      }
      lastTsRef.current = data.last_change_ts;
    }
  }, [data, queryClient]);
}