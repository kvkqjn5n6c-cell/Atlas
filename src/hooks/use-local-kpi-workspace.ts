"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getEmptyLocalKpiWorkspaceResult,
  getLocalKpiWorkspaceData,
  type LocalKpiWorkspaceData
} from "@/lib/services/local-data/local-kpis-data.service";
import type { LocalDataResult } from "@/types/local-data-result";

export function useLocalKpiWorkspace() {
  const [result, setResult] = useState<LocalDataResult<LocalKpiWorkspaceData>>(() =>
    getEmptyLocalKpiWorkspaceResult()
  );

  const refresh = useCallback(() => {
    setResult(getLocalKpiWorkspaceData());
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
