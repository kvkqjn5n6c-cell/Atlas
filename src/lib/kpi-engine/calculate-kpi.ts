import type { NormalizedRecord, PerformanceKPI } from "@/types/atlas";

export function calculateKpisFromRecords(
  records: NormalizedRecord[],
  organizationId: string
): PerformanceKPI[] {
  const revenue = records.reduce((total, record) => {
    const value = record.fields.ChiffreAffaires;
    return total + (typeof value === "number" ? value : 0);
  }, 0);

  const marginValues = records
    .map((record) => record.fields.Marge)
    .filter((value): value is number => typeof value === "number");
  const averageMargin =
    marginValues.length > 0
      ? Math.round(marginValues.reduce((total, value) => total + value, 0) / marginValues.length)
      : 0;
  const averageQuality =
    records.length > 0
      ? Math.round(records.reduce((total, record) => total + record.qualityScore, 0) / records.length)
      : 0;

  return [
    {
      id: "engine-kpi-revenue",
      organizationId,
      name: "CA normalisé",
      category: "revenue",
      value: revenue,
      unit: "EUR",
      target: 50000,
      deviation: Math.round(((revenue - 50000) / 50000) * 100),
      trend: revenue >= 50000 ? "up" : "down",
      status: revenue >= 50000 ? "healthy" : "watch",
      dataQuality: "partial",
      lastUpdated: "preview",
      sourceId: records[0]?.dataSourceId ?? "unknown",
      insight: "KPI calculé depuis les données normalisées de preview."
    },
    {
      id: "engine-kpi-margin",
      organizationId,
      name: "Marge moyenne",
      category: "margin",
      value: averageMargin,
      unit: "%",
      target: 32,
      deviation: averageMargin - 32,
      trend: averageMargin >= 32 ? "up" : "down",
      status: averageMargin >= 28 ? "healthy" : "critical",
      dataQuality: "partial",
      lastUpdated: "preview",
      sourceId: records[0]?.dataSourceId ?? "unknown",
      insight: "Marge issue du mapping des colonnes source vers Atlas."
    },
    {
      id: "engine-kpi-data-quality",
      organizationId,
      name: "Qualité données",
      category: "quality",
      value: averageQuality,
      unit: "SCORE",
      target: 90,
      deviation: averageQuality - 90,
      trend: averageQuality >= 90 ? "up" : "stable",
      status: averageQuality >= 80 ? "healthy" : "watch",
      dataQuality: "reliable",
      lastUpdated: "preview",
      sourceId: records[0]?.dataSourceId ?? "unknown",
      insight: "Score technique préparatoire pour fiabiliser les KPI."
    }
  ];
}

// TODO Phase 3: sortir les formules KPI dans un registry configurable par secteur et organisation.
