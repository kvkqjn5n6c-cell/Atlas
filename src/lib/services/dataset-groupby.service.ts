import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteDatasetGroupByAnalysesByDatasetId,
  deleteDatasetGroupByAnalysis,
  getAllDatasetGroupByAnalyses,
  getDatasetGroupByAnalysesByDataset,
  getDatasetGroupByAnalysisById,
  upsertDatasetGroupByAnalysis,
  wasDatasetGroupByFallbackUsed
} from "@/lib/repositories/dataset-groupby.repository";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";

function currentSource() {
  if (wasDatasetGroupByFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getDatasetGroupByAnalysesData() {
  const data = await getAllDatasetGroupByAnalyses();
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetGroupByAnalysisByIdData(id: string) {
  const data = await getDatasetGroupByAnalysisById(id);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetGroupByAnalysesByDatasetData(datasetId: string) {
  const data = await getDatasetGroupByAnalysesByDataset(datasetId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function saveDatasetGroupByAnalysisData(analysis: DatasetGroupByAnalysis, organizationId?: string) {
  const data = await upsertDatasetGroupByAnalysis(analysis, organizationId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export const createDatasetGroupByAnalysisData = saveDatasetGroupByAnalysisData;
export const updateDatasetGroupByAnalysisData = saveDatasetGroupByAnalysisData;

export async function deleteDatasetGroupByAnalysisData(id: string) {
  await deleteDatasetGroupByAnalysis(id);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}

export async function deleteDatasetGroupByAnalysesByDatasetData(datasetId: string) {
  await deleteDatasetGroupByAnalysesByDatasetId(datasetId);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}
