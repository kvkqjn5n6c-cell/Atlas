import { addJournalEntry } from "@/lib/local/decision-journal-store";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { DecisionJournalEntry, DecisionJournalMemoryReference } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";
import type { RecommendationConfidence } from "@/types/recommendation-confidence";

function now() {
  return new Date().toISOString();
}

function memoryReferencesFromLabels(labels: string[]): DecisionJournalMemoryReference[] {
  return labels.map((value) => ({ value, status: "approved" as const }));
}

function memoryReferenceFromKnowledge(item: AtlasKnowledgeItem): DecisionJournalMemoryReference {
  return {
    sourceDocument: item.sourceDocument,
    knowledgeType: item.type,
    value: item.value,
    status: item.status
  };
}

function journalEntry(entry: DecisionJournalEntry) {
  return addJournalEntry(entry);
}

export function buildDatasetGeneratedEntry(dataset: AtlasDataset): DecisionJournalEntry {
  return {
    id: `journal-dataset-generated-${dataset.id}`,
    createdAt: dataset.createdAt,
    type: "dataset_generated",
    title: `Dataset Atlas généré : ${dataset.displayName}`,
    description: `${dataset.displayName} est disponible localement avec ${dataset.rowCount} ligne(s) preview et ${dataset.fields.length} champ(s) Atlas.`,
    sourceType: "dataset",
    sourceId: dataset.id,
    status: dataset.qualityScore >= 80 ? "ready" : dataset.qualityScore >= 55 ? "watch" : "limited",
    relatedKpiIds: [],
    relatedRecommendationIds: [],
    relatedActionPlanIds: [],
    relatedDatasetIds: [dataset.id],
    relatedGroupByInsightIds: [],
    relatedMemoryReferences: [],
    metadata: {
      datasetId: dataset.id,
      datasetName: dataset.displayName,
      sourceId: dataset.sourceId,
      rowCount: dataset.rowCount,
      fieldCount: dataset.fields.length,
      qualityScore: dataset.qualityScore,
      warningCount: dataset.warnings.length,
      sourceLabel: dataset.displayName
    }
  };
}

export function recordDatasetGenerated(dataset: AtlasDataset) {
  return journalEntry(buildDatasetGeneratedEntry(dataset));
}

export function buildDatasetKpiCreatedEntry(input: {
  dataset: AtlasDataset;
  definition: DatasetKpiDefinition;
  kpiId: string;
  value?: number;
}): DecisionJournalEntry {
  return {
    id: `journal-dataset-kpi-created-${input.definition.id}`,
    createdAt: input.definition.createdAt,
    type: "dataset_kpi_created",
    title: `KPI Dataset créé : ${input.definition.name}`,
    description: `KPI local généré depuis ${input.dataset.displayName} avec l'agrégation ${input.definition.aggregation}.`,
    sourceType: "dataset_kpi",
    sourceId: input.definition.id,
    status: input.definition.aggregation,
    relatedKpiIds: [input.kpiId],
    relatedRecommendationIds: [],
    relatedActionPlanIds: [],
    relatedDatasetIds: [input.dataset.id],
    relatedGroupByInsightIds: [],
    relatedMemoryReferences: [],
    metadata: {
      datasetId: input.dataset.id,
      datasetName: input.dataset.displayName,
      datasetKpiId: input.definition.id,
      kpiId: input.kpiId,
      sourceLabel: input.dataset.displayName,
      aggregation: input.definition.aggregation,
      field: input.definition.field,
      filteredRowCount: input.definition.filteredRowCount,
      value: input.value
    }
  };
}

export function recordDatasetKpiCreated(input: {
  dataset: AtlasDataset;
  definition: DatasetKpiDefinition;
  kpiId: string;
  value?: number;
}) {
  return journalEntry(buildDatasetKpiCreatedEntry(input));
}

export function buildDatasetAnalysisEntry(dataset: AtlasDataset, analysis: DatasetGroupByAnalysis): DecisionJournalEntry {
  return {
    id: `journal-dataset-analysis-${analysis.id}`,
    createdAt: analysis.generatedAt,
    type: "dataset_analysis",
    title: `Analyse Dataset : ${analysis.groupedBy.label}`,
    description: `${analysis.results.length} groupe(s) comparés sur ${dataset.displayName}.`,
    sourceType: "dataset_analysis",
    sourceId: analysis.id,
    status: analysis.aggregation,
    relatedKpiIds: [],
    relatedRecommendationIds: [],
    relatedActionPlanIds: [],
    relatedDatasetIds: [dataset.id],
    relatedGroupByInsightIds: [],
    relatedMemoryReferences: [],
    metadata: {
      datasetId: dataset.id,
      datasetName: dataset.displayName,
      analysisId: analysis.id,
      sourceLabel: dataset.displayName,
      aggregation: analysis.aggregation,
      field: analysis.field,
      groupedBy: analysis.groupedBy.label,
      groupCount: analysis.results.length,
      warningCount: analysis.warnings.length
    }
  };
}

export function recordDatasetAnalysis(dataset: AtlasDataset, analysis: DatasetGroupByAnalysis) {
  return journalEntry(buildDatasetAnalysisEntry(dataset, analysis));
}

