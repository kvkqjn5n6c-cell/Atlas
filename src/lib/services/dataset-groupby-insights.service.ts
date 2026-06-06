import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteDatasetGroupByInsight,
  deleteDatasetGroupByInsightsByAnalysisId,
  deleteDatasetGroupByInsightsByDatasetId,
  getAllDatasetGroupByInsights,
  getDatasetGroupByInsightById,
  getDatasetGroupByInsightsByAnalysisId,
  getDatasetGroupByInsightsByDatasetId,
  upsertDatasetGroupByInsight,
  upsertDatasetGroupByInsights,
  wasDatasetGroupByInsightsFallbackUsed
} from "@/lib/repositories/dataset-groupby-insights.repository";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";

function currentSource() {
  if (wasDatasetGroupByInsightsFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getDatasetGroupByInsightsData() {
  const data = await getAllDatasetGroupByInsights();
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetGroupByInsightByIdData(id: string) {
  const data = await getDatasetGroupByInsightById(id);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetGroupByInsightsByDatasetData(datasetId: string) {
  const data = await getDatasetGroupByInsightsByDatasetId(datasetId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function getDatasetGroupByInsightsByAnalysisData(groupByAnalysisId: string) {
  const data = await getDatasetGroupByInsightsByAnalysisId(groupByAnalysisId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function saveDatasetGroupByInsightData(insight: DatasetGroupByInsight, organizationId?: string) {
  const data = await upsertDatasetGroupByInsight(insight, organizationId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export async function saveDatasetGroupByInsightsData(insights: DatasetGroupByInsight[], organizationId?: string) {
  const data = await upsertDatasetGroupByInsights(insights, organizationId);
  return { data, source: currentSource(), warnings: [] as string[] };
}

export const createDatasetGroupByInsightData = saveDatasetGroupByInsightData;
export const updateDatasetGroupByInsightData = saveDatasetGroupByInsightData;

export async function deleteDatasetGroupByInsightData(id: string) {
  await deleteDatasetGroupByInsight(id);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}

export async function deleteDatasetGroupByInsightsByDatasetData(datasetId: string) {
  await deleteDatasetGroupByInsightsByDatasetId(datasetId);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}

export async function deleteDatasetGroupByInsightsByAnalysisData(groupByAnalysisId: string) {
  await deleteDatasetGroupByInsightsByAnalysisId(groupByAnalysisId);
  return { success: true, source: currentSource(), warnings: [] as string[] };
}
