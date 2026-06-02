import { describe, expect, it } from "vitest";
import {
  calculateRecommendationConfidence,
  determineConfidenceLevel
} from "@/lib/recommendations/recommendation-confidence-engine";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";

function recommendation(overrides: Partial<LocalRecommendation> = {}): LocalRecommendation {
  return {
    id: "recommendation-cost",
    organizationId: "org-atlas-demo",
    title: "Analyser les couts",
    summary: "Cout critique.",
    priority: "critical",
    category: "cost",
    sourceType: "kpi",
    relatedKpiIds: ["kpi-cost"],
    relatedAlertIds: ["alert-cost"],
    relatedInsightIds: [],
    relatedMemoryReferences: [],
    evidence: [],
    recommendedActions: [],
    expectedImpact: "Reduire les couts.",
    effort: "medium",
    urgency: "immediate",
    createdAt: "2026-06-01T10:00:00.000Z",
    persisted: false,
    ...overrides
  };
}

function result(overrides: Partial<LocalKpiResult> = {}): LocalKpiResult {
  return {
    id: "result-cost",
    kpiId: "kpi-cost",
    name: "Cout sous-traitance",
    calculationType: "sum",
    direction: "lower_is_better",
    value: 12000,
    status: "critical",
    calculatedAt: "2026-06-01T10:00:00.000Z",
    sourceFileName: "test.csv",
    persisted: false,
    ...overrides
  };
}

function historyPoint(value: number): LocalKpiHistoryPoint {
  return {
    id: `history-${value}`,
    kpiId: "kpi-cost",
    calculatedAt: `2026-06-${String(value).slice(0, 2).padStart(2, "0")}T10:00:00.000Z`,
    value,
    status: "critical",
    direction: "lower_is_better",
    persisted: false
  };
}

function alert(): LocalKpiAlert {
  return {
    id: "alert-cost",
    kpiId: "kpi-cost",
    title: "Cout critique",
    severity: "critical",
    value: 12000,
    direction: "lower_is_better",
    cause: "Seuil critique depasse.",
    businessImpact: "Marge sous pression.",
    recommendedAction: "Analyser les couts.",
    sourceFileName: "test.csv",
    calculatedAt: "2026-06-01T10:00:00.000Z",
    alertSource: "status",
    persisted: false
  };
}

function knowledge(): AtlasKnowledgeItem {
  return {
    id: "knowledge-cost",
    organizationId: "org-atlas-demo",
    type: "objective",
    sourceDocument: "objectifs.md",
    value: "Reduire la sous-traitance.",
    status: "approved",
    detectedAt: "2026-06-01T10:00:00.000Z",
    approvedAt: "2026-06-01T10:00:00.000Z"
  };
}

function feedback(overrides: Partial<LocalRecommendationFeedback> = {}): LocalRecommendationFeedback {
  return {
    id: "feedback-cost",
    recommendationId: "recommendation-cost",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    relevance: "relevant",
    actionTaken: "yes",
    impactObserved: "positive",
    persisted: false,
    ...overrides
  };
}

function actionPlan(): LocalActionPlan {
  return {
    id: "plan-cost",
    organizationId: "org-atlas-demo",
    title: "Plan cout",
    description: "Action cout.",
    sourceRecommendationId: "recommendation-cost",
    relatedKpiIds: ["kpi-cost"],
    relatedInsightIds: [],
    priority: "critical",
    status: "done",
    owner: "Direction",
    expectedImpact: "Reduire les couts.",
    actions: [],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    persisted: false
  };
}

function impact(status: LocalActionPlanImpact["status"]): LocalActionPlanImpact {
  return {
    id: `impact-${status}`,
    actionPlanId: "plan-cost",
    relatedKpiId: "kpi-cost",
    measuredAt: "2026-06-10T10:00:00.000Z",
    beforeValue: 12000,
    afterValue: status === "positive" ? 9000 : 14000,
    variation: status === "positive" ? -25 : 16,
    trend: status === "positive" ? "down" : "up",
    status,
    interpretation: "Impact mesure.",
    evidence: [],
    persisted: false
  };
}

