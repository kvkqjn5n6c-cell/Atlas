import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRecommendationFeedback,
  deleteRecommendationFeedback,
  getRecommendationFeedback,
  getRecommendationFeedbackByRecommendationId,
  saveRecommendationFeedback,
  updateRecommendationFeedback
} from "@/lib/local/local-recommendation-feedback-store";
import {
  buildEmptyRecommendationFeedback,
  calculateRecommendationFeedbackStats
} from "@/lib/recommendations/local-recommendation-feedback";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    })
  };
}

function recommendation(id = "recommendation-1"): LocalRecommendation {
  return {
    id,
    organizationId: "org-atlas-demo",
    title: "Recommandation test",
    summary: "Résumé test",
    priority: "high",
    category: "operations",
    sourceType: "kpi",
    relatedKpiIds: ["kpi-1"],
    relatedAlertIds: [],
    relatedInsightIds: [],
    relatedMemoryReferences: [],
    evidence: [],
    recommendedActions: [],
    expectedImpact: "Impact attendu",
    effort: "medium",
    urgency: "high",
    createdAt: "2026-06-01T10:00:00.000Z",
    persisted: false
  };
}

function feedback(overrides: Partial<LocalRecommendationFeedback> = {}): LocalRecommendationFeedback {
  return {
    id: "feedback-recommendation-1",
    recommendationId: "recommendation-1",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    relevance: "relevant",
    actionTaken: "yes",
    impactObserved: "positive",
    persisted: false,
    ...overrides
  };
}

describe("local recommendation feedback", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cree un feedback par defaut lie a une recommandation", () => {
    const item = buildEmptyRecommendationFeedback(recommendation(), [], []);

    expect(item.recommendationId).toBe("recommendation-1");
    expect(item.relevance).toBe("unknown");
    expect(item.persisted).toBe(false);
  });

  it("sauvegarde et recupere un feedback", () => {
    saveRecommendationFeedback(feedback());

    expect(getRecommendationFeedback()).toHaveLength(1);
    expect(getRecommendationFeedbackByRecommendationId("recommendation-1")?.relevance).toBe("relevant");
  });

  it("met a jour un feedback", () => {
    const saved = saveRecommendationFeedback(feedback());

    updateRecommendationFeedback({ ...saved, relevance: "not_relevant", actionTaken: "no" });

    expect(getRecommendationFeedbackByRecommendationId("recommendation-1")?.relevance).toBe("not_relevant");
    expect(getRecommendationFeedbackByRecommendationId("recommendation-1")?.actionTaken).toBe("no");
  });

  it("supprime un feedback", () => {
    const saved = saveRecommendationFeedback(feedback());

    deleteRecommendationFeedback(saved.id);

    expect(getRecommendationFeedback()).toHaveLength(0);
  });

  it("calcule les taux de pertinence et de suivi", () => {
    const recommendations = [recommendation("recommendation-1"), recommendation("recommendation-2")];
    const stats = calculateRecommendationFeedbackStats(recommendations, [
      feedback({ recommendationId: "recommendation-1", relevance: "relevant", actionTaken: "yes", impactObserved: "positive" }),
      feedback({ id: "feedback-2", recommendationId: "recommendation-2", relevance: "not_relevant", actionTaken: "no", impactObserved: "negative" })
    ]);

    expect(stats.feedbackCount).toBe(2);
    expect(stats.relevanceRate).toBe(50);
    expect(stats.followRate).toBe(50);
    expect(stats.positiveImpactCount).toBe(1);
    expect(stats.negativeImpactCount).toBe(1);
  });

  it("reinitialise les feedbacks", () => {
    saveRecommendationFeedback(feedback());

    clearRecommendationFeedback();

    expect(getRecommendationFeedback()).toHaveLength(0);
  });
});
