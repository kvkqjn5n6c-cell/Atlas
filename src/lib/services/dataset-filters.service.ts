import { isPrismaMode } from "@/lib/config/data-mode";
import type { DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import {
  deleteDatasetFilterSet,
  deleteDatasetFilterSetsByDatasetId,
  getAllDatasetFilterSets,
  getDatasetFilterSetById,
  getDatasetFilterSetsByDataset,
  upsertDatasetFilterSet,
  wasDatasetFiltersFallbackUsed
} from "@/lib/repositories/dataset-filters.repository";

function currentSource() {
  if (wasDatasetFiltersFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getDatasetFilterSetsData() {
  const data = await getAllDatasetFilterSets();
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetFilterSetByIdData(id: string) {
  const data = await getDatasetFilterSetById(id);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetFilterSetsByDatasetData(datasetId: string) {
  const data = await getDatasetFilterSetsByDataset(datasetId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function saveDatasetFilterSetData(filterSet: DatasetFilterSet, organizationId?: string) {
  const data = await upsertDatasetFilterSet(filterSet, organizationId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export const createDatasetFilterSetData = saveDatasetFilterSetData;
export const updateDatasetFilterSetData = saveDatasetFilterSetData;

export async function deleteDatasetFilterSetData(id: string) {
  await deleteDatasetFilterSet(id);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}

export async function deleteDatasetFilterSetsByDatasetData(datasetId: string) {
  await deleteDatasetFilterSetsByDatasetId(datasetId);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}
