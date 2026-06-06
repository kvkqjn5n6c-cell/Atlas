import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addJournalEntry,
  clearJournal,
  deleteJournalEntry,
  getJournalEntries,
  getJournalEntriesByType
} from "@/lib/local/decision-journal-store";
import {
  recordDatasetActionPlanCreated,
  recordDatasetAnalysis,
  recordDatasetGenerated,
  recordDatasetKpiCreated,
  recordGroupByInsight,
  recordActionPlanCreated,
  recordFeedbackRecorded,
  recordMemoryKnowledgeApproved,
  recordRecommendationCreated
} from "@/lib/journal/decision-journal-engine";
import { buildLocalActionPlanFromRecommendation } from "@/lib/action-plans/local-action-plan-builder";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
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

function groupByRecommendation(): LocalRecommendation {
  return {
    ...recommendation(),
    id: "recommendation-groupby-1",
    title: "Analyser la concentration observee sur Region Est",
    summary: "La region Est concentre une part importante des couts.",
    sourceType: "dataset_groupby_insight",
    category: "risk",
    relatedKpiIds: [],
    relatedAlertIds: [],
    relatedInsightIds: [],
    relatedDatasetIds: ["dataset-1"],
    relatedGroupByInsightIds: ["groupby-insight-1"],
    groupValue: "Region Est",
    datasetSourceLabel: "Dataset dataset-1",
    evidence: [{ type: "dataset_groupby_insight", label: "Concentration", value: 62 }]
  };
}

function dataset(): AtlasDataset {
  return {
    id: "dataset-1",
    sourceId: "prepared-source-1",
    displayName: "Dataset Atlas - Interventions maintenance",
    rowCount: 100,
    fields: [{ key: "cost", label: "Coût", sourceColumn: "cost", sourceType: "number", atlasType: "number" }],
    records: [],
    qualityScore: 84,
    warnings: [],
    createdAt: "2026-06-01T10:00:00.000Z"
  };
}

function datasetKpiDefinition(): DatasetKpiDefinition {
  return {
    id: "dataset-kpi-1",
    datasetId: "dataset-1",
    name: "Somme coût",
    description: "KPI genere depuis Dataset Atlas - Interventions maintenance",
    type: "sum",
    field: "cost",
    aggregation: "sum",
    filteredRowCount: 80,
    createdAt: "2026-06-01T10:05:00.000Z",
    persisted: false
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
      createdAt: "2026-06-01T10:10:00.000Z"
    },
    results: [{ groupValue: "Region Est", rowCount: 62, value: 62000, percentage: 62 }],
    generatedAt: "2026-06-01T10:10:00.000Z",
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
    createdAt: "2026-06-01T10:15:00.000Z",
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

  it("journalise les plans issus d'un insight comparatif Dataset", () => {
    const recommendationItem = groupByRecommendation();
    const plan = buildLocalActionPlanFromRecommendation(recommendationItem);

    recordActionPlanCreated(plan);

    const entry = getJournalEntriesByType("action_plan_created")[0];
    expect(entry.relatedDatasetIds).toEqual(["dataset-1"]);
    expect(entry.relatedGroupByInsightIds).toEqual(["groupby-insight-1"]);
    expect(entry.metadata.groupValue).toBe("Region Est");
    expect(entry.metadata.datasetSourceLabel).toBe("Dataset dataset-1");
  });

  it("journalise la generation d'un Dataset Atlas", () => {
    recordDatasetGenerated(dataset());

    const entry = getJournalEntriesByType("dataset_generated")[0];
    expect(entry.relatedDatasetIds).toEqual(["dataset-1"]);
    expect(entry.metadata.datasetName).toBe("Dataset Atlas - Interventions maintenance");
    expect(entry.metadata.qualityScore).toBe(84);
  });

  it("journalise la creation d'un KPI depuis Dataset", () => {
    recordDatasetKpiCreated({
      dataset: dataset(),
      definition: datasetKpiDefinition(),
      kpiId: "kpi-dataset-1",
      value: 62000
    });

    const entry = getJournalEntriesByType("dataset_kpi_created")[0];
    expect(entry.relatedKpiIds).toEqual(["kpi-dataset-1"]);
    expect(entry.relatedDatasetIds).toEqual(["dataset-1"]);
    expect(entry.metadata.aggregation).toBe("sum");
  });

  it("journalise une analyse Group By Dataset", () => {
    recordDatasetAnalysis(dataset(), groupByAnalysis());

    const entry = getJournalEntriesByType("dataset_analysis")[0];
    expect(entry.sourceId).toBe("analysis-1");
    expect(entry.relatedDatasetIds).toEqual(["dataset-1"]);
    expect(entry.metadata.groupedBy).toBe("Région");
  });

  it("journalise un insight comparatif Group By", () => {
    recordGroupByInsight(dataset(), groupByInsight());

    const entry = getJournalEntriesByType("groupby_insight")[0];
    expect(entry.relatedGroupByInsightIds).toEqual(["groupby-insight-1"]);
    expect(entry.metadata.groupValue).toBe("Region Est");
    expect(entry.metadata.analysisId).toBe("analysis-1");
  });

  it("journalise une entree dediee pour un plan Dataset", () => {
    const plan = buildLocalActionPlanFromRecommendation(groupByRecommendation());

    recordDatasetActionPlanCreated(plan);

    const entry = getJournalEntriesByType("dataset_action_plan_created")[0];
    expect(entry.relatedActionPlanIds).toEqual([plan.id]);
    expect(entry.relatedDatasetIds).toEqual(["dataset-1"]);
    expect(entry.metadata.recommendationId).toBe("recommendation-groupby-1");
  });

  it("evite les doublons quand un evenement Dataset stable est rejoue", () => {
    recordDatasetGenerated(dataset());
    recordDatasetGenerated({ ...dataset(), qualityScore: 72 });

    const entries = getJournalEntriesByType("dataset_generated");
    expect(entries).toHaveLength(1);
    expect(entries[0].metadata.qualityScore).toBe(72);
  });

  it("alimente automatiquement le journal depuis le feedback et la memoire", () => {
    recordFeedbackRecorded(feedback());
    recordMemoryKnowledgeApproved(approvedKnowledge());

    expect(getJournalEntriesByType("feedback_recorded")[0].relatedActionPlanIds).toEqual(["plan-1"]);
    expect(getJournalEntriesByType("memory_knowledge_approved")[0].relatedMemoryReferences[0].value).toBe("Réduire la sous-traitance");
  });
});
