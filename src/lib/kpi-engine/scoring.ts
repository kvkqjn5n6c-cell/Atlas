import type { Alert, PerformanceKPI } from "@/types/atlas";

export function calculateAtlasPerformanceScore(kpis: PerformanceKPI[], alerts: Alert[]) {
  const kpiPenalty = kpis.reduce((penalty, kpi) => {
    if (kpi.status === "critical") {
      return penalty + 18;
    }

    if (kpi.status === "watch") {
      return penalty + 8;
    }

    return penalty;
  }, 0);

  const alertPenalty = alerts.reduce((penalty, alert) => {
    if (alert.severity === "critical") {
      return penalty + 12;
    }

    if (alert.severity === "warning") {
      return penalty + 6;
    }

    return penalty + 2;
  }, 0);

  return Math.max(0, Math.min(100, 100 - kpiPenalty - alertPenalty));
}

export function getScoreLabel(score: number) {
  if (score >= 85) {
    return "performance forte";
  }

  if (score >= 70) {
    return "performance stable";
  }

  if (score >= 50) {
    return "a surveiller";
  }

  return "risque eleve";
}

// TODO Phase 3: ponderer le score par criticite metier, secteur et fraicheur des donnees.
