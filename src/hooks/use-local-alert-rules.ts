"use client";

import { useCallback, useEffect, useState } from "react";
import { getLocalAlertRules } from "@/lib/local/local-alert-rules-store";
import type { LocalAlertRule } from "@/types/local-alert-rules";

export function useLocalAlertRules() {
  const [rules, setRules] = useState<LocalAlertRule[]>([]);

  const refresh = useCallback(() => {
    setRules(getLocalAlertRules());
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return {
    rules,
    refresh
  };
}
