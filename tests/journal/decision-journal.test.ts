import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addJournalEntry,
  clearJournal,
  deleteJournalEntry,
  getJournalEntries,
  getJournalEntriesByType
} from "@/lib/local/decision-journal-store";
import {
  recordActionPlanCreated,
  recordFeedbackRecorded,
  recordMemoryKnowledgeApproved,
  recordRecommendationCreated
} from "@/lib/journal/decision-journal-engine";
import { buildLocalActionPlanFromRecommendation } from "@/lib/action-plans/local-action-plan-builder";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { DecisionJournalEntry } from "@/types/decision-journal";
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

function entry(overrides: Partial<DecisionJournalEntry> = {}): DecisionJournalEntry {
  return {
    id: "journal-entry-1",
    createdAt: "2026-06-01T10:00:00.000Z",
    type: "recommendation_created",
    title: "Recommandation créée",
    description: "Une recommandation Atlas a été générée.",
    sourceType: "recommendation",
    sourceId: "recommendation-1",
    priority: "high",
    status: "cost",
    relatedKpiIds: ["kpi-1"],
    relatedRecommendationIds: ["recommendation-1"],
    relatedActionPlanIds: [],
    relatedMemoryReferences: [],
    metadata: {},
    ...overrides
  };
}

function recommendation(): LocalRecommendation {
  return {
    id: "recommendation-1",
    organizationId: "org-atlas-demo",
    title: "Analyser les coûts prioritaires",
    summary: "Le coût sous-traitance dépasse le seuil critique.",
    priority: "critical",
    category: "cost",
    sourceType: "kpi",
    relatedKpiIds: ["kpi-cost"],
    relatedAlertIds: ["alert-cost"],
    relatedInsightIds: ["insight-cost"],
    relatedMemoryReferences: ["Objectif validé : réduire la sous-traitance"],
    evidence: [],
    recommendedActions: [],
    expectedImpact: "Réduire le coût sous-traitance.",
    effort: "medium",
    urgency: "immediate",
    createdAt: "2026-06-01T10:00:00.000Z",
    persisted: false
  };
}

function feedback(): LocalRecommendationFeedback {
  return {
    id: "feedback-1",
    recommendationId: "recommendation-1",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T11:00:00.000Z",
    relevance: "relevant",
    actionTaken: "yes",
    impactObserved: "positive",
    comment: "Décision utile pour cadrer le plan.",
    linkedActionPlanId: "plan-1",
    persisted: false
  };
}

function approvedKnowledge(): AtlasKnowledgeItem {
  return {
    id: "knowledge-1",
    organizationId: "org-atlas-demo",
    type: "objective",
    sourceDocument: "objectifs.md",
    value: "Réduire la sous-traitance",
    status: "approved",
    detectedAt: "2026-06-01T09:00:00.000Z",
    approvedAt: "2026-06-01T12:00:00.000Z"
  };
}

describe("decision journal", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cree et recupere les evenements tries chronologiquement", () => {
    addJournalEntry(entry({ id: "old", createdAt: "2026-06-01T09:00:00.000Z" }));
    addJournalEntry(entry({ id: "new", createdAt: "2026-06-01T12:00:00.000Z" }));

    expect(getJournalEntries().map((item) => item.id)).toEqual(["new", "old"]);
  });

  it("filtre les evenements par type", () => {
    addJournalEntry(entry());
    addJournalEntry(entry({ id: "impact", type: "impact_measured", sourceType: "impact", sourceId: "impact-1" }));

    expect(getJournalEntriesByType("recommendation_created")).toHaveLength(1);
    expect(getJournalEntriesByType("impact_measured")[0].sourceId).toBe("impact-1");
  });

  it("supprime et reinitialise le journal", () => {
    addJournalEntry(entry());
    deleteJournalEntry("journal-entry-1");
    expect(getJournalEntries()).toHaveLength(0);

    addJournalEntry(entry());
    clearJournal();
    expect(getJournalEntries()).toHaveLength(0);
  });

  it("alimente automatiquement le journal depuis une recommandation et un plan", () => {
    const recommendationItem = recommendation();
    const plan = buildLocalActionPlanFromRecommendation(recommendationItem);

    recordRecommendationCreated(recommendationItem);
    recordActionPlanCreated(plan);

    expect(getJournalEntriesByType("recommendation_created")).toHaveLength(1);
    expect(getJournalEntriesByType("action_plan_created")[0].relatedRecommendationIds).toEqual(["recommendation-1"]);
  });

  it("alimente automatiquement le journal depuis le feedback et la memoire", () => {
    recordFeedbackRecorded(feedback());
    recordMemoryKnowledgeApproved(approvedKnowledge());

    expect(getJournalEntriesByType("feedback_recorded")[0].relatedActionPlanIds).toEqual(["plan-1"]);
    expect(getJournalEntriesByType("memory_knowledge_approved")[0].relatedMemoryReferences[0].value).toBe("Réduire la sous-traitance");
  });
});
