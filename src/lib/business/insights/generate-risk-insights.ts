import type { Alert, PerformanceKPI } from "@/types/atlas";

export type RiskInsight = {
  id: string;
  label: string;
  risk: Alert["executiveRisk"];
  severity: Alert["severity"];
  explanation: string;
  evidence: string;
  nextDecision: string;
};

export function generateRiskInsights(kpis: PerformanceKPI[], alerts: Alert[]): RiskInsight[] {
  return alerts.map((alert) => {
    const kpi = kpis.find((item) => item.id === alert.kpiId);

    return {
      id: `risk-${alert.id}`,
      label: alert.title,
      risk: alert.executiveRisk,
      severity: alert.severity,
      explanation: alert.businessImpact,
      evidence: kpi
        ? `${kpi.name} : ${kpi.value}${kpi.unit === "EUR" ? " EUR" : kpi.unit === "%" ? "%" : ""}, objectif ${kpi.target}.`
        : alert.probableCause,
      nextDecision: alert.recommendedDecision
    };
  });
}
