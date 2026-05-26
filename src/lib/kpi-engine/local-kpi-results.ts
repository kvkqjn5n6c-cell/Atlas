import type { LocalKpiConfiguration, LocalKpiTestResult } from "@/types/local-kpi";
import type { LocalKpiResult } from "@/types/local-kpi-results";

export function buildLocalKpiResult(
  kpi: LocalKpiConfiguration,
  testResult: LocalKpiTestResult,
  previousResult?: LocalKpiResult
): LocalKpiResult {
  const trend =
    previousResult && testResult.value > previousResult.value
      ? "up"
      : previousResult && testResult.value < previousResult.value
        ? "down"
        : "stable";

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
    trend,
    calculatedAt: new Date().toISOString(),
    sourceFileName: kpi.sourceFileName,
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
