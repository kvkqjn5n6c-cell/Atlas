import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";

const DATASET_GROUPBY_INSIGHTS_KEY = "atlas-dataset-groupby-insights-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseInsights(value: string | null): DatasetGroupByInsight[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.groupByAnalysisId) : [];
  } catch (error) {
    console.warn("Atlas dataset group by insights: lecture localStorage impossible.", error);
    return [];
  }
}

function writeInsights(insights: DatasetGroupByInsight[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(DATASET_GROUPBY_INSIGHTS_KEY, JSON.stringify(insights));
  } catch (error) {
    console.warn("Atlas dataset group by insights: sauvegarde localStorage impossible.", error);
  }
}

export function getGroupByInsights(): DatasetGroupByInsight[] {
  if (!canUseStorage()) return [];
  return safeParseInsights(window.localStorage.getItem(DATASET_GROUPBY_INSIGHTS_KEY)).sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt)
  );
}

export function getGroupByInsightsByAnalysisId(analysisId: string) {
  return getGroupByInsights().filter((insight) => insight.groupByAnalysisId === analysisId);
}

export function saveGroupByInsights(insights: DatasetGroupByInsight[]) {
  const analysisIds = new Set(insights.map((insight) => insight.groupByAnalysisId));
  const existing = getGroupByInsights().filter((insight) => !analysisIds.has(insight.groupByAnalysisId));
  writeInsights([...insights, ...existing]);
  return insights;
}

export function deleteGroupByInsightsByAnalysisId(analysisId: string) {
  writeInsights(getGroupByInsights().filter((insight) => insight.groupByAnalysisId !== analysisId));
}

export function clearGroupByInsights() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DATASET_GROUPBY_INSIGHTS_KEY);
}
