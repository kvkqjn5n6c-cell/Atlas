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
    description: recommendation.summary,
    sourceRecommendationId: recommendation.id,
    sourceAlertId: firstAlertId,
    relatedKpiIds: recommendation.relatedKpiIds,
    relatedInsightIds: recommendation.relatedInsightIds,
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
