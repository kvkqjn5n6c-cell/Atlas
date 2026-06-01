import { describe, expect, it } from "vitest";
import { generateLocalExecutiveSummary } from "@/lib/insights/local-executive-summary-engine";
import { generateLocalKpiInsights } from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { buildAlertRule, buildHistoryPoint, buildKpiResult } from "../fixtures/local-engine-fixtures";

describe("generateLocalExecutiveSummary", () => {
  it("resume les risques quand des alertes sont presentes", () => {
    const result = buildKpiResult({ status: "critical" });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateLocalKpiInsights([result], [], alerts, []);
    const summary = generateLocalExecutiveSummary({ kpiResults: [result], histories: [], alerts, alertRules: [], insights });

    expect(summary.mainRisks.length).toBeGreaterThan(0);
    expect(summary.globalSituation).toContain("critique");
  });

  it("produit des actions recommandees", () => {
    const result = buildKpiResult({ status: "watch" });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateLocalKpiInsights([result], [], alerts, []);
    const summary = generateLocalExecutiveSummary({ kpiResults: [result], histories: [], alerts, alertRules: [], insights });

    expect(summary.recommendedActions.length).toBeGreaterThan(0);
  });

  it("signale une fiabilite limitee quand l'historique est insuffisant", () => {
    const result = buildKpiResult({ status: "healthy" });
    const insights = generateLocalKpiInsights([result], [], [], []);
    const summary = generateLocalExecutiveSummary({ kpiResults: [result], histories: [], alerts: [], alertRules: [], insights });

    expect(summary.dataReliabilityNotes.some((note) => note.includes("historique"))).toBe(true);
  });

  it("reste exploitable sans alerte", () => {
    const result = buildKpiResult({ status: "healthy", value: 700, targetValue: 500, direction: "higher_is_better" });
    const summary = generateLocalExecutiveSummary({ kpiResults: [result], histories: [], alerts: [], alertRules: [], insights: [] });

    expect(summary.mainRisks[0]).toContain("Aucun risque");
    expect(summary.relatedAlertIds).toHaveLength(0);
  });

  it("consolide plusieurs alertes et regles", () => {
    const cost = buildKpiResult({ kpiId: "kpi-cost", id: "result-cost", status: "critical" });
    const margin = buildKpiResult({
      kpiId: "kpi-margin",
      id: "result-margin",
      name: "Marge moyenne",
      displayFieldLabel: "Marge",
      direction: "higher_is_better",
      value: 28,
      targetValue: 30,
      warningThreshold: 27,
      criticalThreshold: 25,
      status: "watch",
      variation: -8
    });
    const rule = buildAlertRule({ kpiId: cost.kpiId, thresholdValue: 10000 });
    const history = [buildHistoryPoint({ kpiId: cost.kpiId }), buildHistoryPoint({ kpiId: margin.kpiId, status: "watch" })];
    const alerts = generateLocalKpiAlerts([cost, margin], history, [rule]);
    const insights = generateLocalKpiInsights([cost, margin], history, alerts, [rule]);
    const summary = generateLocalExecutiveSummary({
      kpiResults: [cost, margin],
      histories: history,
      alerts,
      alertRules: [rule],
      insights
    });

    expect(summary.relatedKpiIds).toEqual(expect.arrayContaining(["kpi-cost", "kpi-margin"]));
    expect(summary.relatedAlertIds.length).toBeGreaterThanOrEqual(2);
  });
});
