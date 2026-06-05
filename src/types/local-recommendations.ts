export type RecommendationPriority = "low" | "medium" | "high" | "critical";

export type RecommendationCategory =
  | "cost"
  | "margin"
  | "cash"
  | "quality"
  | "operations"
  | "data_quality"
  | "strategy"
  | "commercial"
  | "risk";

export type RecommendationAction = {
  label: string;
  description: string;
  ownerSuggestion?: string;
  timeframe?: string;
};

export type RecommendationEvidence = {
  type: "kpi" | "alert" | "rule" | "insight" | "memory" | "history" | "summary" | "dataset_groupby_insight";
  label: string;
  value: string | number;
  source?: string;
};

export type LocalRecommendation = {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  sourceType: "kpi" | "alert" | "rule" | "insight" | "memory" | "summary" | "dataset_groupby_insight";
  relatedKpiIds: string[];
  relatedAlertIds: string[];
  relatedInsightIds: string[];
  relatedDatasetIds?: string[];
  relatedGroupByInsightIds?: string[];
  groupValue?: string;
  datasetSourceLabel?: string;
  relatedMemoryReferences: string[];
  evidence: RecommendationEvidence[];
  recommendedActions: RecommendationAction[];
  expectedImpact: string;
  effort: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high" | "immediate";
  createdAt: string;
  persisted: false;
};
