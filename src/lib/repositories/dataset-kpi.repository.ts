import { isPrismaMode } from "@/lib/config/data-mode";
import type { DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import {
  deleteDatasetKpi as deleteDatasetKpiLocal,
  getDatasetKpiById as getDatasetKpiByIdLocal,
  getDatasetKpis,
  getDatasetKpisByDatasetId,
  saveDatasetKpi
} from "@/lib/local/dataset-kpi-store";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

let lastFallbackUsed = false;

export function wasDatasetKpiFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type DatasetKpiDefinitionRecord = {
  id: string;
  datasetId: string;
  name: string;
  description: string;
  type: string;
  field: string;
  secondaryField: string | null;
  aggregation: string;
  targetValue: number | null;
  warningThreshold: number | null;
  criticalThreshold: number | null;
  filterSet: unknown;
  filteredRowCount: number | null;
  createdAt: Date;
};

function toFilterSet(value: unknown): DatasetFilterSet | undefined {
  return typeof value === "object" && value !== null ? value as DatasetFilterSet : undefined;
}

function toDatasetKpiDefinition(record: DatasetKpiDefinitionRecord): DatasetKpiDefinition {
  return {
    id: record.id,
    datasetId: record.datasetId,
    name: record.name,
    description: record.description,
    type: record.type as DatasetKpiDefinition["type"],
    field: record.field,
    secondaryField: record.secondaryField ?? undefined,
    aggregation: record.aggregation as DatasetKpiDefinition["aggregation"],
    targetValue: record.targetValue ?? undefined,
    warningThreshold: record.warningThreshold ?? undefined,
    criticalThreshold: record.criticalThreshold ?? undefined,
    filterSet: toFilterSet(record.filterSet),
    filteredRowCount: record.filteredRowCount ?? undefined,
    createdAt: record.createdAt.toISOString(),
    persisted: false
  };
}

function toPrismaData(definition: DatasetKpiDefinition, organizationId = DEFAULT_ORGANIZATION_ID) {
  return {
    id: definition.id,
    organizationId,
    datasetId: definition.datasetId,
    name: definition.name,
    description: definition.description,
    type: definition.type,
    field: definition.field,
    secondaryField: definition.secondaryField,
    aggregation: definition.aggregation,
    targetValue: definition.targetValue,
    warningThreshold: definition.warningThreshold,
    criticalThreshold: definition.criticalThreshold,
    filterSet: definition.filterSet,
    filteredRowCount: definition.filteredRowCount,
    persistedSource: "prisma",
    metadata: {
      createdAt: definition.createdAt
    },
    createdAt: new Date(definition.createdAt)
  };
}

export async function getAllDatasetKpiDefinitions() {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetKpis();

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetKpiDefinition.findMany({
      orderBy: { createdAt: "desc" }
    });
    return records.map(toDatasetKpiDefinition);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAllDatasetKpiDefinitions failed, falling back to localStorage.", error);
    return getDatasetKpis();
  }
}

export async function getDatasetKpiDefinitionById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetKpiByIdLocal(id) ?? null;

  try {
    const prisma = await getPrisma();
    const record = await prisma.datasetKpiDefinition.findUnique({ where: { id } });
    return record ? toDatasetKpiDefinition(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetKpiDefinitionById failed, falling back to localStorage.", error);
    return getDatasetKpiByIdLocal(id) ?? null;
  }
}

export async function getDatasetKpiDefinitionsByDataset(datasetId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getDatasetKpisByDatasetId(datasetId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.datasetKpiDefinition.findMany({
      where: { datasetId },
      orderBy: { createdAt: "desc" }
    });
    return records.map(toDatasetKpiDefinition);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDatasetKpiDefinitionsByDataset failed, falling back to localStorage.", error);
    return getDatasetKpisByDatasetId(datasetId);
  }
}

export async function upsertDatasetKpiDefinition(definition: DatasetKpiDefinition, organizationId = DEFAULT_ORGANIZATION_ID) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return saveDatasetKpi(definition);

  try {
    const prisma = await getPrisma();
    const record = await prisma.datasetKpiDefinition.upsert({
      where: { id: definition.id },
      create: toPrismaData(definition, organizationId),
      update: {
        ...toPrismaData(definition, organizationId),
        updatedAt: new Date()
      }
    });
    return toDatasetKpiDefinition(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertDatasetKpiDefinition failed, falling back to localStorage.", error);
    return saveDatasetKpi(definition);
  }
}

export async function deleteDatasetKpiDefinition(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteDatasetKpiLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetKpiDefinition.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetKpiDefinition failed, falling back to localStorage.", error);
    deleteDatasetKpiLocal(id);
  }
}

export async function deleteDatasetKpiDefinitionsByDatasetId(datasetId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    getDatasetKpisByDatasetId(datasetId).forEach((definition) => deleteDatasetKpiLocal(definition.id));
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.datasetKpiDefinition.deleteMany({ where: { datasetId } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDatasetKpiDefinitionsByDatasetId failed, falling back to localStorage.", error);
    getDatasetKpisByDatasetId(datasetId).forEach((definition) => deleteDatasetKpiLocal(definition.id));
  }
}
