import { formatVariation } from "@/lib/kpi-engine/local-kpi-trends";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { KpiDirection } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";

export type EvaluatedLocalAlertRule = {
  rule: LocalAlertRule;
  triggered: boolean;
  condition: string;
  observedValue: number;
  reason: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value);
}

function targetGapPercent(result: LocalKpiResult) {
  if (!result.targetValue) return 0;
  return ((result.value - result.targetValue) / Math.abs(result.targetValue)) * 100;
}

function latestConsecutiveAlertPeriods(history: LocalKpiHistoryPoint[]) {
  let count = 0;

  for (const point of history) {
    if (point.status === "watch" || point.status === "critical") count += 1;
    else break;
  }

  return count;
}

function evaluateRule(result: LocalKpiResult, history: LocalKpiHistoryPoint[], rule: LocalAlertRule): EvaluatedLocalAlertRule {
  const threshold = rule.thresholdValue ?? 0;
  const variation = result.variation ?? history[0]?.variation ?? 0;
  const gap = targetGapPercent(result);
  const consecutivePeriods = latestConsecutiveAlertPeriods(history);

  switch (rule.comparisonOperator) {
    case "greater_than":
      return {
        rule,
        triggered: result.value > threshold,
        condition: `valeur supérieure à ${formatNumber(threshold)}`,
        observedValue: result.value,
        reason: `${result.name} vaut ${formatNumber(result.value)}.`
      };
    case "less_than":
      return {
        rule,
        triggered: result.value < threshold,
        condition: `valeur inférieure à ${formatNumber(threshold)}`,
        observedValue: result.value,
        reason: `${result.name} vaut ${formatNumber(result.value)}.`
      };
    case "target_gap_greater_than":
      return {
        rule,
        triggered: gap > threshold,
        condition: `écart objectif supérieur à ${formatNumber(threshold)} %`,
        observedValue: gap,
        reason: `L'écart à l'objectif est de ${formatNumber(gap)} %.`
      };
    case "target_gap_less_than":
      return {
        rule,
        triggered: gap < -Math.abs(threshold),
        condition: `écart objectif inférieur à -${formatNumber(Math.abs(threshold))} %`,
        observedValue: gap,
        reason: `L'écart à l'objectif est de ${formatNumber(gap)} %.`
      };
    case "variation_up_greater_than":
      return {
        rule,
        triggered: variation > (rule.variationPercent ?? threshold),
        condition: `hausse supérieure à ${formatNumber(rule.variationPercent ?? threshold)} %`,
        observedValue: variation,
        reason: `La variation observée est ${formatVariation(variation)}.`
      };
    case "variation_down_greater_than":
      return {
        rule,
        triggered: variation < -Math.abs(rule.variationPercent ?? threshold),
        condition: `baisse supérieure à ${formatNumber(Math.abs(rule.variationPercent ?? threshold))} %`,
        observedValue: variation,
        reason: `La variation observée est ${formatVariation(variation)}.`
      };
    case "consecutive_periods":
      return {
        rule,
        triggered: consecutivePeriods >= (rule.consecutivePeriods ?? 2),
        condition: `alerte pendant ${rule.consecutivePeriods ?? 2} périodes consécutives`,
        observedValue: consecutivePeriods,
        reason: `${consecutivePeriods} période(s) consécutive(s) en alerte.`
      };
    default:
      return {
        rule,
        triggered: false,
        condition: rule.condition,
        observedValue: result.value,
        reason: "Règle non évaluée."
      };
  }
}

export function evaluateLocalAlertRules(
  kpiResult: LocalKpiResult,
  history: LocalKpiHistoryPoint[],
  rules: LocalAlertRule[]
) {
  return rules
    .filter((rule) => rule.isActive && rule.kpiId === kpiResult.kpiId)
    .map((rule) => evaluateRule(kpiResult, history, rule))
    .filter((evaluation) => evaluation.triggered);
}

export function buildAlertFromRule(
  result: LocalKpiResult,
  evaluation: EvaluatedLocalAlertRule,
  direction: KpiDirection
) {
  return {
    id: `local-rule-alert-${evaluation.rule.id}-${result.kpiId}`,
    kpiId: result.kpiId,
    ruleId: evaluation.rule.id,
    ruleName: evaluation.rule.name,
    title: evaluation.rule.message || `${result.name} - ${evaluation.rule.name}`,
    severity: evaluation.rule.severity,
    value: result.value,
    observedValue: evaluation.observedValue,
    targetValue: result.targetValue,
    warningThreshold: result.warningThreshold,
    criticalThreshold: result.criticalThreshold,
    direction,
    condition: evaluation.condition,
    cause: `${evaluation.rule.name} déclenchée : ${evaluation.condition}. ${evaluation.reason}`,
    businessImpact: "Cette alerte provient d'une règle métier personnalisée configurée sur un KPI local.",
    recommendedAction: evaluation.rule.recommendedAction || "Qualifier l'écart, confirmer le seuil métier puis décider d'une action corrective.",
    sourceFileName: result.sourceFileName,
    calculatedAt: result.calculatedAt,
    alertSource: "rule" as const,
    persisted: false as const
  };
}
