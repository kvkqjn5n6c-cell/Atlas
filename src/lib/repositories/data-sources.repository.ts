import { dataImportJobsMock } from "@/lib/mock/data-imports";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import { columnMappingsMock } from "@/lib/mock/data-imports";
import { isPrismaMode } from "@/lib/config/data-mode";
import type { DataSource, DataSourceStatus, DataSourceType } from "@/types/atlas";

let lastFallbackUsed = false;

export function wasDataSourcesFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

function toDataSource(record: {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  status: string;
  usage: string[];
  syncFrequency: string;
  lastSyncAt: Date | null;
}): DataSource {
  const typeMap: Record<string, DataSourceType> = {
    EXCEL: "excel",
    CSV: "csv",
    MYSQL: "mysql",
    POSTGRESQL: "postgresql",
    SQL_SERVER: "sql-server"
  };
  const statusMap: Record<string, DataSourceStatus> = {
    CONNECTED: "connected",
    TO_CHECK: "to-check",
    ERROR: "error",
    INACTIVE: "inactive"
  };

  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    type: typeMap[record.type] ?? "csv",
    status: statusMap[record.status] ?? "to-check",
    lastSync: record.lastSyncAt
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }).format(record.lastSyncAt)
      : "Non synchronisee",
    frequency:
      record.syncFrequency === "DAILY"
        ? "daily"
        : record.syncFrequency === "WEEKLY"
          ? "weekly"
          : record.syncFrequency === "MONTHLY"
            ? "monthly"
            : "manual",
    importedRows: 0,
    usage: record.usage.filter(
      (usage): usage is DataSource["usage"][number] =>
        ["CA", "marge", "activite", "tresorerie", "interventions", "qualite"].includes(usage)
    )
  };
}

export function getDataSourcesMock() {
  return dataSourcesMock;
}

export function getDataSourceByIdMock(id: string) {
  return dataSourcesMock.find((source) => source.id === id);
}

export function getDataSourcesByOrganizationMock(organizationId: string) {
  return dataSourcesMock.filter((source) => source.organizationId === organizationId);
}

export function getImportJobsByOrganization(organizationId: string) {
  return dataImportJobsMock.filter((job) => job.organizationId === organizationId);
}

export function getImportJobsByDataSource(dataSourceId: string) {
  return dataImportJobsMock.filter((job) => job.dataSourceId === dataSourceId);
}

export function getColumnMappingsByDataSource(dataSourceId: string) {
  return columnMappingsMock.filter((mapping) => mapping.dataSourceId === dataSourceId);
}

export async function getDataSources() {
  lastFallbackUsed = false;

  if (!isPrismaMode()) {
    return dataSourcesMock;
  }

  try {
    const prisma = await getPrisma();
    const records = await prisma.dataSource.findMany({ orderBy: { name: "asc" } });
    return records.map(toDataSource);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDataSources failed, falling back to mocks.", error);
    return dataSourcesMock;
  }
}

export async function getDataSourceById(id: string) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) {
    return getDataSourceByIdMock(id);
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.dataSource.findUnique({ where: { id } });
    return record ? toDataSource(record) : undefined;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDataSourceById failed, falling back to mock.", error);
    return getDataSourceByIdMock(id);
  }
}

export async function getDataSourcesByOrganization(organizationId: string) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) {
    return getDataSourcesByOrganizationMock(organizationId);
  }

  try {
    const prisma = await getPrisma();
    const records = await prisma.dataSource.findMany({
      where: { organizationId },
      orderBy: { name: "asc" }
    });
    return records.map(toDataSource);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn(
      "[DATA_MODE=prisma] getDataSourcesByOrganization failed, falling back to mocks.",
      error
    );
    return getDataSourcesByOrganizationMock(organizationId);
  }
}
