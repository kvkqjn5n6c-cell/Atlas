import { getLocalKpiWorkspaceData } from "@/lib/services/local-data/local-kpis-data.service";
import type { LocalInsight } from "@/types/local-insights";
import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { LocalDataResult } from "@/types/local-data-result";

export type LocalAlertsData = {
  alerts: LocalKpiAlert[];
  insights: LocalInsight[];
};

export function getLocalAlertsData(): LocalDataResult<LocalAlertsData> {
  const result = getLocalKpiWorkspaceData();

  return {
    data: {
      alerts: result.data.alerts,
      insights: result.data.insights
    },
    source: result.source,
    fallbackUsed: result.fallbackUsed,
    warnings: result.warnings,
    lastUpdated: result.lastUpdated
  };
}
