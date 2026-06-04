import { normalizeSqlConnectionConfig } from "@/lib/connectors/sql/sql-connector";
import type { SqlConnectionConfig } from "@/lib/connectors/sql/sql-types";

const SQL_CONNECTIONS_KEY = "atlas-sql-connections-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseConnections(value: string | null): SqlConnectionConfig[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.name === "string") : [];
  } catch (error) {
    console.warn("Atlas SQL connector: lecture localStorage impossible.", error);
    return [];
  }
}

function writeConnections(connections: SqlConnectionConfig[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(SQL_CONNECTIONS_KEY, JSON.stringify(connections));
  } catch (error) {
    console.warn("Atlas SQL connector: sauvegarde localStorage impossible.", error);
  }
}

export function getSqlConnections(): SqlConnectionConfig[] {
  if (!canUseStorage()) return [];
  return safeParseConnections(window.localStorage.getItem(SQL_CONNECTIONS_KEY)).sort((first, second) =>
    (second.updatedAt ?? "").localeCompare(first.updatedAt ?? "")
  );
}

export function saveSqlConnection(config: SqlConnectionConfig) {
  const connection = normalizeSqlConnectionConfig(config);
  const existing = getSqlConnections().filter((item) => item.id !== connection.id);
  writeConnections([connection, ...existing]);
  return connection;
}

export function deleteSqlConnection(id: string) {
  writeConnections(getSqlConnections().filter((item) => item.id !== id));
}

export function clearSqlConnections() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SQL_CONNECTIONS_KEY);
}
