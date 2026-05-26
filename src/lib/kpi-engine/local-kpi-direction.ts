import type { KpiDirection, LocalKpiDraft } from "@/types/local-kpi";

const lowerIsBetterKeywords = [
  "cout",
  "coût",
  "retard",
  "delai",
  "délai",
  "echec",
  "échec",
  "incident",
  "reclamation",
  "réclamation",
  "erreur",
  "panne",
  "litige"
];

const higherIsBetterKeywords = [
  "ca",
  "chiffre",
  "marge",
  "satisfaction",
  "dossiers traités",
  "dossiers traites",
  "ventes",
  "revenu"
];

export function inferKpiDirection(input: {
  name?: string;
  sourceColumn?: string;
  customFieldLabel?: string;
  displayFieldLabel?: string;
  category?: string;
  direction?: KpiDirection;
}): KpiDirection {
  if (input.direction) return input.direction;

  const label = [
    input.name,
    input.sourceColumn,
    input.customFieldLabel,
    input.displayFieldLabel,
    input.category
  ].filter(Boolean).join(" ").toLowerCase();

  if (lowerIsBetterKeywords.some((keyword) => label.includes(keyword))) return "lower_is_better";
  if (higherIsBetterKeywords.some((keyword) => label.includes(keyword))) return "higher_is_better";

  return "higher_is_better";
}

export function formatKpiDirection(direction?: KpiDirection) {
  return inferKpiDirection({ direction }) === "lower_is_better" ? "Plus bas = meilleur" : "Plus haut = meilleur";
}

export function getLocalKpiStatus(
  value: number,
  thresholds: {
    direction?: KpiDirection;
    targetValue?: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    name?: string;
    sourceColumn?: string;
    displayFieldLabel?: string;
  }
) {
  const direction = inferKpiDirection(thresholds);
  const target = thresholds.targetValue ?? 0;
  const warning = thresholds.warningThreshold ?? target;
  const critical = thresholds.criticalThreshold ?? warning;

  if (direction === "lower_is_better") {
    if (value >= critical) return "critical" as const;
    if (value >= warning) return "watch" as const;
    return "healthy" as const;
  }

  if (value <= critical) return "critical" as const;
  if (value < target) return "watch" as const;
  return "healthy" as const;
}

export function validateThresholdOrder(
  direction: KpiDirection,
  targetValue: number,
  warningThreshold: number,
  criticalThreshold: number
) {
  if (targetValue === 0 && warningThreshold === 0 && criticalThreshold === 0) return true;

  if (direction === "lower_is_better") {
    return targetValue < warningThreshold && warningThreshold < criticalThreshold;
  }

  return criticalThreshold < warningThreshold && warningThreshold < targetValue;
}
