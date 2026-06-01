import { getLocalKpiWorkspaceData } from "@/lib/services/local-data/local-kpis-data.service";
import type { LocalExecutiveSummary } from "@/types/local-executive-summary";
import type { LocalInsight } from "@/types/local-insights";
import type { LocalDataResult } from "@/types/local-data-result";

export type LocalInsightsData = {
  insights: LocalInsight[];
  executiveSummary: LocalExecutiveSummary;
};

export function getLocalInsightsData(): LocalDataResult<LocalInsightsData> {
  const result = getLocalKpiWorkspaceData();

  return {
    data: {
      insights: result.data.insights,
      executiveSummary: result.data.executiveSummary
    },
    source: result.source,
    fallbackUsed: result.fallbackUsed,
    warnings: result.warnings,
    lastUpdated: result.lastUpdated
  };
}
