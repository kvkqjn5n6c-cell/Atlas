import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";

const ATLAS_DATASETS_KEY = "atlas-datasets-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseDatasets(value: string | null): AtlasDataset[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.id && Array.isArray(item.fields) && Array.isArray(item.records))
      : [];
  } catch (error) {
    console.warn("Atlas datasets: lecture localStorage impossible.", error);
    return [];
  }
}

function writeDatasets(datasets: AtlasDataset[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(ATLAS_DATASETS_KEY, JSON.stringify(datasets));
  } catch (error) {
    console.warn("Atlas datasets: sauvegarde localStorage impossible.", error);
  }
}

export function getDatasets(): AtlasDataset[] {
  if (!canUseStorage()) return [];
  return safeParseDatasets(window.localStorage.getItem(ATLAS_DATASETS_KEY)).sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt)
  );
}

export function saveDataset(dataset: AtlasDataset) {
  const existing = getDatasets().filter((item) => item.id !== dataset.id);
  writeDatasets([dataset, ...existing]);
  return dataset;
}

export function getDatasetById(id: string) {
  return getDatasets().find((dataset) => dataset.id === id);
}

export function deleteDataset(id: string) {
  writeDatasets(getDatasets().filter((dataset) => dataset.id !== id));
}

export function clearDatasets() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ATLAS_DATASETS_KEY);
}
