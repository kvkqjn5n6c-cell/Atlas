import type { Alert, PerformanceKPI } from "@/types/atlas";

export function calculatePerformanceScore(kpis: PerformanceKPI[], alerts: Alert[]) {
  const baseScore = 100;
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
      return penalty + 5;
    }

    return penalty;
  }, 0);

  return Math.max(0, Math.min(100, baseScore - kpiPenalty - alertPenalty));
}

export function formatKpiValue(kpi: PerformanceKPI) {
  if (kpi.unit === "EUR") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(kpi.value);
  }

  if (kpi.unit === "%") {
    return `${kpi.value}%`;
  }

  return String(kpi.value);
}

export function splitKpisByPriority(kpis: PerformanceKPI[]) {
  return {
    critical: kpis.filter((kpi) => kpi.status === "critical"),
    watch: kpis.filter((kpi) => kpi.status === "watch"),
    healthy: kpis.filter((kpi) => kpi.status === "healthy")
  };
}
