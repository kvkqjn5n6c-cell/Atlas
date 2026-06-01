import { describe, expect, it } from "vitest";
import { evaluateLocalAlertRules } from "@/lib/kpi-engine/local-alert-rules-engine";
import { buildAlertRule, buildHistoryPoint, buildKpiResult, comparisonRule } from "../fixtures/local-engine-fixtures";

describe("evaluateLocalAlertRules", () => {
  it("declenche une regle superieure a", () => {
    const evaluations = evaluateLocalAlertRules(buildKpiResult({ value: 120 }), [], [
      comparisonRule("greater_than", { thresholdValue: 100 })
    ]);

    expect(evaluations).toHaveLength(1);
  });

  it("declenche une regle inferieure a", () => {
    const evaluations = evaluateLocalAlertRules(buildKpiResult({ value: 80 }), [], [
      comparisonRule("less_than", { thresholdValue: 100 })
    ]);

    expect(evaluations).toHaveLength(1);
  });

  it("declenche une regle de variation positive", () => {
    const evaluations = evaluateLocalAlertRules(buildKpiResult({ variation: 16 }), [], [
      comparisonRule("variation_up_greater_than", { ruleType: "variation", variationPercent: 10 })
    ]);

    expect(evaluations).toHaveLength(1);
  });

  it("declenche une regle de variation negative", () => {
    const evaluations = evaluateLocalAlertRules(buildKpiResult({ variation: -12 }), [], [
      comparisonRule("variation_down_greater_than", { ruleType: "variation", variationPercent: 10 })
    ]);

    expect(evaluations).toHaveLength(1);
  });

  it("declenche une regle de persistance sur N periodes", () => {
    const history = [
      buildHistoryPoint({ id: "h-1", status: "watch", calculatedAt: "2026-06-03T00:00:00.000Z" }),
      buildHistoryPoint({ id: "h-2", status: "critical", calculatedAt: "2026-06-02T00:00:00.000Z" }),
      buildHistoryPoint({ id: "h-3", status: "watch", calculatedAt: "2026-06-01T00:00:00.000Z" })
    ];
    const evaluations = evaluateLocalAlertRules(buildKpiResult({ status: "watch" }), history, [
      buildAlertRule({
        ruleType: "persistence",
        comparisonOperator: "consecutive_periods",
        consecutivePeriods: 3
      })
    ]);

    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].observedValue).toBe(3);
  });

  it("ignore une regle desactivee", () => {
    const evaluations = evaluateLocalAlertRules(buildKpiResult({ value: 120 }), [], [
      comparisonRule("greater_than", { thresholdValue: 100, isActive: false })
    ]);

    expect(evaluations).toHaveLength(0);
  });
});
