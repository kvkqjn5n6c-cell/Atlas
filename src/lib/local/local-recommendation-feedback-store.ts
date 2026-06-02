import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";

const LOCAL_RECOMMENDATION_FEEDBACK_KEY = "atlas-local-recommendation-feedback-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseFeedback(value: string | null): LocalRecommendationFeedback[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string") : [];
  } catch (error) {
    console.warn("Atlas recommendation feedback: lecture localStorage impossible.", error);
    return [];
  }
}

function writeFeedback(feedback: LocalRecommendationFeedback[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(LOCAL_RECOMMENDATION_FEEDBACK_KEY, JSON.stringify(feedback));
  } catch (error) {
    console.warn("Atlas recommendation feedback: sauvegarde localStorage impossible.", error);
  }
}

export function getRecommendationFeedback() {
  if (!canUseStorage()) return [];
  return safeParseFeedback(window.localStorage.getItem(LOCAL_RECOMMENDATION_FEEDBACK_KEY)).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function saveRecommendationFeedback(feedback: LocalRecommendationFeedback) {
  const feedbackItems = getRecommendationFeedback();
  const now = new Date().toISOString();
  const existing = feedbackItems.find((item) => item.id === feedback.id);
  const nextFeedback = {
    ...feedback,
    createdAt: existing?.createdAt ?? feedback.createdAt ?? now,
    updatedAt: now,
    persisted: false as const
  };

  writeFeedback([nextFeedback, ...feedbackItems.filter((item) => item.id !== feedback.id)]);
  return nextFeedback;
}

export function getRecommendationFeedbackByRecommendationId(recommendationId: string) {
  return getRecommendationFeedback().find((feedback) => feedback.recommendationId === recommendationId);
}

export function updateRecommendationFeedback(feedback: LocalRecommendationFeedback) {
  return saveRecommendationFeedback(feedback);
}

export function deleteRecommendationFeedback(id: string) {
  writeFeedback(getRecommendationFeedback().filter((feedback) => feedback.id !== id));
}

export function clearRecommendationFeedback() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(LOCAL_RECOMMENDATION_FEEDBACK_KEY);
}
