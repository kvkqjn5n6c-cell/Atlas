import type { LocalKpiConfiguration, LocalKpiTestResult } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import { calculateLocalKpiTrend } from "@/lib/kpi-engine/local-kpi-trends";

export function buildLocalKpiResult(
  kpi: LocalKpiConfiguration,
  testResult: LocalKpiTestResult,
  previousResult?: LocalKpiResult
): LocalKpiResult {
  const trend = calculateLocalKpiTrend(testResult.value, previousResult?.value);

  return {
    id: `local-kpi-result-${kpi.id}`,
    kpiId: kpi.id,
    importId: kpi.importId,
    name: kpi.name,
    displayFieldLabel: kpi.displayFieldLabel,
    calculationType: kpi.calculationType,
    value: testResult.value,
    targetValue: kpi.targetValue,
    warningThreshold: kpi.warningThreshold,
    criticalThreshold: kpi.criticalThreshold,
    status: testResult.status,
    trend: trend.trend,
    variation: trend.variation,
    calculatedAt: new Date().toISOString(),
    sourceFileName: kpi.sourceFileName,
    persisted: false
  };
}

export function buildLocalKpiHistoryPoint(result: LocalKpiResult): LocalKpiHistoryPoint {
  return {
    id: `local-kpi-history-${result.kpiId}-${Date.now()}`,
    kpiId: result.kpiId,
    importId: result.importId,
    calculatedAt: result.calculatedAt,
    value: result.value,
    status: result.status,
    targetValue: result.targetValue,
    warningThreshold: result.warningThreshold,
    criticalThreshold: result.criticalThreshold,
    sourceFileName: result.sourceFileName,
    trend: result.trend,
    variation: result.variation,
    persisted: false
  };
}

export function calculateScoreWithLocalKpis(baseScore: number, results: LocalKpiResult[]) {
  const localAdjustment = results.reduce((total, result) => {
    if (result.status === "healthy") return total + 2;
    if (result.status === "watch") return total - 3;
    if (result.status === "critical") return total - 8;
    return total - 1;
  }, 0);

  return Math.max(0, Math.min(100, baseScore + localAdjustment));
}
