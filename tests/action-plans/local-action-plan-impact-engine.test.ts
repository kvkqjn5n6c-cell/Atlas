import { describe, expect, it } from "vitest";
import {
  interpretImpact,
  measureActionPlanImpact
} from "@/lib/action-plans/local-action-plan-impact-engine";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";

function buildPlan(overrides: Partial<LocalActionPlan> = {}): LocalActionPlan {
  return {
    id: "plan-1",
    organizationId: "org-atlas-demo",
    title: "Plan test",
    description: "Plan issu d'une recommandation Atlas.",
    relatedKpiIds: ["kpi-1"],
    relatedInsightIds: [],
    priority: "high",
    status: "in_progress",
    owner: "Direction",
    expectedImpact: "Améliorer le KPI lié.",
    actions: [],
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-06-10T10:00:00.000Z",
    persisted: false,
    ...overrides
  };
}

function point(value: number, calculatedAt: string, overrides: Partial<LocalKpiHistoryPoint> = {}): LocalKpiHistoryPoint {
  return {
    id: `history-${value}-${calculatedAt}`,
    kpiId: "kpi-1",
    calculatedAt,
    value,
    status: "watch",
    direction: "higher_is_better",
    persisted: false,
    ...overrides
  };
}

describe("local action plan impact engine", () => {
  it("retourne non mesurable si l'historique est insuffisant", () => {
    const impacts = measureActionPlanImpact(buildPlan(), [], []);

    expect(impacts[0]).toMatchObject({
      status: "not_measurable",
      trend: "unknown"
    });
  });

  it("mesure un impact positif pour un KPI higher_is_better qui augmente", () => {
    const impacts = measureActionPlanImpact(buildPlan(), [
      point(100, "2026-06-01T10:00:00.000Z"),
      point(130, "2026-06-20T10:00:00.000Z")
    ], []);

    expect(impacts[0].status).toBe("positive");
    expect(impacts[0].variation).toBeCloseTo(30);
  });

  it("mesure un impact negatif pour un KPI higher_is_better qui baisse", () => {
    const impacts = measureActionPlanImpact(buildPlan(), [
      point(100, "2026-06-01T10:00:00.000Z"),
      point(80, "2026-06-20T10:00:00.000Z")
    ], []);

    expect(impacts[0].status).toBe("negative");
  });

  it("mesure un impact positif pour un KPI lower_is_better qui baisse", () => {
    const impacts = measureActionPlanImpact(buildPlan(), [
      point(12000, "2026-06-01T10:00:00.000Z", { direction: "lower_is_better" }),
      point(9000, "2026-06-20T10:00:00.000Z", { direction: "lower_is_better" })
    ], []);

    expect(impacts[0].status).toBe("positive");
  });

  it("mesure un impact negatif pour un KPI lower_is_better qui augmente", () => {
    const impacts = measureActionPlanImpact(buildPlan(), [
      point(12000, "2026-06-01T10:00:00.000Z", { direction: "lower_is_better" }),
      point(15000, "2026-06-20T10:00:00.000Z", { direction: "lower_is_better" })
    ], []);

    expect(impacts[0].status).toBe("negative");
  });

  it("retourne en attente si aucun point apres creation du plan n'existe", () => {
    const impacts = measureActionPlanImpact(buildPlan(), [
      point(100, "2026-06-01T10:00:00.000Z")
    ], []);

    expect(impacts[0].status).toBe("pending");
  });

  it("interprete une variation faible comme neutre", () => {
    const interpretation = interpretImpact({
      beforeValue: 100,
      afterValue: 100.4,
      direction: "higher_is_better"
    });

    expect(interpretation.status).toBe("neutral");
  });
});
