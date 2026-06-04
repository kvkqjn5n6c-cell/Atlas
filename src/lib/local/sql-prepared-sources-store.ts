import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";

const SQL_PREPARED_SOURCES_KEY = "atlas-sql-prepared-sources-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParsePreparedSources(value: string | null): PreparedSqlSourceBundle[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.source && item?.preview && Array.isArray(item.source.mappedFields))
      : [];
  } catch (error) {
    console.warn("Atlas SQL prepared sources: lecture localStorage impossible.", error);
    return [];
  }
}

function writePreparedSources(sources: PreparedSqlSourceBundle[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(SQL_PREPARED_SOURCES_KEY, JSON.stringify(sources));
  } catch (error) {
    console.warn("Atlas SQL prepared sources: sauvegarde localStorage impossible.", error);
  }
}

export function getPreparedSqlSources(): PreparedSqlSourceBundle[] {
  if (!canUseStorage()) return [];
  return safeParsePreparedSources(window.localStorage.getItem(SQL_PREPARED_SOURCES_KEY)).sort((first, second) =>
    second.source.updatedAt.localeCompare(first.source.updatedAt)
  );
}

export function savePreparedSqlSource(source: PreparedSqlSourceBundle) {
  const existing = getPreparedSqlSources().filter((item) => item.source.id !== source.source.id);
  const timestamp = new Date().toISOString();
  const savedSource: PreparedSqlSourceBundle = {
    source: {
      ...source.source,
      updatedAt: timestamp,
      persisted: false
    },
    preview: source.preview
  };

  writePreparedSources([savedSource, ...existing]);
  return savedSource;
}

export function getPreparedSqlSourceById(id: string) {
  return getPreparedSqlSources().find((source) => source.source.id === id);
}

export function deletePreparedSqlSource(id: string) {
  writePreparedSources(getPreparedSqlSources().filter((source) => source.source.id !== id));
}

export function clearPreparedSqlSources() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SQL_PREPARED_SOURCES_KEY);
}
