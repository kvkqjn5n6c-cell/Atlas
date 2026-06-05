import type { RecommendationPriority } from "@/types/local-recommendations";

export type LocalActionPlanStatus = "todo" | "in_progress" | "done" | "cancelled";

export type LocalActionPlanTask = {
  id: string;
  label: string;
  description?: string;
  status: LocalActionPlanStatus;
  owner?: string;
  dueDate?: string;
};

export type LocalActionPlan = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  sourceType?: "kpi" | "alert" | "rule" | "insight" | "memory" | "summary" | "dataset_groupby_insight";
  sourceRecommendationId?: string;
  sourceAlertId?: string;
  relatedKpiIds: string[];
  relatedInsightIds: string[];
  relatedDatasetIds?: string[];
  relatedGroupByInsightIds?: string[];
  groupValue?: string;
  datasetSourceLabel?: string;
  priority: RecommendationPriority;
  status: LocalActionPlanStatus;
  owner: string;
  dueDate?: string;
  expectedImpact: string;
  actions: LocalActionPlanTask[];
  createdAt: string;
  updatedAt: string;
  persisted: false;
};
