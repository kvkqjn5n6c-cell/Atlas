import type { LocalActionPlan } from "@/types/local-action-plans";
import type { ImpactStatus, LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { KpiDirection } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";

type ComparableKpiPoint = {
  kpiId: string;
  calculatedAt: string;
  value: number;
  direction?: KpiDirection;
  source: string;
};

function now() {
  return new Date().toISOString();
}

function toComparablePoints(history: LocalKpiHistoryPoint[], results: LocalKpiResult[]) {
  return [
    ...history.map((point) => ({
      kpiId: point.kpiId,
      calculatedAt: point.calculatedAt,
      value: point.value,
      direction: point.direction,
      source: "Historique KPI"
    })),
    ...results.map((result) => ({
      kpiId: result.kpiId,
      calculatedAt: result.calculatedAt,
      value: result.value,
      direction: result.direction,
      source: "Résultat KPI courant"
    }))
  ].sort((a, b) => a.calculatedAt.localeCompare(b.calculatedAt));
}

function variationPercent(beforeValue: number, afterValue: number) {
  if (beforeValue === 0) return undefined;
  return ((afterValue - beforeValue) / Math.abs(beforeValue)) * 100;
}

function trendFromValues(beforeValue?: number, afterValue?: number): LocalActionPlanImpact["trend"] {
  if (beforeValue === undefined || afterValue === undefined) return "unknown";
  if (afterValue > beforeValue) return "up";
  if (afterValue < beforeValue) return "down";
  return "stable";
}

export function interpretImpact(input: {
  beforeValue?: number;
  afterValue?: number;
  direction?: KpiDirection;
}) {
  const { beforeValue, afterValue, direction = "higher_is_better" } = input;

  if (beforeValue === undefined && afterValue === undefined) {
    return {
      status: "not_measurable" as ImpactStatus,
      interpretation: "Impact non mesurable : aucun point KPI exploitable n'est disponible."
    };
  }

  if (beforeValue === undefined) {
    return {
      status: "not_measurable" as ImpactStatus,
      interpretation: "Impact non mesurable : aucun point de référence avant le plan n'est disponible."
    };
  }

  if (afterValue === undefined) {
    return {
      status: "pending" as ImpactStatus,
      interpretation: "Mesure en attente : aucun nouveau point KPI n'est disponible après la création du plan."
    };
  }

  const variation = variationPercent(beforeValue, afterValue);
  if (variation !== undefined && Math.abs(variation) < 1) {
    return {
      status: "neutral" as ImpactStatus,
      interpretation: "Impact neutre : la variation observée reste trop faible pour conclure."
    };
  }

  const improved = direction === "lower_is_better" ? afterValue < beforeValue : afterValue > beforeValue;
  return improved
    ? {
        status: "positive" as ImpactStatus,
        interpretation: "Impact positif : le KPI évolue dans le sens attendu après le plan d'action."
      }
    : {
        status: "negative" as ImpactStatus,
        interpretation: "Impact négatif : le KPI évolue dans le mauvais sens après le plan d'action."
      };
}

function buildImpact(plan: LocalActionPlan, kpiId: string, points: ComparableKpiPoint[]): LocalActionPlanImpact {
  const measuredAt = now();
  const beforePoint = [...points].filter((point) => point.calculatedAt <= plan.createdAt).pop();
  const afterPoint = [...points].filter((point) => point.calculatedAt > plan.createdAt).pop();
  const direction = afterPoint?.direction ?? beforePoint?.direction ?? "higher_is_better";
  const interpreted = interpretImpact({
    beforeValue: beforePoint?.value,
    afterValue: afterPoint?.value,
    direction
  });

  return {
    id: `impact-${plan.id}-${kpiId}`,
    actionPlanId: plan.id,
    relatedKpiId: kpiId,
    measuredAt,
    beforeValue: beforePoint?.value,
    afterValue: afterPoint?.value,
    variation: beforePoint && afterPoint ? variationPercent(beforePoint.value, afterPoint.value) : undefined,
    trend: trendFromValues(beforePoint?.value, afterPoint?.value),
    status: interpreted.status,
    interpretation: interpreted.interpretation,
    evidence: [
      ...(beforePoint ? [{ label: "Valeur avant", value: beforePoint.value, source: beforePoint.source }] : []),
      ...(afterPoint ? [{ label: "Valeur après", value: afterPoint.value, source: afterPoint.source }] : []),
      { label: "Sens KPI", value: direction === "lower_is_better" ? "Plus bas = meilleur" : "Plus haut = meilleur", source: "Configuration KPI locale" }
    ],
    persisted: false
  };
}

export function measureActionPlanImpact(
  actionPlan: LocalActionPlan,
  kpiHistory: LocalKpiHistoryPoint[],
  kpiResults: LocalKpiResult[]
) {
  const allPoints = toComparablePoints(kpiHistory, kpiResults);

  return actionPlan.relatedKpiIds.map((kpiId) => {
    const points = allPoints.filter((point) => point.kpiId === kpiId);
    return buildImpact(actionPlan, kpiId, points);
  });
}

export function measureAllLocalActionPlanImpacts(
  actionPlans: LocalActionPlan[],
  kpiHistory: LocalKpiHistoryPoint[],
  kpiResults: LocalKpiResult[]
) {
  return actionPlans.flatMap((plan) => measureActionPlanImpact(plan, kpiHistory, kpiResults));
}