export function buildGroupByInsightEntry(dataset: AtlasDataset, insight: DatasetGroupByInsight): DecisionJournalEntry {
  return {
    id: `journal-groupby-insight-${insight.id}`,
    createdAt: insight.createdAt,
    type: "groupby_insight",
    title: `Insight comparatif : ${insight.title}`,
    description: insight.summary,
    sourceType: "dataset_groupby_insight",
    sourceId: insight.id,
    status: insight.severity,
    relatedKpiIds: [],
    relatedRecommendationIds: [],
    relatedActionPlanIds: [],
    relatedDatasetIds: [dataset.id],
    relatedGroupByInsightIds: [insight.id],
    relatedMemoryReferences: [],
    metadata: {
      datasetId: dataset.id,
      datasetName: dataset.displayName,
      analysisId: insight.groupByAnalysisId,
      groupByInsightId: insight.id,
      groupValue: insight.groupValue,
      sourceLabel: dataset.displayName,
      insightType: insight.insightType,
      value: insight.value,
      comparisonValue: insight.comparisonValue,
      gap: insight.gap,
      reasonCount: insight.reasons.length,
      recommendedAction: insight.recommendedAction
    }
  };
}

export function recordGroupByInsight(dataset: AtlasDataset, insight: DatasetGroupByInsight) {
  return journalEntry(buildGroupByInsightEntry(dataset, insight));
}

export function buildDatasetActionPlanCreatedEntry(plan: LocalActionPlan): DecisionJournalEntry {
  return {
    id: `journal-dataset-action-plan-created-${plan.id}`,
    createdAt: plan.createdAt,
    type: "dataset_action_plan_created",
    title: `Plan Dataset créé : ${plan.title}`,
    description: plan.description,
    sourceType: "action_plan",
    sourceId: plan.id,
    priority: plan.priority,
    status: plan.status,
    relatedKpiIds: plan.relatedKpiIds,
    relatedRecommendationIds: plan.sourceRecommendationId ? [plan.sourceRecommendationId] : [],
    relatedActionPlanIds: [plan.id],
    relatedDatasetIds: plan.relatedDatasetIds ?? [],
    relatedGroupByInsightIds: plan.relatedGroupByInsightIds ?? [],
    relatedMemoryReferences: [],
    metadata: {
      datasetId: plan.relatedDatasetIds?.[0],
      datasetName: plan.datasetSourceLabel,
      recommendationId: plan.sourceRecommendationId,
      actionPlanId: plan.id,
      groupByInsightId: plan.relatedGroupByInsightIds?.[0],
      groupValue: plan.groupValue,
      sourceLabel: plan.datasetSourceLabel,
      expectedImpact: plan.expectedImpact,
      taskCount: plan.actions.length
    }
  };
}

export function recordDatasetActionPlanCreated(plan: LocalActionPlan) {
  return journalEntry(buildDatasetActionPlanCreatedEntry(plan));
}

export function recordRecommendationCreated(recommendation: LocalRecommendation) {
  return journalEntry({
    id: `journal-recommendation-created-${recommendation.id}`,
    createdAt: recommendation.createdAt,
    type: "recommendation_created",
    title: `Recommandation créée : ${recommendation.title}`,
    description: recommendation.summary,
    sourceType: "recommendation",
    sourceId: recommendation.id,
    priority: recommendation.priority,
    status: recommendation.category,
    relatedKpiIds: recommendation.relatedKpiIds,
    relatedRecommendationIds: [recommendation.id],
    relatedActionPlanIds: [],
    relatedDatasetIds: recommendation.relatedDatasetIds,
    relatedGroupByInsightIds: recommendation.relatedGroupByInsightIds,
    relatedMemoryReferences: memoryReferencesFromLabels(recommendation.relatedMemoryReferences),
    metadata: {
      category: recommendation.category,
      effort: recommendation.effort,
      urgency: recommendation.urgency,
      expectedImpact: recommendation.expectedImpact,
      groupValue: recommendation.groupValue,
      datasetSourceLabel: recommendation.datasetSourceLabel
    }
  });
}

export function recordActionPlanCreated(plan: LocalActionPlan) {
  return journalEntry({
    id: `journal-action-plan-created-${plan.id}`,
    createdAt: plan.createdAt,
    type: "action_plan_created",
    title: `Plan d'action créé : ${plan.title}`,
    description: plan.description,
    sourceType: "action_plan",
    sourceId: plan.id,
    priority: plan.priority,
    status: plan.status,
    relatedKpiIds: plan.relatedKpiIds,
    relatedRecommendationIds: plan.sourceRecommendationId ? [plan.sourceRecommendationId] : [],
    relatedActionPlanIds: [plan.id],
    relatedDatasetIds: plan.relatedDatasetIds,
    relatedGroupByInsightIds: plan.relatedGroupByInsightIds,
    relatedMemoryReferences: [],
    metadata: {
      owner: plan.owner,
      dueDate: plan.dueDate,
      expectedImpact: plan.expectedImpact,
      taskCount: plan.actions.length,
      sourceType: plan.sourceType,
      groupValue: plan.groupValue,
      datasetSourceLabel: plan.datasetSourceLabel
    }
  });
}

