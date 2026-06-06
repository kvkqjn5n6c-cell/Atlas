import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteGroupByInsight as deleteGroupByInsightLocal,
  deleteGroupByInsightsByAnalysisId as deleteGroupByInsightsByAnalysisIdLocal,
  getGroupByInsights,
  getGroupByInsightsByAnalysisId,
  saveGroupByInsights
} from "@/lib/local/dataset-groupby-insights-store";
import type {
  DatasetGroupByInsight,
  DatasetGroupByInsightSeverity,
  DatasetGroupByInsightType
} from "@/lib/datasets/dataset-groupby-insight-types";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

let lastFallbackUsed = false;

export function wasDatasetGroupByInsightsFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type DatasetGroupByInsightRecord = {
  id: string;
  organizationId: string;
  datasetId: string;
  groupByAnalysisId: string;
  title: string;
  summary: string;
  insightType: string;
  severity: string;
  groupValue: string;
  value: number;
  comparisonValue: number | null;
  gap: number | null;
  reasons: string[];
  recommendedAction: string | null;
  createdAt: Date;
};

function toDatasetGroupByInsight(record: DatasetGroupByInsightRecord): DatasetGroupByInsight {
  return {
    id: record.id,
    datasetId: record.datasetId,
    groupByAnalysisId: record.groupByAnalysisId,
    title: record.title,
    summary: record.summary,
    insightType: record.insightType as DatasetGroupByInsightType,
    severity: record.severity as DatasetGroupByInsightSeverity,
    groupValue: record.groupValue,
    value: record.value,
    comparisonValue: record.comparisonValue ?? undefined,
    gap: record.gap ?? undefined,
    reasons: record.reasons,
    recommendedAction: record.recommendedAction ?? undefined,
    createdAt: record.createdAt.toISOString(),
    persisted: false
  };
}

function toPrismaData(insight: DatasetGroupByInsight, organizationId = DEFAULT_ORGANIZATION_ID) {
  return {
    id: insight.id,
    organizationId,
    datasetId: insight.datasetId,
    groupByAnalysisId: insight.groupByAnalysisId,
    title: insight.title,
    summary: insight.summary,
    insightType: insight.insightType,
    severity: insight.severity,
    groupValue: insight.groupValue,
    value: insight.value,
    comparisonValue: insight.comparisonValue,
    gap: insight.gap,
    reasons: insight.reasons,
    recommendedAction: insight.recommendedAction,
    persistedSource: "prisma",
    metadata: {
      createdAt: insight.createdAt
    }
  };
}

export async function getAllDatasetGroupByInsights() {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getGroupByInsights();

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetGroupByInsight.findMany({
      orderBy: { createdAt: "desc" }
    });
    return records.map(toDatasetGroupByInsight);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAllDatasetGroupByInsights failed, falling back to localStorage.", error);
    return getGroupByInsights();
  }
}

export async function getDatasetGroupByInsightById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getGroupByInsights().find((insight) => insight.id === id) ?? null;

  try {
    const prisma = await getPrisma();
    const record = await prisma.datasetGroupByInsight.findUnique({ where: { id } });
    return record ? toDatasetGroupByInsight(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetGroupByInsightById failed, falling back to localStorage.", error);
    return getGroupByInsights().find((insight) => insight.id === id) ?? null;
  }
}

export async function getDatasetGroupByInsightsByDatasetId(datasetId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getGroupByInsights().filter((insight) => insight.datasetId === datasetId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetGroupByInsight.findMany({
      where: { datasetId },
      orderBy: { createdAt: "desc" }
    });
    return records.map(toDatasetGroupByInsight);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetGroupByInsightsByDatasetId failed, falling back to localStorage.", error);
    return getGroupByInsights().filter((insight) => insight.datasetId === datasetId);
  }
}

export async function getDatasetGroupByInsightsByAnalysisId(groupByAnalysisId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getGroupByInsightsByAnalysisId(groupByAnalysisId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetGroupByInsight.findMany({
      where: { groupByAnalysisId },
      orderBy: { createdAt: "desc" }
    });
    return records.map(toDatasetGroupByInsight);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetGroupByInsightsByAnalysisId failed, falling back to localStorage.", error);
    return getGroupByInsightsByAnalysisId(groupByAnalysisId);
  }
}

export async function upsertDatasetGroupByInsight(insight: DatasetGroupByInsight, organizationId = DEFAULT_ORGANIZATION_ID) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return saveGroupByInsights([insight])[0];

  try {
    const prisma = await getPrisma();
    const record = await prisma.datasetGroupByInsight.upsert({
      where: { id: insight.id },
      create: toPrismaData(insight, organizationId),
      update: toPrismaData(insight, organizationId)
    });
    return toDatasetGroupByInsight(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertDatasetGroupByInsight failed, falling back to localStorage.", error);
    return saveGroupByInsights([insight])[0];
  }
}

export async function upsertDatasetGroupByInsights(insights: DatasetGroupByInsight[], organizationId = DEFAULT_ORGANIZATION_ID) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return saveGroupByInsights(insights);

  try {
    const prisma = await getPrisma();
    const records = await Promise.all(insights.map((insight) =>
      prisma.datasetGroupByInsight.upsert({
        where: { id: insight.id },
        create: toPrismaData(insight, organizationId),
        update: toPrismaData(insight, organizationId)
      })
    ));
    return records.map(toDatasetGroupByInsight);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertDatasetGroupByInsights failed, falling back to localStorage.", error);
    return saveGroupByInsights(insights);
  }
}

export const createDatasetGroupByInsight = upsertDatasetGroupByInsight;
export const updateDatasetGroupByInsight = upsertDatasetGroupByInsight;

export async function deleteDatasetGroupByInsight(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteGroupByInsightLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetGroupByInsight.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetGroupByInsight failed, falling back to localStorage.", error);
    deleteGroupByInsightLocal(id);
  }
}

export async function deleteDatasetGroupByInsightsByDatasetId(datasetId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    const analysisIds = new Set(getGroupByInsights().filter((insight) => insight.datasetId === datasetId).map((insight) => insight.groupByAnalysisId));
    analysisIds.forEach((analysisId) => deleteGroupByInsightsByAnalysisIdLocal(analysisId));
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetGroupByInsight.deleteMany({ where: { datasetId } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetGroupByInsightsByDatasetId failed, falling back to localStorage.", error);
    const analysisIds = new Set(getGroupByInsights().filter((insight) => insight.datasetId === datasetId).map((insight) => insight.groupByAnalysisId));
    analysisIds.forEach((analysisId) => deleteGroupByInsightsByAnalysisIdLocal(analysisId));
  }
}

export async function deleteDatasetGroupByInsightsByAnalysisId(groupByAnalysisId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteGroupByInsightsByAnalysisIdLocal(groupByAnalysisId);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetGroupByInsight.deleteMany({ where: { groupByAnalysisId } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetGroupByInsightsByAnalysisId failed, falling back to localStorage.", error);
    deleteGroupByInsightsByAnalysisIdLocal(groupByAnalysisId);
  }
}
