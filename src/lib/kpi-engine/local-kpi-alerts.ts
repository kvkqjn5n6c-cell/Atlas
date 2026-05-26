import type { LocalKpiResult } from "@/types/local-kpi-results";

export type LocalKpiAlert = {
  id: string;
  kpiId: string;
  title: string;
  severity: "warning" | "critical";
  cause: string;
  businessImpact: string;
  recommendedAction: string;
  sourceFileName: string;
  calculatedAt: string;
  persisted: false;
};

export function generateLocalKpiAlerts(results: LocalKpiResult[]): LocalKpiAlert[] {
  return results
    .filter((result) => result.status === "watch" || result.status === "critical")
    .map((result) => {
      const isCritical = result.status === "critical";
      const threshold = isCritical ? result.criticalThreshold : result.warningThreshold;

      return {
        id: `local-alert-${result.kpiId}`,
        kpiId: result.kpiId,
        title: isCritical ? `${result.name} en zone critique` : `${result.name} à surveiller`,
        severity: isCritical ? "critical" : "warning",
        cause: threshold !== undefined
          ? `Résultat local ${result.value} comparé au seuil ${threshold}.`
          : `Résultat local ${result.value} sous surveillance.`,
        businessImpact: "Ce KPI personnalisé peut modifier la lecture dirigeant si la tendance se confirme sur un import complet.",
        recommendedAction: "Vérifier le mapping, confirmer le seuil métier puis intégrer ce KPI au prochain rapport.",
        sourceFileName: result.sourceFileName,
        calculatedAt: result.calculatedAt,
        persisted: false
      };
    });
}
