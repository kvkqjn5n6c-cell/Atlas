"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getLocalAlertsData,
  type LocalAlertsData
} from "@/lib/services/local-data/local-alerts-data.service";
import type { LocalDataResult } from "@/types/local-data-result";

export function useLocalKpiAlerts() {
  const [result, setResult] = useState<LocalDataResult<LocalAlertsData>>(() => getLocalAlertsData());

  const refresh = useCallback(() => {
    setResult(getLocalAlertsData());
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
