import type { Alert, PerformanceKPI, Report } from "@/types/atlas";

export type ExecutiveSummary = {
  situation: string;
  mainRisks: string[];
  stableZones: string[];
  immediatePriorities: string[];
  dataReliabilityScore: number;
};

export function calculateDataReliabilityScore(kpis: PerformanceKPI[]) {
  const weights = {
    reliable: 100,
    partial: 68,
    outdated: 48,
    error: 20
  };

  if (kpis.length === 0) return 0;
  return Math.round(kpis.reduce((total, kpi) => total + weights[kpi.dataQuality], 0) / kpis.length);
}

export function generateExecutiveSummary(
  kpis: PerformanceKPI[],
  alerts: Alert[],
  reports: Report[] = []
): ExecutiveSummary {
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical");
  const watchKpis = kpis.filter((kpi) => kpi.status === "watch");
  const healthyKpis = kpis.filter((kpi) => kpi.status === "healthy");
  const dataReliabilityScore = calculateDataReliabilityScore(kpis);
  const latestReport = reports[0];

  return {
    situation:
      latestReport?.executiveSummary ??
      "Activité stable et carnet d'interventions solide, avec une tension court terme sur cash, marge et qualité de donnée.",
    mainRisks: [
      ...criticalAlerts.map((alert) => alert.businessImpact),
      ...watchKpis.slice(0, 2).map((kpi) => `${kpi.name} reste sous objectif : ${kpi.insight}`)
    ].slice(0, 4),
    stableZones: healthyKpis.map((kpi) => `${kpi.name} reste maîtrisé (${kpi.insight})`).slice(0, 3),
    immediatePriorities: alerts
      .filter((alert) => alert.urgency !== "monitoring")
      .map((alert) => alert.recommendedDecision)
      .slice(0, 3),
    dataReliabilityScore
  };
}
