import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLocalActionPlanFromRecommendation } from "@/lib/action-plans/local-action-plan-builder";
import {
  clearLocalActionPlans,
  deleteLocalActionPlan,
  getLocalActionPlans,
  getLocalActionPlansByRecommendationId,
  saveLocalActionPlan,
  updateLocalActionPlan
} from "@/lib/local/local-action-plans-store";
import type { LocalRecommendation } from "@/types/local-recommendations";

function buildRecommendation(overrides: Partial<LocalRecommendation> = {}): LocalRecommendation {
  return {
    id: "recommendation-cost-1",
    organizationId: "org-atlas-demo",
    title: "Analyser les postes de coût prioritaires",
    summary: "Le coût sous-traitance dépasse le seuil critique.",
    priority: "critical",
    category: "cost",
    sourceType: "kpi",
    relatedKpiIds: ["kpi-cost"],
    relatedAlertIds: ["alert-cost"],
    relatedInsightIds: ["insight-cost"],
    relatedMemoryReferences: [],
    evidence: [{ type: "kpi", label: "Coût sous-traitance", value: 12800 }],
    recommendedActions: [
      {
        label: "Identifier les postes de coût",
        description: "Analyser les lignes qui pèsent le plus sur le coût total.",
        ownerSuggestion: "Direction opérations",
        timeframe: "Cette semaine"
      }
    ],
    expectedImpact: "Réduction des coûts prioritaires.",
    effort: "medium",
    urgency: "immediate",
    createdAt: "2026-06-01T10:00:00.000Z",
    persisted: false,
    ...overrides
  };
}

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

describe("local action plans store", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cree un plan local depuis une recommandation", () => {
    const recommendation = buildRecommendation();
    const plan = buildLocalActionPlanFromRecommendation(recommendation);

    expect(plan.sourceRecommendationId).toBe(recommendation.id);
    expect(plan.sourceAlertId).toBe("alert-cost");
    expect(plan.relatedKpiIds).toEqual(["kpi-cost"]);
    expect(plan.actions).toHaveLength(1);
    expect(plan.persisted).toBe(false);
  });

  it("sauvegarde et recupere les plans locaux", () => {
    const plan = buildLocalActionPlanFromRecommendation(buildRecommendation());

    saveLocalActionPlan(plan);

    expect(getLocalActionPlans()).toHaveLength(1);
    expect(getLocalActionPlans()[0].title).toBe(plan.title);
  });

  it("met a jour le statut d'un plan", () => {
    const plan = saveLocalActionPlan(buildLocalActionPlanFromRecommendation(buildRecommendation()));

    updateLocalActionPlan({ ...plan, status: "in_progress" });

    expect(getLocalActionPlans()[0].status).toBe("in_progress");
  });

  it("supprime un plan local", () => {
    const plan = saveLocalActionPlan(buildLocalActionPlanFromRecommendation(buildRecommendation()));

    deleteLocalActionPlan(plan.id);

    expect(getLocalActionPlans()).toHaveLength(0);
  });

  it("detecte une recommandation deja convertie", () => {
    const recommendation = buildRecommendation();
    saveLocalActionPlan(buildLocalActionPlanFromRecommendation(recommendation));

    expect(getLocalActionPlansByRecommendationId(recommendation.id)).toHaveLength(1);
  });

  it("reinitialise les plans locaux", () => {
    saveLocalActionPlan(buildLocalActionPlanFromRecommendation(buildRecommendation()));

    clearLocalActionPlans();

    expect(getLocalActionPlans()).toHaveLength(0);
  });
});
