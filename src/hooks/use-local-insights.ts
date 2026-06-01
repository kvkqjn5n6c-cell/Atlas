"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getLocalInsightsData,
  type LocalInsightsData
} from "@/lib/services/local-data/local-insights-data.service";
import type { LocalDataResult } from "@/types/local-data-result";

export function useLocalInsights() {
  const [result, setResult] = useState<LocalDataResult<LocalInsightsData>>(() => getLocalInsightsData());

  const refresh = useCallback(() => {
    setResult(getLocalInsightsData());
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return {
    ...result,
    refresh
  };
}
