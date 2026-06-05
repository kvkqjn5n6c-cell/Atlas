import type { DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";

const DATASET_FILTERS_KEY = "atlas-dataset-filter-sets-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseFilterSets(value: string | null): DatasetFilterSet[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && Array.isArray(item.filters)) : [];
  } catch (error) {
    console.warn("Atlas dataset filters: lecture localStorage impossible.", error);
    return [];
  }
}

function writeFilterSets(filterSets: DatasetFilterSet[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(DATASET_FILTERS_KEY, JSON.stringify(filterSets));
  } catch (error) {
    console.warn("Atlas dataset filters: sauvegarde localStorage impossible.", error);
  }
}

export function getDatasetFilterSets(): DatasetFilterSet[] {
  if (!canUseStorage()) return [];
  return safeParseFilterSets(window.localStorage.getItem(DATASET_FILTERS_KEY)).sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt)
  );
}

export function getDatasetFilterSetsByDatasetId(datasetId: string) {
  return getDatasetFilterSets().filter((filterSet) => filterSet.datasetId === datasetId);
}

export function saveDatasetFilterSet(filterSet: DatasetFilterSet) {
  const existing = getDatasetFilterSets().filter((item) => item.id !== filterSet.id);
  writeFilterSets([filterSet, ...existing]);
  return filterSet;
}

export function getDatasetFilterSetById(id: string) {
  return getDatasetFilterSets().find((filterSet) => filterSet.id === id);
}

export function deleteDatasetFilterSet(id: string) {
  writeFilterSets(getDatasetFilterSets().filter((filterSet) => filterSet.id !== id));
}

export function clearDatasetFilterSets() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DATASET_FILTERS_KEY);
}
