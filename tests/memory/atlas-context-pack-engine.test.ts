import { describe, expect, it } from "vitest";
import {
  buildAtlasContextPack,
  buildExecutiveSummaryContext,
  buildKpiAnalysisContext,
  buildRiskReviewContext
} from "@/lib/memory/atlas-context-pack-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { buildLocalActionPlanFromRecommendation } from "@/lib/action-plans/local-action-plan-builder";
import { extractAtlasKnowledgeItems } from "@/lib/memory/atlas-memory-engine";
import { calculateRecommendationsConfidence } from "@/lib/recommendations/recommendation-confidence-engine";
import { generateLocalRecommendations } from "@/lib/recommendations/local-recommendations-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import { buildAlertRule, buildKpiResult } from "../fixtures/local-engine-fixtures";

const organizationId = "org-atlas-demo";
const documents = getAtlasMemoryMockByOrganization(organizationId);
const detectedKnowledge = extractAtlasKnowledgeItems(documents, organizationId);
const approvedKnowledge = detectedKnowledge.map((item) => ({
  ...item,
  status: "approved" as const,
  approvedAt: "2026-06-01T10:00:00.000Z"
}));

function dataset(): AtlasDataset {
  return {
    id: "dataset-1",
    sourceId: "prepared-source-1",
    displayName: "Interventions maintenance",
    rowCount: 100,
    fields: [{ key: "cost", label: "Coût", sourceColumn: "cost", sourceType: "number", atlasType: "number" }],
    records: [],
    qualityScore: 82,
    warnings: [],
    createdAt: "2026-06-01T10:00:00.000Z"
  };
}

function groupByAnalysis(): DatasetGroupByAnalysis {
  return {
    id: "analysis-1",
    datasetId: "dataset-1",
    aggregation: "sum",
    field: "cost",
    groupedBy: {
      id: "group-region",
      datasetId: "dataset-1",
      field: "region",
      label: "Région",
      createdAt: "2026-06-01T10:00:00.000Z"
    },
    results: [{ groupValue: "Region Est", rowCount: 62, value: 62000, percentage: 62 }],
    generatedAt: "2026-06-01T10:00:00.000Z",
    warnings: [],
    persisted: false
  };
}

function groupByInsight(): DatasetGroupByInsight {
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
    persisted: false
  };
}

