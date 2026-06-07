import { isDecisionDomainPrismaPreferred, isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteRecommendationFeedback,
  getRecommendationFeedbackByOrganization,
  getRecommendationFeedbackByRecommendationId,
  upsertRecommendationFeedback,
  wasRecommendationFeedbackFallbackUsed
} from "@/lib/repositories/recommendation-feedback.repository";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";

function currentReadSource() {
  if (wasRecommendationFeedbackFallbackUsed()) return "fallback" as const;
  return isDecisionDomainPrismaPreferred() ? "prisma" as const : "local" as const;
}

function currentWriteSource() {
  if (wasRecommendationFeedbackFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getRecommendationFeedbackData(organizationId: string) {
  const data = await getRecommendationFeedbackByOrganization(organizationId);
  return { data, source: currentReadSource() };
}

export async function getRecommendationFeedbackByRecommendationData(recommendationId: string, organizationId?: string) {
  const data = await getRecommendationFeedbackByRecommendationId(recommendationId, organizationId);
  return { data, source: currentReadSource() };
}

export async function saveRecommendationFeedbackData(feedback: LocalRecommendationFeedback, organizationId: string) {
  const data = await upsertRecommendationFeedback(feedback, organizationId);
  return { data, source: currentWriteSource() };
}

export async function deleteRecommendationFeedbackData(id: string) {
  await deleteRecommendationFeedback(id);
  return { success: true, source: currentWriteSource() };
}
