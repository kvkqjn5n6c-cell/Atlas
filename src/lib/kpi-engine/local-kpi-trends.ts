import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";

export function calculateLocalKpiTrend(currentValue: number, previousValue?: number) {
  if (previousValue === undefined || previousValue === 0) {
    return {
      trend: "stable" as const,
      variation: 0
    };
  }

  const variation = Math.round(((currentValue - previousValue) / Math.abs(previousValue)) * 1000) / 10;

  return {
    trend: variation > 1 ? "up" as const : variation < -1 ? "down" as const : "stable" as const,
    variation
  };
}

export function latestVariationForKpi(history: LocalKpiHistoryPoint[]) {
  const [latest] = history;
  return latest?.variation ?? 0;
}

export function formatVariation(variation?: number) {
  if (!variation) return "stable";
  return `${variation > 0 ? "+" : ""}${variation}%`;
}
