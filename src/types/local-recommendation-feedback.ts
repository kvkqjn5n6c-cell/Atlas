export type RecommendationRelevance = "relevant" | "not_relevant" | "unknown";

export type RecommendationActionTaken = "yes" | "no" | "planned";

export type RecommendationImpactObserved = "positive" | "neutral" | "negative" | "unknown";

export type LocalRecommendationFeedback = {
  id: string;
  recommendationId: string;
  createdAt: string;
  updatedAt: string;
  relevance: RecommendationRelevance;
  actionTaken: RecommendationActionTaken;
  comment?: string;
  linkedActionPlanId?: string;
  impactObserved: RecommendationImpactObserved;
  persisted: false;
};
