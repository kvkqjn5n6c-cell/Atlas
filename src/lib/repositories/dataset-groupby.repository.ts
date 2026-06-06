import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteDatasetGroupByAnalysis as deleteDatasetGroupByAnalysisLocal,
  getDatasetGroupByAnalyses,
  getDatasetGroupByAnalysesByDatasetId,
  saveDatasetGroupByAnalysis
} from "@/lib/local/dataset-groupby-store";
import type {
  DatasetGroupByAggregation,
  DatasetGroupByAnalysis,
  DatasetGroupByDefinition,
  DatasetGroupByResult
} from "@/lib/datasets/dataset-groupby-types";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

let lastFallbackUsed = false;

export function wasDatasetGroupByFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type DatasetGroupByAnalysisRecord = {
  id: string;
  organizationId: string;
  datasetId: string;
  aggregation: string;
  field: string | null;
  groupedBy: unknown;
  results: unknown;
  warnings: string[];
  generatedAt: Date;
};

function toGroupedBy(value: unknown, datasetId: string): DatasetGroupByDefinition {
  if (typeof value === "object" && value !== null) return value as DatasetGroupByDefinition;

  return {
    id: `dataset-groupby-${datasetId}`,
    datasetId,
    field: "",
    label: "",
    createdAt: new Date().toISOString()
  };
}

function toResults(value: unknown): DatasetGroupByResult[] {
  return Array.isArray(value) ? value as DatasetGroupByResult[] : [];
}

function toDatasetGroupByAnalysis(record: DatasetGroupByAnalysisRecord): DatasetGroupByAnalysis {
  return {
    id: record.id,
    datasetId: record.datasetId,
    aggregation: record.aggregation as DatasetGroupByAggregation,
    field: record.field ?? undefined,
    groupedBy: toGroupedBy(record.groupedBy, record.datasetId),
    results: toResults(record.results),
    generatedAt: record.generatedAt.toISOString(),
    warnings: record.warnings,
    persisted: false
  };
}

function toPrismaData(analysis: DatasetGroupByAnalysis, organizationId = DEFAULT_ORGANIZATION_ID) {
  return {
    id: analysis.id,
    organizationId,
    datasetId: analysis.datasetId,
    aggregation: analysis.aggregation,
    field: analysis.field,
    groupedBy: analysis.groupedBy,
    results: analysis.results,
    summary: {
      groupCount: analysis.results.length,
      warningCount: analysis.warnings.length
    },
    warnings: analysis.warnings,
    generatedAt: new Date(analysis.generatedAt),
    persistedSource: "prisma",
    metadata: {
      generatedAt: analysis.generatedAt
    }
  };
}

export async function getAllDatasetGroupByAnalyses() {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetGroupByAnalyses();

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetGroupByAnalysis.findMany({
      orderBy: { generatedAt: "desc" }
    });
    return records.map(toDatasetGroupByAnalysis);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAllDatasetGroupByAnalyses failed, falling back to localStorage.", error);
    return getDatasetGroupByAnalyses();
  }
}

export async function getDatasetGroupByAnalysisById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetGroupByAnalyses().find((analysis) => analysis.id === id) ?? null;

  try {
    const prisma = await getPrisma();
    const record = await prisma.datasetGroupByAnalysis.findUnique({ where: { id } });
    return record ? toDatasetGroupByAnalysis(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetGroupByAnalysisById failed, falling back to localStorage.", error);
    return getDatasetGroupByAnalyses().find((analysis) => analysis.id === id) ?? null;
  }
}

export async function getDatasetGroupByAnalysesByDataset(datasetId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetGroupByAnalysesByDatasetId(datasetId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetGroupByAnalysis.findMany({
      where: { datasetId },
      orderBy: { generatedAt: "desc" }
    });
    return records.map(toDatasetGroupByAnalysis);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetGroupByAnalysesByDataset failed, falling back to localStorage.", error);
    return getDatasetGroupByAnalysesByDatasetId(datasetId);
  }
}

export async function upsertDatasetGroupByAnalysis(analysis: DatasetGroupByAnalysis, organizationId = DEFAULT_ORGANIZATION_ID) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return saveDatasetGroupByAnalysis(analysis);

  try {
    const prisma = await getPrisma();
    const record = await prisma.datasetGroupByAnalysis.upsert({
      where: { id: analysis.id },
      create: toPrismaData(analysis, organizationId),
      update: toPrismaData(analysis, organizationId)
    });
    return toDatasetGroupByAnalysis(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertDatasetGroupByAnalysis failed, falling back to localStorage.", error);
    return saveDatasetGroupByAnalysis(analysis);
  }
}

export const createDatasetGroupByAnalysis = upsertDatasetGroupByAnalysis;
export const updateDatasetGroupByAnalysis = upsertDatasetGroupByAnalysis;

export async function deleteDatasetGroupByAnalysis(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteDatasetGroupByAnalysisLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetGroupByAnalysis.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetGroupByAnalysis failed, falling back to localStorage.", error);
    deleteDatasetGroupByAnalysisLocal(id);
  }
}

export async function deleteDatasetGroupByAnalysesByDatasetId(datasetId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    getDatasetGroupByAnalysesByDatasetId(datasetId).forEach((analysis) => deleteDatasetGroupByAnalysisLocal(analysis.id));
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetGroupByAnalysis.deleteMany({ where: { datasetId } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetGroupByAnalysesByDatasetId failed, falling back to localStorage.", error);
    getDatasetGroupByAnalysesByDatasetId(datasetId).forEach((analysis) => deleteDatasetGroupByAnalysisLocal(analysis.id));
  }
}
