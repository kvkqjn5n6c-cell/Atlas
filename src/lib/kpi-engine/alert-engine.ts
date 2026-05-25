import type { Alert, PerformanceKPI } from "@/types/atlas";

export function detectAlertsFromKpis(kpis: PerformanceKPI[], organizationId: string): Alert[] {
  return kpis
    .filter((kpi) => kpi.status !== "healthy")
    .map((kpi) => ({
      id: `engine-alert-${kpi.id}`,
      organizationId,
      title: `${kpi.name} hors cible`,
      severity: kpi.status === "critical" ? "critical" : "warning",
      source: "kpi-engine",
      kpiId: kpi.id,
      sourceId: kpi.sourceId,
      message: `${kpi.name} présente un écart de ${kpi.deviation}% par rapport à l'objectif.`,
      recommendedDecision:
        kpi.status === "critical"
          ? "Traiter dans le plan d'action court terme."
          : "Surveiller au prochain point performance.",
      probableCause:
        kpi.dataQuality === "reliable"
          ? "Dérive détectée sur un KPI fiable."
          : "Dérive potentiellement amplifiée par une qualité de donnée incomplète.",
      businessImpact:
        kpi.status === "critical"
          ? "Risque direct sur la décision dirigeant si aucune action n'est priorisée."
          : "Risque de dégradation progressive à confirmer sur la prochaine période.",
      urgency: kpi.status === "critical" ? "immediate" : "this-week",
      executiveRisk:
        kpi.category === "cash"
          ? "cash"
          : kpi.category === "margin"
            ? "margin"
            : kpi.dataQuality === "partial" || kpi.dataQuality === "outdated" || kpi.dataQuality === "error"
              ? "data-quality"
              : "operations",
      linkedKpiIds: [kpi.id]
    }));
}

export function prioritizeAlerts(alerts: Alert[]) {
  const severityRank = {
    critical: 0,
    warning: 1,
    info: 2
  };

  return [...alerts].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

// TODO Phase 3: relier les alertes aux sources et mouvements responsables de la dérive.
