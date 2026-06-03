import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteRecommendationFeedback,
  getRecommendationFeedbackByOrganization,
  getRecommendationFeedbackByRecommendationId,
  upsertRecommendationFeedback,
  wasRecommendationFeedbackFallbackUsed
} from "@/lib/repositories/recommendation-feedback.repository";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";

function currentSource() {
  if (wasRecommendationFeedbackFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getRecommendationFeedbackData(organizationId: string) {
  const data = await getRecommendationFeedbackByOrganization(organizationId);
  return { data, source: currentSource() };
}

export async function getRecommendationFeedbackByRecommendationData(recommendationId: string, organizationId?: string) {
  const data = await getRecommendationFeedbackByRecommendationId(recommendationId, organizationId);
  return { data, source: currentSource() };
}

export async function saveRecommendationFeedbackData(feedback: LocalRecommendationFeedback, organizationId: string) {
  const data = await upsertRecommendationFeedback(feedback, organizationId);
  return { data, source: currentSource() };
}

export async function deleteRecommendationFeedbackData(id: string) {
  await deleteRecommendationFeedback(id);
  return { success: true, source: currentSource() };
}
