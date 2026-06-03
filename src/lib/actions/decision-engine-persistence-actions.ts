"use server";

import {
  deleteLocalActionPlanData,
  saveLocalActionPlanData,
  updateLocalActionPlanData
} from "@/lib/services/local-action-plans.service";
import {
  deleteRecommendationFeedbackData,
  saveRecommendationFeedbackData
} from "@/lib/services/recommendation-feedback.service";
import {
  deleteDecisionJournalEntryData,
  saveDecisionJournalEntryData
} from "@/lib/services/decision-journal.service";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";

export async function saveLocalActionPlanAction(plan: LocalActionPlan) {
  const result = await saveLocalActionPlanData(plan);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function updateLocalActionPlanAction(plan: LocalActionPlan) {
  const result = await updateLocalActionPlanData(plan);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function deleteLocalActionPlanAction(id: string) {
  const result = await deleteLocalActionPlanData(id);
  return {
    success: true,
    source: result.source
  };
}

export async function saveRecommendationFeedbackAction(input: {
  organizationId: string;
  feedback: LocalRecommendationFeedback;
}) {
  const result = await saveRecommendationFeedbackData(input.feedback, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function deleteRecommendationFeedbackAction(id: string) {
  const result = await deleteRecommendationFeedbackData(id);
  return {
    success: true,
    source: result.source
  };
}

export async function saveDecisionJournalEntryAction(input: {
  organizationId: string;
  entry: DecisionJournalEntry;
}) {
  const result = await saveDecisionJournalEntryData(input.entry, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function deleteDecisionJournalEntryAction(id: string) {
  const result = await deleteDecisionJournalEntryData(id);
  return {
    success: true,
    source: result.source
  };
}
