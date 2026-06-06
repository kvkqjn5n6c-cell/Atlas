import type { AtlasKnowledgeType, KnowledgeStatus } from "@/types/atlas-memory-knowledge";
import type { RecommendationPriority } from "@/types/local-recommendations";

export type DecisionJournalEntryType =
  | "recommendation_created"
  | "action_plan_created"
  | "action_plan_updated"
  | "impact_measured"
  | "feedback_recorded"
  | "confidence_calculated"
  | "memory_knowledge_approved"
  | "memory_knowledge_rejected"
  | "dataset_generated"
  | "dataset_kpi_created"
  | "dataset_analysis"
  | "groupby_insight"
  | "dataset_action_plan_created";

export type DecisionJournalSourceType =
  | "recommendation"
  | "action_plan"
  | "impact"
  | "feedback"
  | "confidence"
  | "memory"
  | "dataset"
  | "dataset_kpi"
  | "dataset_analysis"
  | "dataset_groupby_insight";

export type DecisionJournalMemoryReference = {
  sourceDocument?: string;
  knowledgeType?: AtlasKnowledgeType | string;
  value: string;
  status?: KnowledgeStatus | "approved" | "rejected";
};

export type DecisionJournalMetadataValue = string | number | boolean | null | undefined;

export type DecisionJournalEntry = {
  id: string;
  createdAt: string;
  type: DecisionJournalEntryType;
  title: string;
  description: string;
  sourceType: DecisionJournalSourceType;
  sourceId: string;
  priority?: RecommendationPriority | string;
  status?: string;
  confidenceScore?: number;
  relatedKpiIds: string[];
  relatedRecommendationIds: string[];
  relatedActionPlanIds: string[];
  relatedDatasetIds?: string[];
  relatedGroupByInsightIds?: string[];
  relatedMemoryReferences: DecisionJournalMemoryReference[];
  metadata: Record<string, DecisionJournalMetadataValue>;
};
