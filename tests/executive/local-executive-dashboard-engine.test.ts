import { describe, expect, it } from "vitest";
import {
  calculateExecutiveGlobalScore,
  determineExecutiveGlobalStatus,
  generateExecutiveNextBestActions,
  generateLocalExecutiveDashboard
} from "@/lib/executive/local-executive-dashboard-engine";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { LocalPriorityItem } from "@/types/local-priorities";
import type { LocalRecommendation } from "@/types/local-recommendations";
import type { RecommendationConfidence } from "@/types/recommendation-confidence";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import { buildKpiResult } from "../fixtures/local-engine-fixtures";

const organizationId = "org-atlas-demo";
const now = "2026-06-01T10:00:00.000Z";

function buildPriority(overrides: Partial<LocalPriorityItem> = {}): LocalPriorityItem {
  return {
    id: "priority-critical",
    organizationId,
    title: "Coût sous-traitance critique",
    summary: "Le coût sous-traitance dépasse le seuil critique.",
    rank: 1,
    priorityScore: 92,
    urgency: "critical",
    impact: "high",
    confidenceScore: 86,
    category: "cost",
    sourceTypes: ["alert", "recommendation"],
    relatedKpiIds: ["kpi-1"],
    relatedAlertIds: ["alert-1"],
    relatedRecommendationIds: ["recommendation-1"],
    relatedActionPlanIds: [],
    relatedMemoryReferences: ["knowledge-1"],
    recommendedNextAction: "Renégocier les missions sous-traitées les plus coûteuses.",
    reasons: ["Alerte critique détectée."],
    warnings: [],
    createdAt: now,
    persisted: false,
    ...overrides
  };
}

function buildAlert(overrides: Partial<LocalKpiAlert> = {}): LocalKpiAlert {
  return {
    id: "alert-1",
    kpiId: "kpi-1",
    title: "Coût sous-traitance en zone critique",
    severity: "critical",
    value: 12800,
    targetValue: 8000,
    warningThreshold: 10000,
    criticalThreshold: 12000,
    direction: "lower_is_better",
    cause: "Le KPI dépasse le seuil critique.",
    businessImpact: "La marge opérationnelle est sous pression.",
    recommendedAction: "Analyser les fournisseurs et contrats concernés.",
    sourceFileName: "performance-test.csv",
    calculatedAt: now,
    alertSource: "status",
    persisted: false,
    ...overrides
  };
}

function buildRecommendation(overrides: Partial<LocalRecommendation> = {}): LocalRecommendation {
  return {
    id: "recommendation-1",
    organizationId,
    title: "Analyser les postes de coût prioritaires",
    summary: "Le coût critique nécessite une revue ciblée.",
    priority: "critical",
    category: "cost",
    sourceType: "alert",
    relatedKpiIds: ["kpi-1"],
    relatedAlertIds: ["alert-1"],
    relatedInsightIds: [],
    relatedMemoryReferences: ["knowledge-1"],
    evidence: [{ type: "alert", label: "Alerte critique", value: 12800 }],
    recommendedActions: [{ label: "Isoler les postes de sous-traitance", description: "Identifier les contrats les plus coûteux." }],
    expectedImpact: "Réduire la pression sur la marge.",
    effort: "medium",
    urgency: "immediate",
    createdAt: now,
    persisted: false,
    ...overrides
  };
}

function buildActionPlan(overrides: Partial<LocalActionPlan> = {}): LocalActionPlan {
  return {
    id: "plan-1",
    organizationId,
    title: "Plan réduction sous-traitance",
    description: "Plan local issu d'une recommandation Atlas.",
    sourceRecommendationId: "recommendation-1",
    relatedKpiIds: ["kpi-1"],
    relatedInsightIds: [],
    priority: "high",
    status: "in_progress",
    owner: "Direction opérations",
    expectedImpact: "Réduire le coût sous-traitance.",
    actions: [{ id: "task-1", label: "Revoir les contrats critiques", status: "todo" }],
    createdAt: now,
    updatedAt: now,
    persisted: false,
    ...overrides
  };
}

function buildImpact(overrides: Partial<LocalActionPlanImpact> = {}): LocalActionPlanImpact {
  return {
    id: "impact-1",
    actionPlanId: "plan-1",
    relatedKpiId: "kpi-1",
    measuredAt: now,
    beforeValue: 12800,
    afterValue: 11200,
    variation: -12.5,
    trend: "down",
    status: "positive",
    interpretation: "Impact positif : le coût diminue.",
    evidence: [],
    persisted: false,
    ...overrides
  };
}

function buildConfidence(score: number): RecommendationConfidence {
  return {
    recommendationId: "recommendation-1",
    score,
    level: score >= 90 ? "very_high" : score >= 75 ? "high" : score >= 50 ? "medium" : "low",
    factors: [{ label: "Alerte cohérente", value: 10, weight: 1, explanation: "Alerte critique liée." }],
    warnings: [],
    calculatedAt: now
  };
}

