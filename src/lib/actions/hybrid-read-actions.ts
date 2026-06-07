"use server";

import { getDataMode, getDecisionDomainReadStrategy, getPrimarySource } from "@/lib/config/data-mode";
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

export async function getDecisionDomainReadModeAction() {
  const dataMode = getDataMode();
  const primarySource = getPrimarySource();
  const readStrategy = getDecisionDomainReadStrategy();

  return {
    dataMode,
    primarySource,
    readStrategy,
    prismaPreferred: readStrategy === "PRISMA_PREFERRED" || readStrategy === "PRISMA_ONLY"
  };
}

export async function getPrimarySourceSettingsAction() {
  const dataMode = getDataMode();
  const primarySource = getPrimarySource();
  const readStrategy = getDecisionDomainReadStrategy();

  return {
    dataMode,
    primarySource,
    decisionDomains: [
      { id: "local_action_plans", label: "Plans d'action", readStrategy },
      { id: "decision_journal", label: "Journal decisionnel", readStrategy },
      { id: "recommendation_feedback", label: "Feedback recommandations", readStrategy }
    ]
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
