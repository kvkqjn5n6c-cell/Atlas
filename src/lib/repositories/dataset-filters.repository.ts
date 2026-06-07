import { isPrismaMode } from "@/lib/config/data-mode";
import type { DatasetFilter, DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import {
  deleteDatasetFilterSet as deleteDatasetFilterSetLocal,
  getDatasetFilterSetById as getDatasetFilterSetByIdLocal,
  getDatasetFilterSets,
  getDatasetFilterSetsByDatasetId,
  saveDatasetFilterSet
} from "@/lib/local/dataset-filters-store";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

let lastFallbackUsed = false;

export function wasDatasetFiltersFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type DatasetFilterSetRecord = {
  id: string;
  datasetId: string | null;
  name: string;
  filters: unknown;
  createdAt: Date;
};

function toFilters(value: unknown): DatasetFilter[] {
  return Array.isArray(value) ? value as DatasetFilter[] : [];
}

function toDatasetFilterSet(record: DatasetFilterSetRecord): DatasetFilterSet {
  return {
    id: record.id,
    name: record.name,
    datasetId: record.datasetId ?? undefined,
    filters: toFilters(record.filters),
    createdAt: record.createdAt.toISOString()
  };
}

function toPrismaData(filterSet: DatasetFilterSet, organizationId = DEFAULT_ORGANIZATION_ID) {
  return {
    id: filterSet.id,
    organizationId,
    datasetId: filterSet.datasetId,
    name: filterSet.name,
    filters: filterSet.filters,
    persistedSource: "prisma",
    metadata: {
      createdAt: filterSet.createdAt
    },
    createdAt: new Date(filterSet.createdAt)
  };
}

export async function getAllDatasetFilterSets() {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetFilterSets();

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetFilterSet.findMany({
      orderBy: { createdAt: "desc" }
    });
    return records.map(toDatasetFilterSet);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAllDatasetFilterSets failed, falling back to localStorage.", error);
    return getDatasetFilterSets();
  }
}

export async function getDatasetFilterSetById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetFilterSetByIdLocal(id) ?? null;

  try {
    const prisma = await getPrisma();
    const record = await prisma.datasetFilterSet.findUnique({ where: { id } });
    return record ? toDatasetFilterSet(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetFilterSetById failed, falling back to localStorage.", error);
    return getDatasetFilterSetByIdLocal(id) ?? null;
  }
}

export async function getDatasetFilterSetsByDataset(datasetId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetFilterSetsByDatasetId(datasetId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetFilterSet.findMany({
      where: { datasetId },
      orderBy: { createdAt: "desc" }
    });
    return records.map(toDatasetFilterSet);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetFilterSetsByDataset failed, falling back to localStorage.", error);
    return getDatasetFilterSetsByDatasetId(datasetId);
  }
}

export async function upsertDatasetFilterSet(filterSet: DatasetFilterSet, organizationId = DEFAULT_ORGANIZATION_ID) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return saveDatasetFilterSet(filterSet);

  try {
    const prisma = await getPrisma();
    const record = await prisma.datasetFilterSet.upsert({
      where: { id: filterSet.id },
      create: toPrismaData(filterSet, organizationId),
      update: {
        ...toPrismaData(filterSet, organizationId),
        updatedAt: new Date()
      }
    });
    return toDatasetFilterSet(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertDatasetFilterSet failed, falling back to localStorage.", error);
    return saveDatasetFilterSet(filterSet);
  }
}

export async function deleteDatasetFilterSet(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteDatasetFilterSetLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetFilterSet.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetFilterSet failed, falling back to localStorage.", error);
    deleteDatasetFilterSetLocal(id);
  }
}

export async function deleteDatasetFilterSetsByDatasetId(datasetId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    getDatasetFilterSetsByDatasetId(datasetId).forEach((filterSet) => deleteDatasetFilterSetLocal(filterSet.id));
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetFilterSet.deleteMany({ where: { datasetId } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetFilterSetsByDatasetId failed, falling back to localStorage.", error);
    getDatasetFilterSetsByDatasetId(datasetId).forEach((filterSet) => deleteDatasetFilterSetLocal(filterSet.id));
  }
}
