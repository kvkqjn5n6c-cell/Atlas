import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteAtlasDataset,
  getAllAtlasDatasets,
  getAtlasDatasetById,
  upsertAtlasDataset,
  wasAtlasDatasetsFallbackUsed
} from "@/lib/repositories/atlas-datasets.repository";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";

function currentSource() {
  if (wasAtlasDatasetsFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getAtlasDatasetsData() {
  const data = await getAllAtlasDatasets();
  return { data, source: currentSource() };
}

export async function getAtlasDatasetByIdData(id: string) {
  const data = await getAtlasDatasetById(id);
  return { data, source: currentSource() };
}

export async function saveAtlasDatasetData(dataset: AtlasDataset, organizationId?: string) {
  const data = await upsertAtlasDataset(dataset, organizationId);
  return { data, source: currentSource() };
}

export const createAtlasDatasetData = saveAtlasDatasetData;
export const updateAtlasDatasetData = saveAtlasDatasetData;

export async function deleteAtlasDatasetData(id: string) {
  await deleteAtlasDataset(id);
  return { success: true, source: currentSource() };
}
