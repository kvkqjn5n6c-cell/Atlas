import { describe, expect, it } from "vitest";
import {
  buildDatasetPipelineView,
  calculatePipelineCompletion,
  detectMissingPipelineSteps,
  getNextRecommendedPipelineStep,
  summarizePipeline
} from "@/lib/datasets/dataset-pipeline-engine";
import type { SqlMappingBundle } from "@/lib/connectors/sql/sql-mapping-types";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import type { SqlConnectionConfig } from "@/lib/connectors/sql/sql-types";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalPriorityItem } from "@/types/local-priorities";
import type { LocalRecommendation } from "@/types/local-recommendations";

const now = "2026-06-01T10:00:00.000Z";
const organizationId = "org-atlas-demo";

function connection(): SqlConnectionConfig {
  return {
    id: "connection-1",
    name: "PostgreSQL operations",
    provider: "postgresql",
    host: "localhost",
    port: 5432,
    database: "operations",
    username: "atlas",
    password: "demo",
    readonly: true,
    createdAt: now,
    updatedAt: now,
    persisted: false
  };
}

function mapping(): SqlMappingBundle {
  return {
    tableMapping: {
      id: "mapping-1",
      connectionId: "connection-1",
      tableName: "interventions",
      description: "Mapping interventions",
      createdAt: now,
      updatedAt: now,
      persisted: false
    },
    columnMappings: [
      {
        id: "column-cost",
        tableMappingId: "mapping-1",
        sourceColumn: "cost",
        sourceType: "numeric",
        targetField: "cost",
        required: true,
        enabled: true
      }
    ]
  };
}

function preparedSource(overrides: Partial<PreparedSqlSourceBundle["source"]> = {}): PreparedSqlSourceBundle {
  return {
    source: {
      id: "prepared-source-1",
      organizationId,
      connectionId: "connection-1",
      tableName: "interventions",
      displayName: "Interventions maintenance",
      mappingId: "mapping-1",
      mappedFields: [
        {
          sourceColumn: "cost",
          sourceType: "numeric",
          atlasFieldKey: "cost",
          atlasFieldLabel: "Coût",
          required: true,
          enabled: true
        }
      ],
      qualityScore: 86,
      rowPreviewCount: 100,
      availableAtlasFields: [{ key: "cost", label: "Coût", required: true }],
      warnings: [],
      createdAt: now,
      updatedAt: now,
      persisted: false,
      ...overrides
    },
    preview: {
      sourceId: "prepared-source-1",
      columns: [{ name: "cost", dataType: "numeric", nullable: false, ordinalPosition: 1 }],
      rows: [{ cost: 100 }],
      generatedAt: now,
      limitedTo: 100
    }
  };
}

function dataset(overrides: Partial<AtlasDataset> = {}): AtlasDataset {
  return {
    id: "dataset-1",
    sourceId: "prepared-source-1",
    displayName: "Dataset Atlas - Interventions maintenance",
    rowCount: 100,
    fields: [{ key: "cost", label: "Coût", sourceColumn: "cost", sourceType: "number", atlasType: "number" }],
    records: [],
    qualityScore: 84,
    warnings: [],
    createdAt: now,
    ...overrides
  };
}

function datasetKpi(): DatasetKpiDefinition {
  return {
    id: "dataset-kpi-1",
    datasetId: "dataset-1",
    name: "Somme coût",
    description: "KPI Dataset",
    type: "sum",
    field: "cost",
    aggregation: "sum",
    createdAt: now,
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
      createdAt: now
    },
    results: [{ groupValue: "Region Est", rowCount: 62, value: 62000, percentage: 62 }],
    generatedAt: now,
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
    createdAt: now,
    persisted: false
  };
}

function recommendation(): LocalRecommendation {
  return {
    id: "recommendation-groupby-1",
    organizationId,
    title: "Analyser Region Est",
    summary: "La region Est concentre les couts.",
    priority: "critical",
    category: "risk",
    sourceType: "dataset_groupby_insight",
    relatedKpiIds: [],
    relatedAlertIds: [],
    relatedInsightIds: [],
    relatedDatasetIds: ["dataset-1"],
    relatedGroupByInsightIds: ["groupby-insight-1"],
    relatedMemoryReferences: [],
    evidence: [],
    recommendedActions: [{ label: "Analyser le groupe", description: "Revoir les causes." }],
    expectedImpact: "Reduire l'ecart.",
    effort: "medium",
    urgency: "high",
    groupValue: "Region Est",
    datasetSourceLabel: "Dataset dataset-1",
    createdAt: now,
    persisted: false
  };
}

