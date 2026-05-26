"use server";

import { deleteLocalKpiConfigurationData, saveLocalKpiConfigurationData } from "@/lib/services/local-kpi.service";
import { deleteLocalKpiHistoryData, saveLocalKpiHistoryPointData } from "@/lib/services/local-kpi-history.service";
import { deleteLocalKpiResultData, saveLocalKpiResultData } from "@/lib/services/local-kpi-results.service";
import type { LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";

export async function persistLocalKpiSnapshotAction(input: {
  organizationId: string;
  kpi: LocalKpiConfiguration;
  result?: LocalKpiResult;
  historyPoint?: LocalKpiHistoryPoint;
}) {
  const kpiResult = await saveLocalKpiConfigurationData(input.kpi);
  const [resultResult, historyResult] = await Promise.all([
    input.result ? saveLocalKpiResultData(input.result, input.organizationId) : Promise.resolve(null),
    input.historyPoint ? saveLocalKpiHistoryPointData(input.historyPoint, input.organizationId) : Promise.resolve(null)
  ]);

  return {
    success: true,
    source: kpiResult.source,
    resultSource: resultResult?.source,
    historySource: historyResult?.source
  };
}

export async function deleteLocalKpiSnapshotAction(input: { kpiId: string; resultId?: string }) {
  await Promise.all([
    deleteLocalKpiConfigurationData(input.kpiId),
    input.resultId ? deleteLocalKpiResultData(input.resultId) : Promise.resolve(),
    deleteLocalKpiHistoryData(input.kpiId)
  ]);

  return {
    success: true
  };
}
