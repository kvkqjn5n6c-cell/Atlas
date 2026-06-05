import type { LocalActionPlan, LocalActionPlanStatus } from "@/types/local-action-plans";
import type { LocalRecommendation } from "@/types/local-recommendations";

function now() {
  return new Date().toISOString();
}

function taskId(recommendationId: string, index: number) {
  return `task-${recommendationId}-${index + 1}`;
}

export function buildLocalActionPlanFromRecommendation(recommendation: LocalRecommendation): LocalActionPlan {
  const createdAt = now();
  const firstAlertId = recommendation.relatedAlertIds[0];
  const isDatasetGroupByRecommendation = recommendation.sourceType === "dataset_groupby_insight";
  const description = [
    recommendation.summary,
    recommendation.groupValue ? `Groupe concerne : ${recommendation.groupValue}.` : "",
    recommendation.datasetSourceLabel ? `Source Dataset : ${recommendation.datasetSourceLabel}.` : ""
  ].filter(Boolean).join("\n");
  const tasks = recommendation.recommendedActions.length > 0
    ? recommendation.recommendedActions.map((action, index) => ({
        id: taskId(recommendation.id, index),
        label: action.label,
        description: action.description,
        status: "todo" as LocalActionPlanStatus,
        owner: action.ownerSuggestion,
        dueDate: action.timeframe
      }))
    : [{
        id: taskId(recommendation.id, 0),
        label: recommendation.title,
        description: recommendation.summary,
        status: "todo" as LocalActionPlanStatus
      }];

  return {
    id: `local-plan-${recommendation.id}`,
    organizationId: recommendation.organizationId,
    title: recommendation.title,
    description,
    sourceType: recommendation.sourceType,
    sourceRecommendationId: recommendation.id,
    sourceAlertId: firstAlertId,
    relatedKpiIds: recommendation.relatedKpiIds,
    relatedInsightIds: recommendation.relatedInsightIds,
    relatedDatasetIds: recommendation.relatedDatasetIds ?? [],
    relatedGroupByInsightIds: recommendation.relatedGroupByInsightIds ?? [],
    groupValue: recommendation.groupValue,
    datasetSourceLabel: recommendation.datasetSourceLabel,
    priority: recommendation.priority,
    status: "todo",
    owner: recommendation.recommendedActions[0]?.ownerSuggestion ?? "Responsable à définir",
    expectedImpact: recommendation.expectedImpact,
    actions: tasks,
    createdAt,
    updatedAt: createdAt,
    persisted: false
  };
}