function buildKnowledge(): AtlasKnowledgeItem {
  return {
    id: "knowledge-1",
    organizationId,
    type: "objective",
    sourceDocument: "objectifs.md",
    value: "Objectif : réduire la sous-traitance.",
    status: "approved",
    detectedAt: now,
    approvedAt: now
  };
}

function buildGroupByInsight(overrides: Partial<DatasetGroupByInsight> = {}): DatasetGroupByInsight {
  return {
    id: "groupby-insight-1",
    datasetId: "dataset-1",
    groupByAnalysisId: "analysis-1",
    title: "Concentration couts region Est",
    summary: "La region Est concentre une part importante des couts.",
    insightType: "concentration",
    severity: "critical",
    groupValue: "Region Est",
    value: 62,
    reasons: ["Concentration superieure a 50 %."],
    recommendedAction: "Analyser les causes de concentration",
    createdAt: now,
    persisted: false,
    ...overrides
  };
}

describe("local executive dashboard engine", () => {
  it("cree un dashboard avec une priorite critique", () => {
    const dashboard = generateLocalExecutiveDashboard({
      organizationId,
      priorities: [buildPriority()],
      alerts: [buildAlert()],
      recommendations: [buildRecommendation()]
    });

    expect(dashboard.topPriorities).toHaveLength(1);
    expect(dashboard.topPriorities[0].status).toBe("critical");
    expect(dashboard.criticalRisks).toHaveLength(1);
  });

  it("borne le score global entre 0 et 100", () => {
    const lowScore = calculateExecutiveGlobalScore({
      organizationId,
      priorities: Array.from({ length: 20 }, (_, index) => buildPriority({ id: `priority-${index}` })),
      alerts: Array.from({ length: 20 }, (_, index) => buildAlert({ id: `alert-${index}` }))
    });

    const highScore = calculateExecutiveGlobalScore({
      organizationId,
      actionPlans: Array.from({ length: 20 }, (_, index) => buildActionPlan({ id: `plan-${index}` })),
      impacts: Array.from({ length: 20 }, (_, index) => buildImpact({ id: `impact-${index}` })),
      confidenceScores: [buildConfidence(95)]
    });

    expect(lowScore).toBeGreaterThanOrEqual(0);
    expect(highScore).toBeLessThanOrEqual(100);
  });

  it("determine les statuts healthy watch critical", () => {
    expect(determineExecutiveGlobalStatus(85)).toBe("healthy");
    expect(determineExecutiveGlobalStatus(60)).toBe("watch");
    expect(determineExecutiveGlobalStatus(35)).toBe("critical");
  });

  it("genere les prochaines meilleures actions", () => {
    const actions = generateExecutiveNextBestActions({
      organizationId,
      priorities: [buildPriority()],
      recommendations: [buildRecommendation()],
      actionPlans: [buildActionPlan()]
    });

    expect(actions).toContain("Renégocier les missions sous-traitées les plus coûteuses.");
    expect(actions).toContain("Isoler les postes de sous-traitance");
    expect(actions).toContain("Revoir les contrats critiques");
  });

  it("retourne un etat vide exploitable", () => {
    const dashboard = generateLocalExecutiveDashboard({ organizationId });

    expect(dashboard.topPriorities).toHaveLength(0);
    expect(dashboard.keyRecommendations).toHaveLength(0);
    expect(dashboard.persisted).toBe(false);
  });

  it("integre les impacts positifs et negatifs dans la lecture", () => {
    const dashboard = generateLocalExecutiveDashboard({
      organizationId,
      impacts: [
        buildImpact({ id: "impact-positive", status: "positive", interpretation: "Impact positif." }),
        buildImpact({ id: "impact-negative", status: "negative", interpretation: "Impact négatif." })
      ]
    });

    expect(dashboard.recentImpacts).toHaveLength(2);
    expect(dashboard.recentImpacts.some((impact) => impact.status === "critical")).toBe(true);
    expect(dashboard.recentImpacts.some((impact) => impact.status === "healthy")).toBe(true);
  });

  it("mobilise les connaissances memoire validees", () => {
    const dashboard = generateLocalExecutiveDashboard({
      organizationId,
      kpiResults: [buildKpiResult()],
      approvedMemoryKnowledge: [buildKnowledge()]
    });

    expect(dashboard.memorySignals).toHaveLength(1);
    expect(dashboard.memorySignals[0].sourceIds).toContain("objectifs.md");
  });

  it("integre les signaux comparatifs Dataset dans les risques", () => {
    const dashboard = generateLocalExecutiveDashboard({
      organizationId,
      datasetGroupByInsights: [buildGroupByInsight()]
    });

    expect(dashboard.criticalRisks.some((risk) => risk.sourceIds.includes("groupby-insight-1"))).toBe(true);
    expect(dashboard.comparativeSignals?.[0].title).toContain("Concentration");
    expect(dashboard.dataReliabilityNotes.some((note) => note.includes("comparatifs Dataset"))).toBe(true);
  });
});
