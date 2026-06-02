import { addJournalEntry } from "@/lib/local/decision-journal-store";
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
    relatedMemoryReferences: memoryReferencesFromLabels(recommendation.relatedMemoryReferences),
    metadata: {
      category: recommendation.category,
      effort: recommendation.effort,
      urgency: recommendation.urgency,
      expectedImpact: recommendation.expectedImpact
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
    relatedMemoryReferences: [],
    metadata: {
      owner: plan.owner,
      dueDate: plan.dueDate,
      expectedImpact: plan.expectedImpact,
      taskCount: plan.actions.length
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
