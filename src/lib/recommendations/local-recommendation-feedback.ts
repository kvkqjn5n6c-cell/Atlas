import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type {
  LocalRecommendationFeedback,
  RecommendationImpactObserved
} from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";

export type RecommendationFeedbackStats = {
  generatedCount: number;
  feedbackCount: number;
  relevanceRate: number;
  followRate: number;
  positiveImpactCount: number;
  negativeImpactCount: number;
};

export function calculateRecommendationFeedbackStats(
  recommendations: LocalRecommendation[],
  feedbackItems: LocalRecommendationFeedback[]
): RecommendationFeedbackStats {
  const recommendationIds = new Set(recommendations.map((recommendation) => recommendation.id));
  const scopedFeedback = feedbackItems.filter((feedback) => recommendationIds.has(feedback.recommendationId));
  const relevantCount = scopedFeedback.filter((feedback) => feedback.relevance === "relevant").length;
  const followedCount = scopedFeedback.filter((feedback) => feedback.actionTaken === "yes").length;

  return {
    generatedCount: recommendations.length,
    feedbackCount: scopedFeedback.length,
    relevanceRate: scopedFeedback.length === 0 ? 0 : Math.round((relevantCount / scopedFeedback.length) * 100),
    followRate: scopedFeedback.length === 0 ? 0 : Math.round((followedCount / scopedFeedback.length) * 100),
    positiveImpactCount: scopedFeedback.filter((feedback) => feedback.impactObserved === "positive").length,
    negativeImpactCount: scopedFeedback.filter((feedback) => feedback.impactObserved === "negative").length
  };
}

export function inferImpactObservedFromPlan(
  recommendation: LocalRecommendation,
  actionPlans: LocalActionPlan[],
  impacts: LocalActionPlanImpact[]
): RecommendationImpactObserved {
  const linkedPlan = actionPlans.find((plan) => plan.sourceRecommendationId === recommendation.id);
  if (!linkedPlan) return "unknown";

  const linkedImpact = impacts.find((impact) => impact.actionPlanId === linkedPlan.id);
  if (!linkedImpact) return "unknown";
  if (linkedImpact.status === "positive") return "positive";
  if (linkedImpact.status === "negative") return "negative";
  if (linkedImpact.status === "neutral") return "neutral";
  return "unknown";
}

export function buildEmptyRecommendationFeedback(
  recommendation: LocalRecommendation,
  actionPlans: LocalActionPlan[],
  impacts: LocalActionPlanImpact[]
): LocalRecommendationFeedback {
  const now = new Date().toISOString();
  const linkedPlan = actionPlans.find((plan) => plan.sourceRecommendationId === recommendation.id);

  return {
    id: `feedback-${recommendation.id}`,
    recommendationId: recommendation.id,
    createdAt: now,
    updatedAt: now,
    relevance: "unknown",
    actionTaken: linkedPlan ? "planned" : "no",
    linkedActionPlanId: linkedPlan?.id,
    impactObserved: inferImpactObservedFromPlan(recommendation, actionPlans, impacts),
    persisted: false
  };
}
