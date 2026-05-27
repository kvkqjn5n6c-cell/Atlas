import { buildAlertFromRule, evaluateLocalAlertRules } from "@/lib/kpi-engine/local-alert-rules-engine";
import { formatKpiDirection, inferKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { KpiDirection } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";

export type LocalKpiAlert = {
  id: string;
  kpiId: string;
  ruleId?: string;
  ruleName?: string;
  title: string;
  severity: "warning" | "critical";
  value: number;
  observedValue?: number;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  direction: KpiDirection;
  condition?: string;
  cause: string;
  businessImpact: string;
  recommendedAction: string;
  sourceFileName: string;
  calculatedAt: string;
  alertSource: "status" | "rule";
  persisted: false;
};

function buildCause(result: LocalKpiResult, direction: KpiDirection) {
  const isCritical = result.status === "critical";
  const threshold = isCritical ? result.criticalThreshold : result.warningThreshold;
  const directionLabel = formatKpiDirection(direction);

  if (threshold !== undefined) {
    const verb = direction === "lower_is_better" ? "dépasse" : "passe sous";
    return `${result.name} ${verb} le seuil ${isCritical ? "critique" : "de surveillance"} : ${result.value} pour un seuil de ${threshold}. Le KPI est configuré en "${directionLabel}".`;
  }

  return `${result.name} affiche ${result.value}. Le KPI est configuré en "${directionLabel}".`;
}

function generateStatusAlerts(results: LocalKpiResult[]): LocalKpiAlert[] {
  return results
    .filter((result) => result.status === "watch" || result.status === "critical")
    .map((result) => {
      const isCritical = result.status === "critical";
      const direction = inferKpiDirection(result);

      return {
        id: `local-alert-${result.kpiId}`,
        kpiId: result.kpiId,
        title: isCritical ? `${result.name} en zone critique` : `${result.name} à surveiller`,
        severity: isCritical ? "critical" : "warning",
        value: result.value,
        targetValue: result.targetValue,
        warningThreshold: result.warningThreshold,
        criticalThreshold: result.criticalThreshold,
        direction,
        cause: buildCause(result, direction),
        businessImpact: "Ce KPI personnalisé influence la lecture dirigeant et peut déclencher un plan d'action métier.",
        recommendedAction: "Vérifier le mapping, confirmer le seuil métier puis prioriser une action corrective si l'écart est confirmé.",
        sourceFileName: result.sourceFileName,
        calculatedAt: result.calculatedAt,
        alertSource: "status",
        persisted: false
      };
    });
}

function generateRuleAlerts(
  results: LocalKpiResult[],
  history: LocalKpiHistoryPoint[],
  rules: LocalAlertRule[]
): LocalKpiAlert[] {
  return results.flatMap((result) => {
    const direction = inferKpiDirection(result);
    const historyForKpi = history.filter((point) => point.kpiId === result.kpiId);

    return evaluateLocalAlertRules(result, historyForKpi, rules).map((evaluation) =>
      buildAlertFromRule(result, evaluation, direction)
    );
  });
}

export function generateLocalKpiAlerts(
  results: LocalKpiResult[],
  history: LocalKpiHistoryPoint[] = [],
  rules: LocalAlertRule[] = []
): LocalKpiAlert[] {
  return [...generateStatusAlerts(results), ...generateRuleAlerts(results, history, rules)];
}