describe("recommendation confidence engine", () => {
  it("calcule un score eleve avec historique, alerte, memoire, feedback et impact positif", () => {
    const confidence = calculateRecommendationConfidence({
      recommendation: recommendation({ relatedMemoryReferences: ["objectifs.md"] }),
      allRecommendations: [recommendation()],
      kpiResults: [result()],
      histories: [historyPoint(10), historyPoint(11), historyPoint(12)],
      alerts: [alert()],
      approvedMemoryKnowledge: [knowledge()],
      feedbackItems: [feedback()],
      actionPlans: [actionPlan()],
      actionPlanImpacts: [impact("positive")]
    });

    expect(confidence.score).toBeGreaterThanOrEqual(90);
    expect(confidence.level).toBe("very_high");
  });

  it("calcule un score faible avec donnees faibles, feedback negatif et impact negatif", () => {
    const confidence = calculateRecommendationConfidence({
      recommendation: recommendation({ category: "data_quality", relatedAlertIds: [] }),
      allRecommendations: [recommendation({ category: "data_quality" })],
      kpiResults: [result({ status: "not-tested" })],
      histories: [],
      alerts: [],
      feedbackItems: [feedback({ relevance: "not_relevant", impactObserved: "negative" })],
      actionPlans: [actionPlan()],
      actionPlanImpacts: [impact("negative")]
    });

    expect(confidence.score).toBeLessThan(50);
    expect(confidence.level).toBe("low");
  });

  it("ajoute un avertissement quand l'historique est insuffisant", () => {
    const confidence = calculateRecommendationConfidence({
      recommendation: recommendation(),
      histories: [historyPoint(10)]
    });

    expect(confidence.warnings.some((warning) => warning.includes("Historique"))).toBe(true);
  });

  it("ajoute un bonus memoire quand une reference est liee", () => {
    const confidence = calculateRecommendationConfidence({
      recommendation: recommendation({ relatedMemoryReferences: ["strategie.md"] }),
      histories: [historyPoint(10), historyPoint(11), historyPoint(12)]
    });

    expect(confidence.factors.some((factor) => factor.label.includes("Memory"))).toBe(true);
  });

  it("applique un bonus feedback favorable", () => {
    const confidence = calculateRecommendationConfidence({
      recommendation: recommendation(),
      allRecommendations: [recommendation()],
      feedbackItems: [feedback()]
    });

    expect(confidence.factors.some((factor) => factor.label === "Feedback utilisateur favorable")).toBe(true);
  });

  it("applique un malus feedback negatif", () => {
    const confidence = calculateRecommendationConfidence({
      recommendation: recommendation(),
      allRecommendations: [recommendation()],
      feedbackItems: [feedback({ relevance: "not_relevant" })]
    });

    expect(confidence.factors.some((factor) => factor.label === "Feedback utilisateur défavorable")).toBe(true);
  });

  it("borne le score entre 0 et 100", () => {
    const high = calculateRecommendationConfidence({
      recommendation: recommendation({ relatedMemoryReferences: ["objectifs.md"] }),
      kpiResults: [result()],
      histories: [historyPoint(10), historyPoint(11), historyPoint(12), historyPoint(13)],
      alerts: [alert()],
      feedbackItems: [feedback()],
      actionPlans: [actionPlan()],
      actionPlanImpacts: [impact("positive")]
    });

    expect(high.score).toBeLessThanOrEqual(100);
    expect(determineConfidenceLevel(49)).toBe("low");
    expect(determineConfidenceLevel(50)).toBe("medium");
    expect(determineConfidenceLevel(75)).toBe("high");
    expect(determineConfidenceLevel(90)).toBe("very_high");
  });
});
