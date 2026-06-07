import { isPrismaMode } from "@/lib/config/data-mode";
import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import {
  deleteDatasetKpiDefinition,
  deleteDatasetKpiDefinitionsByDatasetId,
  getAllDatasetKpiDefinitions,
  getDatasetKpiDefinitionById,
  getDatasetKpiDefinitionsByDataset,
  upsertDatasetKpiDefinition,
  wasDatasetKpiFallbackUsed
} from "@/lib/repositories/dataset-kpi.repository";

function currentSource() {
  if (wasDatasetKpiFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getDatasetKpiDefinitionsData() {
  const data = await getAllDatasetKpiDefinitions();
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetKpiDefinitionByIdData(id: string) {
  const data = await getDatasetKpiDefinitionById(id);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetKpiDefinitionsByDatasetData(datasetId: string) {
  const data = await getDatasetKpiDefinitionsByDataset(datasetId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function saveDatasetKpiDefinitionData(definition: DatasetKpiDefinition, organizationId?: string) {
  const data = await upsertDatasetKpiDefinition(definition, organizationId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export const createDatasetKpiDefinitionData = saveDatasetKpiDefinitionData;
export const updateDatasetKpiDefinitionData = saveDatasetKpiDefinitionData;

export async function deleteDatasetKpiDefinitionData(id: string) {
  await deleteDatasetKpiDefinition(id);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}

export async function deleteDatasetKpiDefinitionsByDatasetData(datasetId: string) {
  await deleteDatasetKpiDefinitionsByDatasetId(datasetId);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}
