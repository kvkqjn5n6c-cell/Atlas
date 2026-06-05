export type PriorityUrgency = "low" | "medium" | "high" | "critical";

export type PriorityImpact = "low" | "medium" | "high";

export type LocalPrioritySourceType =
  | "kpi"
  | "alert"
  | "recommendation"
  | "confidence"
  | "action_plan"
  | "impact"
  | "feedback"
  | "journal"
  | "memory"
  | "dataset_groupby_insight";

export type LocalPriorityItem = {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  rank: number;
  priorityScore: number;
  urgency: PriorityUrgency;
  impact: PriorityImpact;
  confidenceScore?: number;
  category: string;
  sourceTypes: LocalPrioritySourceType[];
  relatedKpiIds: string[];
  relatedAlertIds: string[];
  relatedRecommendationIds: string[];
  relatedActionPlanIds: string[];
  relatedDatasetIds?: string[];
  relatedGroupByInsightIds?: string[];
  relatedMemoryReferences: string[];
  recommendedNextAction: string;
  reasons: string[];
  warnings: string[];
  createdAt: string;
  persisted: false;
};
