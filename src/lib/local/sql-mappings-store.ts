import type { SqlMappingBundle } from "@/lib/connectors/sql/sql-mapping-types";

const SQL_MAPPINGS_KEY = "atlas-sql-mappings-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseMappings(value: string | null): SqlMappingBundle[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.tableMapping && Array.isArray(item.columnMappings))
      : [];
  } catch (error) {
    console.warn("Atlas SQL mappings: lecture localStorage impossible.", error);
    return [];
  }
}

function writeMappings(mappings: SqlMappingBundle[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(SQL_MAPPINGS_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.warn("Atlas SQL mappings: sauvegarde localStorage impossible.", error);
  }
}

export function getSqlMappings(): SqlMappingBundle[] {
  if (!canUseStorage()) return [];
  return safeParseMappings(window.localStorage.getItem(SQL_MAPPINGS_KEY)).sort((first, second) =>
    second.tableMapping.updatedAt.localeCompare(first.tableMapping.updatedAt)
  );
}

export function saveSqlMapping(mapping: SqlMappingBundle) {
  const existing = getSqlMappings().filter((item) => item.tableMapping.id !== mapping.tableMapping.id);
  const savedMapping: SqlMappingBundle = {
    tableMapping: {
      ...mapping.tableMapping,
      updatedAt: new Date().toISOString(),
      persisted: false
    },
    columnMappings: mapping.columnMappings
  };
  writeMappings([savedMapping, ...existing]);
  return savedMapping;
}

export function getSqlMappingById(id: string) {
  return getSqlMappings().find((mapping) => mapping.tableMapping.id === id);
}

export function getSqlMappingsByConnectionId(connectionId: string) {
  return getSqlMappings().filter((mapping) => mapping.tableMapping.connectionId === connectionId);
}

export function deleteSqlMapping(id: string) {
  writeMappings(getSqlMappings().filter((mapping) => mapping.tableMapping.id !== id));
}

export function clearSqlMappings() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SQL_MAPPINGS_KEY);
}
