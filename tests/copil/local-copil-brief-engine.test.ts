import { describe, expect, it } from "vitest";
import {
  generateCopilArbitrationPoints,
  generateLocalCopilBrief,
  generateLocalCopilBriefMarkdown
} from "@/lib/copil/local-copil-brief-engine";
import { buildLocalActionPlanFromRecommendation } from "@/lib/action-plans/local-action-plan-builder";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { generateLocalRecommendations } from "@/lib/recommendations/local-recommendations-engine";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import { buildAlertRule, buildKpiResult } from "../fixtures/local-engine-fixtures";

const organizationId = "org-atlas-demo";

function journalEntry(): DecisionJournalEntry {
  return {
    id: "journal-1",
    createdAt: "2026-06-01T10:00:00.000Z",
    type: "action_plan_created",
    title: "Plan d'action créé : réduire la sous-traitance",
    description: "Plan local créé depuis une recommandation Atlas.",
    sourceType: "action_plan",
    sourceId: "plan-1",
    priority: "critical",
    status: "todo",
    relatedKpiIds: ["kpi-1"],
    relatedRecommendationIds: ["recommendation-1"],
    relatedActionPlanIds: ["plan-1"],
    relatedMemoryReferences: [],
    metadata: {}
  };
}

function groupByInsight(overrides: Partial<DatasetGroupByInsight> = {}): DatasetGroupByInsight {
  return {
    id: "groupby-insight-1",
    datasetId: "dataset-1",
    groupByAnalysisId: "analysis-1",
    title: "Concentration couts region Est",
    summary: "La region Est concentre 62 % des couts.",
    insightType: "concentration",
    severity: "critical",
    groupValue: "Region Est",
    value: 62,
    reasons: ["Concentration superieure a 50 %."],
    recommendedAction: "Analyser les causes de concentration",
    createdAt: "2026-06-01T10:00:00.000Z",
    persisted: false,
    ...overrides
  };
}

describe("local copil brief engine", () => {
  it("genere un brief avec KPI critique et alerte", () => {
    const result = buildKpiResult({ status: "critical" });
    const rule = buildAlertRule();
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const recommendations = generateLocalRecommendations({ kpiResults: [result], alerts, alertRules: [rule] });
    const brief = generateLocalCopilBrief({
      organizationId,
      periodLabel: "Mai 2026",
      kpiResults: [result],
      alerts,
      recommendations
    });

    expect(brief.keyKpis[0]).toContain("critique");
    expect(brief.criticalAlerts.length).toBeGreaterThan(0);
    expect(brief.keyRecommendations.length).toBeGreaterThan(0);
  });

  it("genere un brief lisible sans donnee", () => {
    const brief = generateLocalCopilBrief({
      organizationId,
      periodLabel: "Mai 2026"
    });

    expect(brief.globalSituation).toContain("Aucune donnée locale suffisante");
    expect(brief.keyKpis).toHaveLength(0);
    expect(brief.persisted).toBe(false);
  });

  it("produit des points d'arbitrage", () => {
    const result = buildKpiResult({ status: "critical" });
    const alerts = generateLocalKpiAlerts([result]);
    const recommendations = generateLocalRecommendations({ kpiResults: [result], alerts });
    const points = generateCopilArbitrationPoints({
      alerts,
      recommendations
    });

    expect(points.length).toBeGreaterThan(0);
    expect(points.some((point) => point.includes("Décider") || point.includes("Arbitrer"))).toBe(true);
  });

  it("inclut un point d'arbitrage comparatif Dataset", () => {
    const points = generateCopilArbitrationPoints({
      datasetGroupByInsights: [groupByInsight()]
    });
    const brief = generateLocalCopilBrief({
      organizationId,
      periodLabel: "Mai 2026",
      datasetGroupByInsights: [groupByInsight()]
    });

    expect(points.some((point) => point.includes("Region Est"))).toBe(true);
    expect(brief.comparativeInsights?.[0]).toContain("Region Est");
    expect(brief.risks.some((risk) => risk.includes("Region Est"))).toBe(true);
  });

  it("inclut les plans d'action actifs", () => {
    const result = buildKpiResult({ status: "critical" });
    const recommendations = generateLocalRecommendations({ kpiResults: [result] });
    const actionPlan = buildLocalActionPlanFromRecommendation(recommendations[0]);
    const brief = generateLocalCopilBrief({
      organizationId,
      periodLabel: "Mai 2026",
      kpiResults: [result],
      recommendations,
      actionPlans: [actionPlan]
    });

    expect(brief.activeActionPlans).toHaveLength(1);
    expect(brief.nextActions.length).toBeGreaterThan(0);
  });

  it("inclut le journal decisionnel", () => {
    const brief = generateLocalCopilBrief({
      organizationId,
      periodLabel: "Mai 2026",
      decisionJournalEntries: [journalEntry()]
    });

    expect(brief.recentDecisions).toHaveLength(1);
    expect(brief.recentDecisions[0]).toContain("Plan d'action créé");
  });

  it("genere un markdown de brief", () => {
    const brief = generateLocalCopilBrief({
      organizationId,
      periodLabel: "Mai 2026",
      decisionJournalEntries: [journalEntry()]
    });
    const markdown = generateLocalCopilBriefMarkdown(brief);

    expect(markdown).toContain("# Préparation COPIL");
    expect(markdown).toContain("## Points à arbitrer");
    expect(markdown).toContain("## Décisions récentes");
  });
});