export function recordActionPlanUpdated(plan: LocalActionPlan, description?: string) {
  return journalEntry({
    id: `journal-action-plan-updated-${plan.id}-${plan.updatedAt}`,
    createdAt: plan.updatedAt,
    type: "action_plan_updated",
    title: `Plan d'action mis à jour : ${plan.title}`,
    description: description ?? `Statut du plan : ${plan.status}.`,
    sourceType: "action_plan",
    sourceId: plan.id,
    priority: plan.priority,
    status: plan.status,
    relatedKpiIds: plan.relatedKpiIds,
    relatedRecommendationIds: plan.sourceRecommendationId ? [plan.sourceRecommendationId] : [],
    relatedActionPlanIds: [plan.id],
    relatedDatasetIds: plan.relatedDatasetIds,
    relatedGroupByInsightIds: plan.relatedGroupByInsightIds,
    relatedMemoryReferences: [],
    metadata: {
      owner: plan.owner,
      dueDate: plan.dueDate,
      expectedImpact: plan.expectedImpact
    }
  });
}

export function recordImpactMeasured(impact: LocalActionPlanImpact) {
  return journalEntry({
    id: `journal-impact-measured-${impact.id}`,
    createdAt: impact.measuredAt,
    type: "impact_measured",
    title: `Impact mesuré sur KPI ${impact.relatedKpiId}`,
    description: impact.interpretation,
    sourceType: "impact",
    sourceId: impact.id,
    status: impact.status,
    relatedKpiIds: [impact.relatedKpiId],
    relatedRecommendationIds: [],
    relatedActionPlanIds: [impact.actionPlanId],
    relatedMemoryReferences: [],
    metadata: {
      beforeValue: impact.beforeValue,
      afterValue: impact.afterValue,
      variation: impact.variation,
      trend: impact.trend
    }
  });
}

export function recordFeedbackRecorded(feedback: LocalRecommendationFeedback) {
  return journalEntry({
    id: `journal-feedback-recorded-${feedback.id}`,
    createdAt: feedback.updatedAt,
    type: "feedback_recorded",
    title: `Feedback enregistré sur recommandation ${feedback.recommendationId}`,
    description: feedback.comment ?? "Feedback métier structuré enregistré localement.",
    sourceType: "feedback",
    sourceId: feedback.id,
    status: feedback.relevance,
    relatedKpiIds: [],
    relatedRecommendationIds: [feedback.recommendationId],
    relatedActionPlanIds: feedback.linkedActionPlanId ? [feedback.linkedActionPlanId] : [],
    relatedMemoryReferences: [],
    metadata: {
      relevance: feedback.relevance,
      actionTaken: feedback.actionTaken,
      impactObserved: feedback.impactObserved
    }
  });
}

export function recordConfidenceCalculated(confidence: RecommendationConfidence) {
  return journalEntry({
    id: `journal-confidence-calculated-${confidence.recommendationId}`,
    createdAt: confidence.calculatedAt,
    type: "confidence_calculated",
    title: `Confiance calculée : ${confidence.score} %`,
    description: `Score de confiance déterministe ${confidence.level} calculé pour une recommandation Atlas.`,
    sourceType: "confidence",
    sourceId: confidence.recommendationId,
    status: confidence.level,
    confidenceScore: confidence.score,
    relatedKpiIds: [],
    relatedRecommendationIds: [confidence.recommendationId],
    relatedActionPlanIds: [],
    relatedMemoryReferences: [],
    metadata: {
      factorCount: confidence.factors.length,
      warningCount: confidence.warnings.length
    }
  });
}

export function recordMemoryKnowledgeApproved(item: AtlasKnowledgeItem) {
  return journalEntry({
    id: `journal-memory-knowledge-approved-${item.id}`,
    createdAt: item.approvedAt ?? now(),
    type: "memory_knowledge_approved",
    title: "Connaissance mémoire validée",
    description: item.value,
    sourceType: "memory",
    sourceId: item.id,
    status: item.status,
    relatedKpiIds: [],
    relatedRecommendationIds: [],
    relatedActionPlanIds: [],
    relatedMemoryReferences: [memoryReferenceFromKnowledge(item)],
    metadata: {
      sourceDocument: item.sourceDocument,
      knowledgeType: item.type
    }
  });
}

export function recordMemoryKnowledgeRejected(item: AtlasKnowledgeItem) {
  return journalEntry({
    id: `journal-memory-knowledge-rejected-${item.id}`,
    createdAt: item.rejectedAt ?? now(),
    type: "memory_knowledge_rejected",
    title: "Connaissance mémoire rejetée",
    description: item.value,
    sourceType: "memory",
    sourceId: item.id,
    status: item.status,
    relatedKpiIds: [],
    relatedRecommendationIds: [],
    relatedActionPlanIds: [],
    relatedMemoryReferences: [memoryReferenceFromKnowledge(item)],
    metadata: {
      sourceDocument: item.sourceDocument,
      knowledgeType: item.type
    }
  });
}
