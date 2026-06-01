"use client";

import { useLocalInsights } from "@/hooks/use-local-insights";

export function useLocalExecutiveSummary() {
  const result = useLocalInsights();

  return {
    ...result,
    data: result.data.executiveSummary
  };
}
