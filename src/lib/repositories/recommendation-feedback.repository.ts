import { isDecisionDomainPrismaPreferred, isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteRecommendationFeedback as deleteRecommendationFeedbackLocal,
  getRecommendationFeedback,
  getRecommendationFeedbackByRecommendationId as getRecommendationFeedbackByRecommendationIdLocal,
  saveRecommendationFeedback
} from "@/lib/local/local-recommendation-feedback-store";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";

let lastFallbackUsed = false;

export function wasRecommendationFeedbackFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type RecommendationFeedbackRecord = {
  id: string;
  recommendationId: string;
  relevance: string;
  actionTaken: string;
  comment: string | null;
  linkedActionPlanId: string | null;
  impactObserved: string;
  createdAt: Date;
  updatedAt: Date;
};

function toLocalFeedback(record: RecommendationFeedbackRecord): LocalRecommendationFeedback {
  return {
    id: record.id,
    recommendationId: record.recommendationId,
    relevance: record.relevance as LocalRecommendationFeedback["relevance"],
    actionTaken: record.actionTaken as LocalRecommendationFeedback["actionTaken"],
    comment: record.comment ?? undefined,
    linkedActionPlanId: record.linkedActionPlanId ?? undefined,
    impactObserved: record.impactObserved as LocalRecommendationFeedback["impactObserved"],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    persisted: false
  };
}

function toPrismaData(feedback: LocalRecommendationFeedback, organizationId: string) {
  return {
    id: feedback.id,
    organizationId,
    recommendationId: feedback.recommendationId,
    relevance: feedback.relevance,
    actionTaken: feedback.actionTaken,
    comment: feedback.comment,
    linkedActionPlanId: feedback.linkedActionPlanId,
    impactObserved: feedback.impactObserved,
    persistedSource: "prisma"
  };
}

export async function getRecommendationFeedbackByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isDecisionDomainPrismaPreferred()) return getRecommendationFeedback();

  try {
    const prisma = await getPrisma();
    const records = await prisma.localRecommendationFeedback.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toLocalFeedback);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getRecommendationFeedbackByOrganization failed, falling back to localStorage.", error);
    return getRecommendationFeedback();
  }
}

export async function getRecommendationFeedbackByRecommendationId(recommendationId: string, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isDecisionDomainPrismaPreferred()) return getRecommendationFeedbackByRecommendationIdLocal(recommendationId);

  try {
    const prisma = await getPrisma();
    const record = await prisma.localRecommendationFeedback.findFirst({
      where: {
        recommendationId,
        ...(organizationId ? { organizationId } : {})
      },
      orderBy: { updatedAt: "desc" }
    });
    return record ? toLocalFeedback(record) : undefined;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getRecommendationFeedbackByRecommendationId failed, falling back to localStorage.", error);
    return getRecommendationFeedbackByRecommendationIdLocal(recommendationId);
  }
}

export async function upsertRecommendationFeedback(feedback: LocalRecommendationFeedback, organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return saveRecommendationFeedback(feedback);

  try {
    const prisma = await getPrisma();
    const record = await prisma.localRecommendationFeedback.upsert({
      where: { id: feedback.id },
      create: toPrismaData(feedback, organizationId),
      update: toPrismaData(feedback, organizationId)
    });
    return toLocalFeedback(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertRecommendationFeedback failed, falling back to localStorage.", error);
    return saveRecommendationFeedback(feedback);
  }
}

export async function deleteRecommendationFeedback(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteRecommendationFeedbackLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.localRecommendationFeedback.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteRecommendationFeedback failed, falling back to localStorage.", error);
    deleteRecommendationFeedbackLocal(id);
  }
}
