import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deletePreparedSqlSource as deletePreparedSqlSourceLocal,
  getPreparedSqlSourceById as getPreparedSqlSourceByIdLocal,
  getPreparedSqlSources,
  savePreparedSqlSource
} from "@/lib/local/sql-prepared-sources-store";
import type {
  PreparedSqlAvailableAtlasField,
  PreparedSqlMappedField,
  PreparedSqlPreview,
  PreparedSqlSource,
  PreparedSqlSourceBundle
} from "@/lib/connectors/sql/sql-prepared-source-types";
import type { SqlColumnInfo, SqlPreviewRow } from "@/lib/connectors/sql/sql-types";

let lastFallbackUsed = false;

export function wasPreparedSqlSourcesFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type PreparedSqlSourceRecord = {
  id: string;
  organizationId: string;
  connectionId: string;
  tableName: string;
  schema: string | null;
  displayName: string;
  mappingId: string;
  mappedFields: unknown;
  qualityScore: number;
  rowPreviewCount: number;
  availableAtlasFields: unknown;
  warnings: string[];
  preview: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function toMappedFields(value: unknown): PreparedSqlMappedField[] {
  return Array.isArray(value) ? value as PreparedSqlMappedField[] : [];
}

function toAvailableFields(value: unknown): PreparedSqlAvailableAtlasField[] {
  return Array.isArray(value) ? value as PreparedSqlAvailableAtlasField[] : [];
}

function toPreview(record: PreparedSqlSourceRecord): PreparedSqlPreview {
  const preview = typeof record.preview === "object" && record.preview !== null
    ? record.preview as Partial<PreparedSqlPreview>
    : {};

  return {
    sourceId: record.id,
    columns: Array.isArray(preview.columns) ? preview.columns as SqlColumnInfo[] : [],
    rows: Array.isArray(preview.rows) ? preview.rows as SqlPreviewRow[] : [],
    generatedAt: typeof preview.generatedAt === "string" ? preview.generatedAt : record.updatedAt.toISOString(),
    limitedTo: typeof preview.limitedTo === "number" ? preview.limitedTo : record.rowPreviewCount
  };
}

function toPreparedSqlSourceBundle(record: PreparedSqlSourceRecord): PreparedSqlSourceBundle {
  const source: PreparedSqlSource = {
    id: record.id,
    organizationId: record.organizationId,
    connectionId: record.connectionId,
    tableName: record.tableName,
    schema: record.schema ?? undefined,
    displayName: record.displayName,
    mappingId: record.mappingId,
    mappedFields: toMappedFields(record.mappedFields),
    qualityScore: record.qualityScore,
    rowPreviewCount: record.rowPreviewCount,
    availableAtlasFields: toAvailableFields(record.availableAtlasFields),
    warnings: record.warnings,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    persisted: false
  };

  return {
    source,
    preview: toPreview(record)
  };
}

function toPrismaData(bundle: PreparedSqlSourceBundle) {
  return {
    id: bundle.source.id,
    organizationId: bundle.source.organizationId,
    connectionId: bundle.source.connectionId,
    tableName: bundle.source.tableName,
    schema: bundle.source.schema,
    displayName: bundle.source.displayName,
    mappingId: bundle.source.mappingId,
    mappedFields: bundle.source.mappedFields,
    qualityScore: bundle.source.qualityScore,
    rowPreviewCount: bundle.source.rowPreviewCount,
    availableAtlasFields: bundle.source.availableAtlasFields,
    warnings: bundle.source.warnings,
    preview: bundle.preview,
    persistedSource: "prisma",
    metadata: {
      createdAt: bundle.source.createdAt,
      updatedAt: bundle.source.updatedAt
    }
  };
}

function localPreparedSourcesByOrganization(organizationId?: string) {
  return getPreparedSqlSources().filter((bundle) => !organizationId || bundle.source.organizationId === organizationId);
}

export async function getAllPreparedSqlSources(organizationId?: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return localPreparedSourcesByOrganization(organizationId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.preparedSqlSource.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toPreparedSqlSourceBundle);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAllPreparedSqlSources failed, falling back to localStorage.", error);
    return localPreparedSourcesByOrganization(organizationId);
  }
}

export async function getPreparedSqlSourceById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getPreparedSqlSourceByIdLocal(id) ?? null;

  try {
    const prisma = await getPrisma();
    const record = await prisma.preparedSqlSource.findUnique({ where: { id } });
    return record ? toPreparedSqlSourceBundle(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getPreparedSqlSourceById failed, falling back to localStorage.", error);
    return getPreparedSqlSourceByIdLocal(id) ?? null;
  }
}

export async function upsertPreparedSqlSource(bundle: PreparedSqlSourceBundle) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return savePreparedSqlSource(bundle);

  try {
    const prisma = await getPrisma();
    const record = await prisma.preparedSqlSource.upsert({
      where: { id: bundle.source.id },
      create: toPrismaData(bundle),
      update: toPrismaData(bundle)
    });
    return toPreparedSqlSourceBundle(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertPreparedSqlSource failed, falling back to localStorage.", error);
    return savePreparedSqlSource(bundle);
  }
}

export const createPreparedSqlSourceRecord = upsertPreparedSqlSource;
export const updatePreparedSqlSourceRecord = upsertPreparedSqlSource;

export async function deletePreparedSqlSource(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deletePreparedSqlSourceLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.preparedSqlSource.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deletePreparedSqlSource failed, falling back to localStorage.", error);
    deletePreparedSqlSourceLocal(id);
  }
}
