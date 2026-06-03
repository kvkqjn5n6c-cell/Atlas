import { describe, expect, it } from "vitest";
import {
  calculatePriorityScore,
  generateLocalPriorities,
  rankLocalPriorities
} from "@/lib/priorities/local-priorities-engine";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalRecommendation } from "@/types/local-recommendations";
import { buildKpiResult } from "../fixtures/local-engine-fixtures";

const organizationId = "org-atlas-demo";

function recommendation(overrides: Partial<LocalRecommendation> = {}): LocalRecommendation {
  return {
    id: "recommendation-1",
    organizationId,
    title: "Traiter le coût sous-traitance",
    summary: "Le coût sous-traitance dépasse le seuil critique.",
    priority: "critical",
    category: "cost",
    sourceType: "kpi",
    relatedKpiIds: ["kpi-1"],
    relatedAlertIds: ["local-alert-kpi-1"],
    relatedInsightIds: [],
    relatedMemoryReferences: ["Objectif validé : réduire la sous-traitance"],
    evidence: [],
    recommendedActions: [{
      label: "Analyser les postes de coût",
      description: "Identifier les lignes qui expliquent le dépassement."
    }],
    expectedImpact: "Réduire les coûts prioritaires.",
    effort: "medium",
    urgency: "immediate",
    createdAt: "2026-06-01T10:00:00.000Z",
    persisted: false,
    ...overrides
  };
}

function negativeImpact(): LocalActionPlanImpact {
  return {
    id: "impact-negative",
    actionPlanId: "plan-1",
    relatedKpiId: "kpi-1",
    measuredAt: "2026-06-01T10:00:00.000Z",
    beforeValue: 100,
    afterValue: 120,
    variation: 20,
    trend: "up",
    status: "negative",
    interpretation: "Impact négatif observé.",
    evidence: [],
    persisted: false
  };
}

describe("local priorities engine", () => {
  it("transforme une alerte critique en priorité critique", () => {
    const result = buildKpiResult({ status: "critical" });
    const priorities = generateLocalPriorities({
      organizationId,
      kpiResults: [result],
      alerts: [{
        id: "local-alert-kpi-1",
        kpiId: "kpi-1",
        title: "Coût critique",
        severity: "critical",
        value: 12800,
        direction: "lower_is_better",
        cause: "Coût trop élevé.",
        businessImpact: "Risque marge.",
        recommendedAction: "Arbitrer le coût.",
        sourceFileName: "test.csv",
        calculatedAt: "2026-06-01T10:00:00.000Z",
        alertSource: "status",
        persisted: false
      }]
    });

    expect(priorities[0].urgency).toBe("critical");
    expect(priorities[0].sourceTypes).toContain("alert");
  });

  it("valorise une recommandation high", () => {
    const priorities = generateLocalPriorities({
      organizationId,
      kpiResults: [buildKpiResult({ status: "watch" })],
      recommendations: [recommendation({ priority: "high" })]
    });

    expect(priorities[0].reasons.some((reason) => reason.includes("high"))).toBe(true);
    expect(priorities[0].priorityScore).toBeGreaterThan(0);
  });

  it("ajoute un signal pour impact negatif observe", () => {
    const priorities = generateLocalPriorities({
      organizationId,
      kpiResults: [buildKpiResult()],
      recommendations: [recommendation()],
      impacts: [negativeImpact()]
    });

    expect(priorities[0].reasons.some((reason) => reason.includes("Impact négatif"))).toBe(true);
  });

  it("ajoute un signal quand le plan est absent", () => {
    const priorities = generateLocalPriorities({
      organizationId,
      recommendations: [recommendation()]
    });

    expect(priorities[0].reasons.some((reason) => reason.includes("Aucun plan"))).toBe(true);
  });

  it("trie les priorites par score décroissant", () => {
    const ranked = rankLocalPriorities([
      { ...generateLocalPriorities({ organizationId, recommendations: [recommendation({ id: "a", priority: "high" })] })[0], priorityScore: 20 },
      { ...generateLocalPriorities({ organizationId, recommendations: [recommendation({ id: "b", priority: "critical" })] })[0], priorityScore: 80 }
    ]);

    expect(ranked[0].priorityScore).toBe(80);
    expect(ranked[0].rank).toBe(1);
  });

  it("borne le score entre 0 et 100", () => {
    const score = calculatePriorityScore({
      recommendation: recommendation(),
      kpiResult: buildKpiResult(),
      confidence: {
        recommendationId: "recommendation-1",
        score: 95,
        level: "very_high",
        factors: [],
        warnings: [],
        calculatedAt: "2026-06-01T10:00:00.000Z"
      },
      actionPlans: [],
      impacts: [negativeImpact()],
      feedbackItems: [{
        id: "feedback-1",
        recommendationId: "recommendation-1",
        createdAt: "2026-06-01T10:00:00.000Z",
        updatedAt: "2026-06-01T10:00:00.000Z",
        relevance: "not_relevant",
        actionTaken: "no",
        impactObserved: "negative",
        persisted: false
      }],
      histories: [],
      approvedMemoryKnowledge: []
    });

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("retourne un état vide sans signal", () => {
    expect(generateLocalPriorities({ organizationId })).toHaveLength(0);
  });
});
