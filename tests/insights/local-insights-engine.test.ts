import { describe, expect, it } from "vitest";
import {
  generateAlertRuleInsights,
  generateLocalKpiInsights,
  generateRiskInsights,
  generateTrendInsights,
  rankLocalInsights
} from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { buildAlertRule, buildHistoryPoint, buildKpiResult } from "../fixtures/local-engine-fixtures";

describe("local insights engine", () => {
  it("cree un insight critique pour un KPI critique", () => {
    const result = buildKpiResult({ status: "critical" });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateRiskInsights([result], [], alerts);

    expect(insights.some((insight) => insight.severity === "critical" && insight.relatedKpiIds.includes(result.kpiId))).toBe(true);
  });

  it("cree un insight de surveillance pour un KPI watch", () => {
    const result = buildKpiResult({ status: "watch" });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateRiskInsights([result], [], alerts);

    expect(insights.some((insight) => insight.severity === "watch")).toBe(true);
  });

  it("cree un insight pour une regle personnalisee declenchee", () => {
    const result = buildKpiResult({ value: 12800 });
    const rule = buildAlertRule({ thresholdValue: 10000 });
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const insights = generateAlertRuleInsights([result], [], alerts, [rule]);

    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({ insightType: "alert_rule", severity: "critical" });
  });

  it("signale un historique insuffisant", () => {
    const result = buildKpiResult({ status: "healthy" });
    const insights = generateTrendInsights([result], [buildHistoryPoint({ kpiId: result.kpiId })]);

    expect(insights).toHaveLength(1);
    expect(insights[0].insightType).toBe("data_quality");
  });

  it("priorise les insights critiques et les regles personnalisees", () => {
    const result = buildKpiResult({ status: "critical", variation: 18 });
    const rule = buildAlertRule({ thresholdValue: 10000 });
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const insights = generateLocalKpiInsights([result], [], alerts, [rule]);
    const ranked = rankLocalInsights(insights);

    expect(ranked[0].severity).toBe("critical");
    expect(["alert_rule", "risk"]).toContain(ranked[0].insightType);
  });
});
