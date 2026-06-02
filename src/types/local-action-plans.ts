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
  sourceRecommendationId?: string;
  sourceAlertId?: string;
  relatedKpiIds: string[];
  relatedInsightIds: string[];
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
