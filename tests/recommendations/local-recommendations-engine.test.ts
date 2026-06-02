import { describe, expect, it } from "vitest";
import { generateLocalKpiInsights } from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import {
  generateCostRecommendations,
  generateDataQualityRecommendations,
  generateLocalRecommendations,
  generateMarginRecommendations,
  generateQualityRecommendations,
  generateRiskRecommendations
} from "@/lib/recommendations/local-recommendations-engine";
import { buildAlertRule, buildHistoryPoint, buildKpiResult } from "../fixtures/local-engine-fixtures";

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
