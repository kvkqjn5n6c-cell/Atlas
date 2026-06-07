"use server";

import { getDataMode } from "@/lib/config/data-mode";
import { getDecisionJournalData } from "@/lib/services/decision-journal.service";
import { getLocalActionPlansData } from "@/lib/services/local-action-plans.service";
import { getRecommendationFeedbackData } from "@/lib/services/recommendation-feedback.service";

export async function getHybridReadModeAction() {
  const dataMode = getDataMode();

  return {
    dataMode,
    prismaEnabled: dataMode === "prisma"
  };
}

export async function getDecisionJournalReadAction(organizationId: string) {
  return getDecisionJournalData(organizationId);
}

export async function getLocalActionPlansReadAction(organizationId: string) {
  return getLocalActionPlansData(organizationId);
}

export async function getRecommendationFeedbackReadAction(organizationId: string) {
  return getRecommendationFeedbackData(organizationId);
}
