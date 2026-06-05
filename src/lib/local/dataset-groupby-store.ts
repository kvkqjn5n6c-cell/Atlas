import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";

const DATASET_GROUPBY_KEY = "atlas-dataset-groupby-analyses-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseAnalyses(value: string | null): DatasetGroupByAnalysis[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && Array.isArray(item.results)) : [];
  } catch (error) {
    console.warn("Atlas dataset group by: lecture localStorage impossible.", error);
    return [];
  }
}

function writeAnalyses(analyses: DatasetGroupByAnalysis[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(DATASET_GROUPBY_KEY, JSON.stringify(analyses));
  } catch (error) {
    console.warn("Atlas dataset group by: sauvegarde localStorage impossible.", error);
  }
}

export function getDatasetGroupByAnalyses(): DatasetGroupByAnalysis[] {
  if (!canUseStorage()) return [];
  return safeParseAnalyses(window.localStorage.getItem(DATASET_GROUPBY_KEY)).sort((first, second) =>
    second.generatedAt.localeCompare(first.generatedAt)
  );
}

export function getDatasetGroupByAnalysesByDatasetId(datasetId: string) {
  return getDatasetGroupByAnalyses().filter((analysis) => analysis.datasetId === datasetId);
}

export function saveDatasetGroupByAnalysis(analysis: DatasetGroupByAnalysis) {
  const existing = getDatasetGroupByAnalyses().filter((item) => item.id !== analysis.id);
  writeAnalyses([analysis, ...existing]);
  return analysis;
}

export function deleteDatasetGroupByAnalysis(id: string) {
  writeAnalyses(getDatasetGroupByAnalyses().filter((analysis) => analysis.id !== id));
}

export function clearDatasetGroupByAnalyses() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DATASET_GROUPBY_KEY);
}
