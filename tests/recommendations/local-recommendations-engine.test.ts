import { describe, expect, it } from "vitest";
import { generateLocalKpiInsights } from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import {
  generateCostRecommendations,
  generateDataQualityRecommendations,
  generateGroupByInsightRecommendations,
  generateLocalRecommendations,
  generateMarginRecommendations,
  generateQualityRecommendations,
  generateRiskRecommendations
} from "@/lib/recommendations/local-recommendations-engine";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import { buildAlertRule, buildHistoryPoint, buildKpiResult } from "../fixtures/local-engine-fixtures";

function groupByInsight(overrides: Partial<DatasetGroupByInsight> = {}): DatasetGroupByInsight {
  return {
    id: "groupby-insight-1",
    datasetId: "dataset-1",
    groupByAnalysisId: "analysis-1",
    title: "La region Est concentre les couts",
    summary: "La region Est concentre 62 % des couts observes.",
    insightType: "concentration",
    severity: "critical",
    groupValue: "Region Est",
    value: 62,
    comparisonValue: 100,
    gap: 24,
    reasons: ["Premier groupe au-dessus du seuil de concentration."],
    recommendedAction: "Analyser les causes de concentration",
    createdAt: "2026-06-01T10:00:00.000Z",
    persisted: false,
    ...overrides
  };
}

describe("local recommendations engine", () => {
  it("genere une recommandation cout pour un cout critique", () => {
    const result = buildKpiResult({ name: "Somme cout sous-traitance", status: "critical" });
    const recommendations = generateCostRecommendations({ kpiResults: [result] });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]).toMatchObject({ category: "cost", priority: "critical" });
  });

  it("genere une recommandation marge pour une marge a surveiller", () => {
    const result = buildKpiResult({
      kpiId: "kpi-margin",
      name: "Marge moyenne",
      displayFieldLabel: "Marge",
      status: "watch",
      direction: "higher_is_better",
      value: 28
    });
    const recommendations = generateMarginRecommendations({ kpiResults: [result] });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].category).toBe("margin");
  });

  it("genere une recommandation qualite quand la satisfaction baisse", () => {
    const result = buildKpiResult({
      kpiId: "kpi-satisfaction",
      name: "Satisfaction client",
      displayFieldLabel: "Satisfaction",
      status: "watch",
      direction: "higher_is_better",
      variation: -14
    });
    const recommendations = generateQualityRecommendations({ kpiResults: [result] });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].category).toBe("quality");
  });

  it("genere une recommandation depuis une regle personnalisee declenchee", () => {
    const result = buildKpiResult();
    const rule = buildAlertRule({ thresholdValue: 10000 });
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const recommendations = generateRiskRecommendations({ kpiResults: [result], alerts, alertRules: [rule] });

    expect(recommendations.some((recommendation) => recommendation.sourceType === "rule")).toBe(true);
  });

  it("genere une recommandation depuis une concentration comparative", () => {
    const recommendations = generateGroupByInsightRecommendations({
      kpiResults: [],
      datasetGroupByInsights: [groupByInsight()]
    });

    expect(recommendations[0]).toMatchObject({
      sourceType: "dataset_groupby_insight",
      title: "Analyser la concentration observee sur Region Est",
      relatedGroupByInsightIds: ["groupby-insight-1"]
    });
  });

  it("genere une recommandation depuis un groupe faible", () => {
    const recommendations = generateGroupByInsightRecommendations({
      kpiResults: [],
      datasetGroupByInsights: [groupByInsight({
        id: "groupby-insight-weak",
        insightType: "weak_group",
        severity: "watch",
        groupValue: "Agence Nord"
      })]
    });

    expect(recommendations[0].title).toBe("Examiner le groupe le moins performant");
    expect(recommendations[0].category).toBe("operations");
  });

  it("genere une recommandation depuis un groupe atypique", () => {
    const recommendations = generateGroupByInsightRecommendations({
      kpiResults: [],
      datasetGroupByInsights: [groupByInsight({
        id: "groupby-insight-anomaly",
        insightType: "anomaly_candidate",
        severity: "critical",
        groupValue: "Client X"
      })]
    });

    expect(recommendations[0].title).toBe("Auditer le groupe atypique");
    expect(recommendations[0].recommendedActions[0].label).toBe("Analyser les causes de concentration");
  });

  it("genere une recommandation fiabilite quand l'historique est insuffisant", () => {
    const result = buildKpiResult({ status: "healthy" });
    const insights = generateLocalKpiInsights([result], [buildHistoryPoint({ kpiId: result.kpiId })], [], []);
    const recommendations = generateDataQualityRecommendations({ kpiResults: [result], insights });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].category).toBe("data_quality");
  });

  it("priorise les recommandations critical et high", () => {
    const cost = buildKpiResult({ kpiId: "kpi-cost", name: "Cout sous-traitance", status: "critical" });
    const margin = buildKpiResult({
      kpiId: "kpi-margin",
      name: "Marge",
      displayFieldLabel: "Marge",
      status: "watch",
      direction: "higher_is_better"
    });
    const recommendations = generateLocalRecommendations({ kpiResults: [margin, cost] });

    expect(recommendations[0].priority).toBe("critical");
    expect(recommendations.some((recommendation) => recommendation.priority === "high")).toBe(true);
  });

  it("reste vide sans alerte ni KPI exploitable", () => {
    const result = buildKpiResult({
      kpiId: "kpi-ok",
      name: "CA mensuel",
      displayFieldLabel: "Chiffre d'affaires",
      status: "healthy",
      direction: "higher_is_better"
    });
    const recommendations = generateLocalRecommendations({ kpiResults: [result], insights: [] });

    expect(recommendations).toHaveLength(0);
  });
});
