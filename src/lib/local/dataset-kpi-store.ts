import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";

const DATASET_KPIS_KEY = "atlas-dataset-kpis-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseDefinitions(value: string | null): DatasetKpiDefinition[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.datasetId && item?.aggregation) : [];
  } catch (error) {
    console.warn("Atlas dataset KPIs: lecture localStorage impossible.", error);
    return [];
  }
}

function writeDefinitions(definitions: DatasetKpiDefinition[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(DATASET_KPIS_KEY, JSON.stringify(definitions));
  } catch (error) {
    console.warn("Atlas dataset KPIs: sauvegarde localStorage impossible.", error);
  }
}

export function getDatasetKpis(): DatasetKpiDefinition[] {
  if (!canUseStorage()) return [];
  return safeParseDefinitions(window.localStorage.getItem(DATASET_KPIS_KEY)).sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt)
  );
}

export function getDatasetKpisByDatasetId(datasetId: string) {
  return getDatasetKpis().filter((definition) => definition.datasetId === datasetId);
}

export function saveDatasetKpi(definition: DatasetKpiDefinition) {
  const existing = getDatasetKpis().filter((item) => item.id !== definition.id);
  writeDefinitions([definition, ...existing]);
  return definition;
}

export function getDatasetKpiById(id: string) {
  return getDatasetKpis().find((definition) => definition.id === id);
}

export function deleteDatasetKpi(id: string) {
  writeDefinitions(getDatasetKpis().filter((definition) => definition.id !== id));
}

export function clearDatasetKpis() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DATASET_KPIS_KEY);
}