function priority(): LocalPriorityItem {
  return {
    id: "priority-1",
    organizationId,
    title: "Region Est prioritaire",
    summary: "Sujet Dataset prioritaire.",
    rank: 1,
    priorityScore: 92,
    urgency: "critical",
    impact: "high",
    category: "risk",
    sourceTypes: ["dataset_groupby_insight", "recommendation"],
    relatedKpiIds: [],
    relatedAlertIds: [],
    relatedRecommendationIds: ["recommendation-groupby-1"],
    relatedActionPlanIds: [],
    relatedDatasetIds: ["dataset-1"],
    relatedGroupByInsightIds: ["groupby-insight-1"],
    relatedMemoryReferences: [],
    recommendedNextAction: "Analyser Region Est.",
    reasons: ["Insight comparatif critique."],
    warnings: [],
    groupValue: "Region Est",
    datasetSourceLabel: "Dataset dataset-1",
    createdAt: now,
    persisted: false
  };
}

function actionPlan(): LocalActionPlan {
  return {
    id: "plan-1",
    organizationId,
    title: "Plan Region Est",
    description: "Plan Dataset.",
    sourceType: "dataset_groupby_insight",
    sourceRecommendationId: "recommendation-groupby-1",
    relatedKpiIds: [],
    relatedInsightIds: [],
    relatedDatasetIds: ["dataset-1"],
    relatedGroupByInsightIds: ["groupby-insight-1"],
    groupValue: "Region Est",
    datasetSourceLabel: "Dataset dataset-1",
    priority: "critical",
    status: "todo",
    owner: "Operations",
    expectedImpact: "Reduire l'ecart.",
    actions: [{ id: "task-1", label: "Analyser", status: "todo" }],
    createdAt: now,
    updatedAt: now,
    persisted: false
  };
}

function journal(): DecisionJournalEntry {
  return {
    id: "journal-dataset-generated-dataset-1",
    createdAt: now,
    type: "dataset_generated",
    title: "Dataset genere",
    description: "Dataset Atlas genere.",
    sourceType: "dataset",
    sourceId: "dataset-1",
    relatedKpiIds: [],
    relatedRecommendationIds: [],
    relatedActionPlanIds: [],
    relatedDatasetIds: ["dataset-1"],
    relatedGroupByInsightIds: [],
    relatedMemoryReferences: [],
    metadata: {}
  };
}

function completeInput() {
  return {
    sqlConnections: [connection()],
    sqlMappings: [mapping()],
    preparedSources: [preparedSource()],
    datasets: [dataset()],
    datasetKpis: [datasetKpi()],
    groupByAnalyses: [groupByAnalysis()],
    groupByInsights: [groupByInsight()],
    recommendations: [recommendation()],
    priorities: [priority()],
    actionPlans: [actionPlan()],
    decisionJournalEntries: [journal()]
  };
}

describe("dataset pipeline engine", () => {
  it("reconstruit un pipeline complet", () => {
    const view = buildDatasetPipelineView(completeInput());

    expect(view.nodes).toHaveLength(11);
    expect(view.completionScore).toBe(100);
    expect(view.missingSteps).toHaveLength(0);
    expect(view.nextRecommendedStep).toBeUndefined();
    expect(summarizePipeline(view)).toContain("complete");
  });

  it("signale un pipeline sans dataset", () => {
    const view = buildDatasetPipelineView({
      sqlConnections: [connection()],
      sqlMappings: [mapping()],
      preparedSources: [preparedSource()]
    });

    expect(view.completionScore).toBe(27);
    expect(view.missingSteps).toContain("Dataset Atlas");
    expect(view.nextRecommendedStep).toBe("Generer un Dataset Atlas depuis une source preparee.");
  });

  it("recommande de preparer une source quand un mapping existe", () => {
    const view = buildDatasetPipelineView({
      sqlConnections: [connection()],
      sqlMappings: [mapping()]
    });

    expect(view.nextRecommendedStep).toBe("Preparer une source SQL depuis un mapping valide.");
    expect(detectMissingPipelineSteps(view.nodes)).toContain("Source preparee");
  });

  it("calcule le score de completion", () => {
    const view = buildDatasetPipelineView({
      sqlConnections: [connection()],
      sqlMappings: [mapping()],
      preparedSources: [preparedSource()],
      datasets: [dataset()],
      datasetKpis: [datasetKpi()]
    });

    expect(calculatePipelineCompletion(view.nodes)).toBe(45);
  });

  it("remonte les warnings des sources et datasets", () => {
    const view = buildDatasetPipelineView({
      sqlConnections: [connection()],
      sqlMappings: [mapping()],
      preparedSources: [preparedSource({ warnings: ["Champ obligatoire absent."] })],
      datasets: [dataset({ warnings: ["Valeurs manquantes detectees."] })]
    });

    expect(view.nodes.find((node) => node.type === "prepared_source")?.status).toBe("warning");
    expect(view.nodes.find((node) => node.type === "dataset")?.warnings).toContain("Valeurs manquantes detectees.");
  });
});