describe("atlas context pack engine", () => {
  it("cree un pack analyse KPI avec documents, connaissances et KPI", () => {
    const result = buildKpiResult();
    const pack = buildKpiAnalysisContext({
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result]
    });

    expect(pack.purpose).toBe("kpi_analysis");
    expect(pack.includedDocuments.length).toBeGreaterThan(0);
    expect(pack.includedKnowledge.length).toBeGreaterThan(0);
    expect(pack.includedKpis).toHaveLength(1);
    expect(pack.persisted).toBe(false);
  });

  it("cree un pack synthese dirigeant", () => {
    const pack = buildExecutiveSummaryContext({
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge
    });

    expect(pack.title).toBe("Synthèse dirigeant");
    expect(pack.includedDocuments.some((source) => source.sourceDocument === "strategie.md")).toBe(true);
  });

  it("cree un pack revue des risques avec alertes critiques", () => {
    const result = buildKpiResult({ status: "critical" });
    const rule = buildAlertRule();
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const pack = buildRiskReviewContext({
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result],
      alerts,
      alertRules: [rule]
    });

    expect(pack.includedAlerts.length).toBeGreaterThan(0);
    expect(pack.includedRules.length).toBeGreaterThan(0);
  });

  it("inclut les recommandations dans les packs appropries", () => {
    const result = buildKpiResult({ status: "critical" });
    const rule = buildAlertRule();
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const recommendations = generateLocalRecommendations({ kpiResults: [result], alerts, alertRules: [rule] });
    const pack = buildAtlasContextPack("operational_recommendations", {
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result],
      alerts,
      alertRules: [rule],
      recommendations
    });

    expect(pack.includedRecommendations.length).toBeGreaterThan(0);
    expect(pack.summary).toContain("recommandation");
  });

  it("inclut les plans d'action locaux dans les packs operationnels", () => {
    const result = buildKpiResult({ status: "critical" });
    const rule = buildAlertRule();
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const recommendations = generateLocalRecommendations({ kpiResults: [result], alerts, alertRules: [rule] });
    const actionPlans = [buildLocalActionPlanFromRecommendation(recommendations[0])];
    const pack = buildAtlasContextPack("operational_recommendations", {
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result],
      alerts,
      alertRules: [rule],
      recommendations,
      actionPlans
    });

    expect(pack.includedActionPlans).toHaveLength(1);
    expect(pack.summary).toContain("plan");
  });

  it("inclut les impacts mesures dans les packs operationnels", () => {
    const result = buildKpiResult({ status: "critical" });
    const rule = buildAlertRule();
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const recommendations = generateLocalRecommendations({ kpiResults: [result], alerts, alertRules: [rule] });
    const actionPlan = buildLocalActionPlanFromRecommendation(recommendations[0]);
    const pack = buildAtlasContextPack("operational_recommendations", {
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result],
      alerts,
      alertRules: [rule],
      recommendations,
      actionPlans: [actionPlan],
      actionPlanImpacts: [{
        id: `impact-${actionPlan.id}-kpi-1`,
        actionPlanId: actionPlan.id,
        relatedKpiId: "kpi-1",
        measuredAt: "2026-06-01T10:00:00.000Z",
        beforeValue: 12800,
        afterValue: 9000,
        variation: -29.7,
        trend: "down",
        status: "positive",
        interpretation: "Impact positif : le KPI évolue dans le sens attendu.",
        evidence: [],
        persisted: false
      }]
    });

    expect(pack.includedActionPlanImpacts).toHaveLength(1);
    expect(pack.summary).toContain("impact");
  });

  it("inclut les feedbacks utilisateur dans les packs operationnels", () => {
    const result = buildKpiResult({ status: "critical" });
    const recommendations = generateLocalRecommendations({ kpiResults: [result] });
    const pack = buildAtlasContextPack("operational_recommendations", {
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result],
      recommendations,
      recommendationFeedback: [{
        id: "feedback-recommendation",
        recommendationId: recommendations[0].id,
        createdAt: "2026-06-01T10:00:00.000Z",
        updatedAt: "2026-06-01T10:00:00.000Z",
        relevance: "relevant",
        actionTaken: "yes",
        impactObserved: "positive",
        persisted: false
      }]
    });

    expect(pack.includedRecommendationFeedback).toHaveLength(1);
    expect(pack.summary).toContain("feedback");
  });

  it("inclut les scores de confiance dans les packs operationnels", () => {
    const result = buildKpiResult({ status: "critical" });
    const recommendations = generateLocalRecommendations({ kpiResults: [result] });
    const recommendationConfidence = calculateRecommendationsConfidence({
      recommendations,
      kpiResults: [result]
    });
    const pack = buildAtlasContextPack("operational_recommendations", {
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result],
      recommendations,
      recommendationConfidence
    });

    expect(pack.includedRecommendationConfidence).toHaveLength(recommendationConfidence.length);
    expect(pack.summary).toContain("confiance");
  });

  it("inclut l'historique decisionnel dans les packs cible", () => {
    const pack = buildAtlasContextPack("copil_preparation", {
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      decisionJournalEntries: [{
        id: "journal-action-plan-created",
        createdAt: "2026-06-01T10:00:00.000Z",
        type: "action_plan_created",
        title: "Plan d'action créé",
        description: "Plan local créé depuis une recommandation Atlas.",
        sourceType: "action_plan",
        sourceId: "plan-1",
        priority: "high",
        status: "todo",
        relatedKpiIds: ["kpi-1"],
        relatedRecommendationIds: ["recommendation-1"],
        relatedActionPlanIds: ["plan-1"],
        relatedMemoryReferences: [],
        metadata: {},
      }]
    });

    expect(pack.includedDecisionHistory).toHaveLength(1);
    expect(pack.summary).toContain("decisionnel");
  });

  it("expose les signaux Dataset dans les packs executive et COPIL", () => {
    const executivePack = buildAtlasContextPack("executive_summary", {
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      datasets: [dataset()],
      datasetGroupByAnalyses: [groupByAnalysis()],
      datasetGroupByInsights: [groupByInsight()]
    });
    const copilPack = buildAtlasContextPack("copil_preparation", {
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      datasets: [dataset()],
      datasetGroupByAnalyses: [groupByAnalysis()],
      datasetGroupByInsights: [groupByInsight()]
    });

    expect(executivePack.includedDatasetSignals.map((source) => source.type)).toEqual(
      expect.arrayContaining(["dataset", "dataset_groupby_analysis", "dataset_groupby_insight"])
    );
    expect(copilPack.includedDatasetSignals.some((source) => source.id === "groupby-insight-1")).toBe(true);
  });

  it("ignore les connaissances detectees et rejetees", () => {
    const governedKnowledge = [
      { ...detectedKnowledge[0], status: "approved" as const, approvedAt: "2026-06-01T10:00:00.000Z" },
      { ...detectedKnowledge[1], status: "detected" as const },
      { ...detectedKnowledge[2], status: "rejected" as const, rejectedAt: "2026-06-01T10:00:00.000Z" }
    ];
    const pack = buildAtlasContextPack("executive_summary", {
      organizationId,
      documents,
      knowledgeItems: governedKnowledge
    });

    expect(pack.includedKnowledge).toHaveLength(1);
    expect(pack.includedKnowledge[0].status).toBe("approved");
    expect(pack.limitations.some((limitation) => limitation.includes("détectée"))).toBe(true);
    expect(pack.limitations.some((limitation) => limitation.includes("rejetée"))).toBe(true);
  });

  it("signale les limites quand les donnees sont insuffisantes", () => {
    const pack = buildAtlasContextPack("commercial_review", {
      organizationId,
      documents: [],
      knowledgeItems: [],
      kpiResults: [],
      alerts: [],
      alertRules: []
    });

    expect(pack.limitations.length).toBeGreaterThan(0);
    expect(pack.limitations).toEqual(expect.arrayContaining(["Aucune connaissance validée disponible dans Atlas Memory."]));
  });
});
