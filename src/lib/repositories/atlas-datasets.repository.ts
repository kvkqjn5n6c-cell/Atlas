import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteDataset as deleteAtlasDatasetLocal,
  getDatasetById as getAtlasDatasetByIdLocal,
  getDatasets,
  saveDataset
} from "@/lib/local/atlas-datasets-store";
import type { AtlasDataset, AtlasDatasetField, AtlasDatasetRecord } from "@/lib/datasets/atlas-dataset-types";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

let lastFallbackUsed = false;

export function wasAtlasDatasetsFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type PrismaAtlasDatasetRecord = {
  id: string;
  organizationId: string;
  sourceId: string;
  displayName: string;
  rowCount: number;
  fields: unknown;
  records: unknown;
  qualityScore: number;
  warnings: string[];
  createdAt: Date;
};

function toFields(value: unknown): AtlasDatasetField[] {
  return Array.isArray(value) ? value as AtlasDatasetField[] : [];
}

function toRecords(value: unknown): AtlasDatasetRecord[] {
  return Array.isArray(value) ? value as AtlasDatasetRecord[] : [];
}

function toAtlasDataset(record: PrismaAtlasDatasetRecord): AtlasDataset {
  return {
    id: record.id,
    sourceId: record.sourceId,
    displayName: record.displayName,
    rowCount: record.rowCount,
    fields: toFields(record.fields),
    records: toRecords(record.records),
    qualityScore: record.qualityScore,
    warnings: record.warnings,
    createdAt: record.createdAt.toISOString()
  };
}

function toPrismaData(dataset: AtlasDataset, organizationId = DEFAULT_ORGANIZATION_ID) {
  return {
    id: dataset.id,
    organizationId,
    sourceId: dataset.sourceId,
    displayName: dataset.displayName,
    rowCount: dataset.rowCount,
    fields: dataset.fields,
    records: dataset.records,
    qualityScore: dataset.qualityScore,
    warnings: dataset.warnings,
    persistedSource: "prisma",
    metadata: {
      createdAt: dataset.createdAt
    }
  };
}

export async function getAllAtlasDatasets() {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasets();

  try {
    const prisma = await getPrisma();
    const records = await prisma.atlasDataset.findMany({
      orderBy: { createdAt: "desc" }
    });
    return records.map(toAtlasDataset);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAllAtlasDatasets failed, falling back to localStorage.", error);
    return getDatasets();
  }
}

export async function getAtlasDatasetById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getAtlasDatasetByIdLocal(id) ?? null;

  try {
    const prisma = await getPrisma();
    const record = await prisma.atlasDataset.findUnique({ where: { id } });
    return record ? toAtlasDataset(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAtlasDatasetById failed, falling back to localStorage.", error);
    return getAtlasDatasetByIdLocal(id) ?? null;
  }
}

export async function upsertAtlasDataset(dataset: AtlasDataset, organizationId = DEFAULT_ORGANIZATION_ID) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return saveDataset(dataset);

  try {
    const prisma = await getPrisma();
    const record = await prisma.atlasDataset.upsert({
      where: { id: dataset.id },
      create: toPrismaData(dataset, organizationId),
      update: toPrismaData(dataset, organizationId)
    });
    return toAtlasDataset(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertAtlasDataset failed, falling back to localStorage.", error);
    return saveDataset(dataset);
  }
}

export const createAtlasDatasetRecord = upsertAtlasDataset;
export const updateAtlasDatasetRecord = upsertAtlasDataset;

export async function deleteAtlasDataset(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteAtlasDatasetLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.atlasDataset.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteAtlasDataset failed, falling back to localStorage.", error);
    deleteAtlasDatasetLocal(id);
  }
}
